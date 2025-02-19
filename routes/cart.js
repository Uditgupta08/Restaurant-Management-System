// const express = require("express");
// const router = express.Router();
// const { Client } = require("pg");

// const client = new Client({
//   host: "localhost",
//   user: "postgres",
//   port: 5432,
//   password: "1704",
//   database: "Restaurant",
// });

// client
//   .connect()
//   .then(() => {
//     console.log("Connected to the database");
//   })
//   .catch((err) => {
//     console.error("Error connecting to the database:", err);
//   });

// client
//   .query(
//     `
//   CREATE TABLE IF NOT EXISTS cart (
//     id SERIAL PRIMARY KEY,
//     item_id INT NOT NULL,
//     quantity INT NOT NULL,
//     FOREIGN KEY (item_id) REFERENCES menu_items(item_id)
//   )
// `
//   )
//   .then(() => {
//     console.log("Cart table created successfully");
//   })
//   .catch((err) => {
//     console.error("Error creating cart table:", err);
//   });

// router.post("/placeOrder", (req, res) => {
//   const customerId = req.session.customerId;
//   if (!customerId) {
//     return res.status(400).send("Customer not found");
//   }

//   client.query(
//     `
//       SELECT cart.item_id, cart.quantity, menu_items.quantity AS available_quantity
//       FROM cart
//       INNER JOIN menu_items ON cart.item_id = menu_items.item_id
//     `,
//     (err, result) => {
//       if (err) {
//         console.error("Error checking item quantities:", err);
//         return res.status(500).send("Error checking item quantities");
//       }

//       const cartItems = result.rows;
//       const insufficientItems = cartItems.filter(
//         (item) => item.quantity > item.available_quantity
//       );

//       if (insufficientItems.length > 0) {
//         return res.status(400).send(`Insufficient quantity`);
//       }
//       client.query(`DELETE FROM cart`, (err, result) => {
//         if (err) {
//           console.error("Error emptying the cart:", err);
//           return res.status(500).send("Error emptying the cart");
//         }
//         console.log("Cart emptied successfully");
//         res.redirect("/thankYou");
//         cartItems.forEach((item) => {
//           client.query(
//             `UPDATE menu_items 
//                SET quantity = quantity - $1
//                WHERE item_id = $2`,
//             [item.quantity, item.item_id],
//             (err, result) => {
//               if (err) {
//                 console.error("Error updating item quantity:", err);
//               } else {
//                 console.log("Item quantity updated successfully");
//               }
//             }
//           );
//         });
//       });
//     }
//   );
// });

// router.get("/", (req, res) => {
//   client
//     .query(
//       `
//       SELECT cart.item_id, menu_items.item_name, menu_items.price, cart.quantity
//       FROM cart
//       INNER JOIN menu_items ON cart.item_id = menu_items.item_id
//     `
//     )
//     .then((result) => {
//       const cartItems = result.rows;
//       let totalPrice = 0;
//       cartItems.forEach((item) => {
//         totalPrice += item.price * item.quantity;
//       });
//       res.render("cart", { cartItems, totalPrice });
//     })
//     .catch((err) => {
//       console.error("Error displaying cart items:", err);
//       res.status(500).send("Error displaying cart items");
//     });
// });

// router.post("/addItem", (req, res) => {
//   const { itemId, quantity } = req.body;
//   client
//     .query("SELECT quantity FROM menu_items WHERE item_id = $1", [itemId])
//     .then((result) => {
//       if (result.rows.length === 0) {
//         return res.status(404).send("Item not found");
//       }

//       const availableQuantity = result.rows[0].quantity;
//       if (availableQuantity < quantity) {
//         return res.status(400).send("Not enough quantity available");
//       }
//       client
//         .query("SELECT * FROM cart WHERE item_id = $1", [itemId])
//         .then((result) => {
//           if (result.rows.length > 0) {
//             client
//               .query(
//                 "UPDATE cart SET quantity = quantity + $1 WHERE item_id = $2",
//                 [quantity, itemId]
//               )
//               .then(() => {
//                 console.log("Item quantity updated in the cart");
//                 res.redirect("/cart");
//               })
//               .catch((err) => {
//                 console.error("Error updating item quantity in cart:", err);
//                 res.status(500).send("Error updating item quantity in cart");
//               });
//           } else {
//             client
//               .query("INSERT INTO cart (item_id, quantity) VALUES ($1, $2)", [
//                 itemId,
//                 quantity,
//               ])
//               .then(() => {
//                 console.log("Item added to the cart");
//                 res.redirect("/cart");
//               })
//               .catch((err) => {
//                 console.error("Error adding item to cart:", err);
//                 res.status(500).send("Error adding item to cart");
//               });
//           }
//         })
//         .catch((err) => {
//           console.error("Error checking item in cart:", err);
//           res.status(500).send("Error checking item in cart");
//         });
//     })
//     .catch((err) => {
//       console.error("Error checking available quantity:", err);
//       res.status(500).send("Error checking available quantity");
//     });
// });

// router.post("/deleteItem", (req, res) => {
//   const { itemId } = req.body;
//   client
//     .query("DELETE FROM cart WHERE item_id = $1", [itemId])
//     .then(() => {
//       console.log("Item deleted from the cart");
//       res.redirect("/cart");
//     })
//     .catch((err) => {
//       console.error("Error deleting item from cart:", err);
//       res.status(500).send("Error deleting item from cart");
//     });
// });

// module.exports = router;


const express = require("express");
const router = express.Router();
const { getCartItems, 
  addItemToCart,
  deleteCartItem, 
  placeOrder
  } = require("../controllers/cartController");

// Get cart items
router.get("/", async (req, res) => {
  try {
    const { cartItems, totalPrice } = await getCartItems();
    res.render("cart", { cartItems, totalPrice });
  } catch (err) {
    res.status(500).send("Error displaying cart items");
  }
});

// Add item to cart
router.post("/addItem", async (req, res) => {
  try {
    await addItemToCart(req.body.itemId, req.body.quantity);
    res.redirect("/cart");
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Delete item from cart
router.post("/deleteItem", async (req, res) => {
  try {
    await deleteCartItem(req.body.itemId);
    res.redirect("/cart");
  } catch (err) {
    res.status(500).send("Error deleting item from cart");
  }
});

// Place order
router.post("/placeOrder", async (req, res) => {
  try {
    await placeOrder(req.session.customerId);
    res.redirect("/thankYou");
  } catch (err) {
    res.status(400).send(err.message);
  }
});

module.exports = router;
