const express = require("express");
const router = express.Router();
const { Client } = require("pg");

const client = new Client({
  host: "localhost",
  user: "postgres",
  port: 5432,
  password: "1704",
  database: "Restaurant",
});

client
  .connect()
  .then(() => {
    console.log("Connected to the database");
  })
  .catch((err) => {
    console.error("Error connecting to the database:", err);
  });
client
  .query(
    `
  CREATE TABLE IF NOT EXISTS cart (
    id SERIAL PRIMARY KEY,
    item_id INT NOT NULL,
    quantity INT NOT NULL,
    FOREIGN KEY (item_id) REFERENCES menu_items(item_id)
  )
`
  )
  .then(() => {
    console.log("Cart table created successfully");
  })
  .catch((err) => {
    console.error("Error creating cart table:", err);
  });
client
  .query(
    `
  CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL,
    item_id INT NOT NULL,
    quantity INT NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (item_id) REFERENCES menu_items(item_id)
  )
`
  )
  .then(() => {
    console.log("Order items table created successfully");
  })
  .catch((err) => {
    console.error("Error creating order items table:", err);
  });
router.post("/placeOrder", (req, res) => {
  const customerId = req.session.customerId;
  if (!customerId) {
    return res.status(400).send("Customer not found");
  }
  client.query(
    `
        SELECT cart.item_id, cart.quantity, menu_items.quantity AS available_quantity
        FROM cart
        INNER JOIN menu_items ON cart.item_id = menu_items.item_id
      `,
    (err, result) => {
      if (err) {
        console.error("Error checking item quantities:", err);
        return res.status(500).send("Error checking item quantities");
      }

      const cartItems = result.rows;
      const insufficientItems = cartItems.filter(
        (item) => item.quantity > item.available_quantity
      );

      if (insufficientItems.length > 0) {
        const insufficientItemNames = insufficientItems
          .map((item) => item.item_name)
          .join(", ");
        return res.status(400).send(`Insufficient quantity`);
      }
      client.query(
        `INSERT INTO orders (customer_id, total_price)
              SELECT $1, SUM(menu_items.price * cart.quantity)
              FROM cart
              INNER JOIN menu_items ON cart.item_id = menu_items.item_id
              RETURNING order_id`,
        [customerId],
        (err, result) => {
          if (err) {
            console.error("Error placing order:", err);
            res.status(500).send("Error placing order");
          } else {
            const orderId = result.rows[0].order_id;

            client.query(
              `INSERT INTO order_items (order_id, item_id, quantity)
                    SELECT $1, cart.item_id, cart.quantity
                    FROM cart`,
              [orderId],
              (err, result) => {
                if (err) {
                  console.error("Error adding order items:", err);
                  res.status(500).send("Error adding order items");
                } else {
                  client.query(
                    `
                        UPDATE menu_items 
                        SET quantity = GREATEST(0, menu_items.quantity - cart.quantity)
                        FROM cart
                        WHERE menu_items.item_id = cart.item_id
                      `,
                    (err, result) => {
                      if (err) {
                        console.error(
                          "Error updating menu item quantity:",
                          err
                        );
                        res
                          .status(500)
                          .send("Error updating menu item quantity");
                      } else {
                        client.query(`DELETE FROM cart`, (err, result) => {
                          if (err) {
                            console.error("Error emptying the cart:", err);
                            res.status(500).send("Error emptying the cart");
                          } else {
                            console.log("Cart emptied successfully");
                            res.redirect("/thankYou");
                          }
                        });
                      }
                    }
                  );
                }
              }
            );
          }
        }
      );
    }
  );
});

router.get("/", (req, res) => {
  client
    .query(
      `
      SELECT cart.item_id, menu_items.item_name, menu_items.price, cart.quantity
      FROM cart
      INNER JOIN menu_items ON cart.item_id = menu_items.item_id
    `
    )
    .then((result) => {
      const cartItems = result.rows;
      let totalPrice = 0;
      cartItems.forEach((item) => {
        totalPrice += item.price * item.quantity;
      });
      res.render("cart", { cartItems, totalPrice });
    })
    .catch((err) => {
      console.error("Error retrieving cart items:", err);
      res.status(500).send("Error retrieving cart items");
    });
});

router.post("/addItem", (req, res) => {
  const { itemId, quantity } = req.body;
  client
    .query("SELECT quantity FROM menu_items WHERE item_id = $1", [itemId])
    .then((result) => {
      if (result.rows.length === 0) {
        return res.status(404).send("Item not found");
      }

      const availableQuantity = result.rows[0].quantity;
      if (availableQuantity < quantity) {
        return res.status(400).send("Not enough quantity available");
      }
      client
        .query("SELECT * FROM cart WHERE item_id = $1", [itemId])
        .then((result) => {
          if (result.rows.length > 0) {
            client
              .query(
                "UPDATE cart SET quantity = quantity + $1 WHERE item_id = $2",
                [quantity, itemId]
              )
              .then(() => {
                console.log("Item quantity updated in the cart");
                res.redirect("/cart");
              })
              .catch((err) => {
                console.error("Error updating item quantity in cart:", err);
                res.status(500).send("Error updating item quantity in cart");
              });
          } else {
            client
              .query("INSERT INTO cart (item_id, quantity) VALUES ($1, $2)", [
                itemId,
                quantity,
              ])
              .then(() => {
                console.log("Item added to the cart");
                res.redirect("/cart");
              })
              .catch((err) => {
                console.error("Error adding item to cart:", err);
                res.status(500).send("Error adding item to cart");
              });
          }
        })
        .catch((err) => {
          console.error("Error checking item in cart:", err);
          res.status(500).send("Error checking item in cart");
        });
    })
    .catch((err) => {
      console.error("Error checking available quantity:", err);
      res.status(500).send("Error checking available quantity");
    });
});

router.post("/deleteItem", (req, res) => {
  const { itemId } = req.body;
  client
    .query("DELETE FROM cart WHERE item_id = $1", [itemId])
    .then(() => {
      console.log("Item deleted from the cart");
      res.redirect("/cart");
    })
    .catch((err) => {
      console.error("Error deleting item from cart:", err);
      res.status(500).send("Error deleting item from cart");
    });
});

module.exports = router;
