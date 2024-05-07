const express = require("express");
const { Client } = require("pg");
const router = express.Router();

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
    client
      .query(
        `
    CREATE TABLE IF NOT EXISTS menu_items (
      item_id SERIAL PRIMARY KEY,
      item_name VARCHAR(100) NOT NULL,
      description TEXT,
      price NUMERIC(10, 2) NOT NULL,
      quantity INT NOT NULL
    )
  `
      )
      .then(() => console.log("menu_items table created successfully"))
      .catch((err) => console.error("Error creating menu_items table:", err));
  })
  .catch((err) => {
    console.error("Error connecting to the database:", err);
  });
router.post("/increaseQuantity", (req, res) => {
  const itemId = req.body.itemId;
  const increaseAmount = req.body.increaseAmount;

  if (!increaseAmount || increaseAmount <= 0) {
    res.status(400).send("Invalid increase amount");
    return;
  }

  const increaseQuantityQuery = `
        UPDATE menu_items
        SET quantity = quantity + $1
        WHERE item_id = $2
    `;

  client
    .query(increaseQuantityQuery, [increaseAmount, itemId])
    .then(() => {
      console.log("Quantity increased successfully");
      res.redirect("/menu");
    })
    .catch((err) => {
      console.error("Error increasing quantity:", err);
      res.status(500).send("Error increasing quantity");
    });
});

router.get("/", (req, res) => {
  client
    .query("SELECT * FROM menu_items")
    .then((result) => {
      const menuItems = result.rows;
      let totalQuantity = 0;
      menuItems.forEach((item) => {
        totalQuantity += item.quantity;
      });

      res.render("menu", { menuItems, totalQuantity });
    })
    .catch((err) => {
      console.error("Error displaying menu items:", err);
      res.status(500).send("Error displaying menu items");
    });
});

router.post("/addMenuItem", (req, res) => {
  const { itemName, description, price, quantity } = req.body;

  const insertDataQuery = `
    INSERT INTO menu_items (item_name, description, price, quantity)
    VALUES ($1, $2, $3, $4)
  `;

  client
    .query(insertDataQuery, [itemName, description, price, quantity])
    .then(() => {
      console.log("Menu item added successfully");
      res.redirect("/menu");
    })
    .catch((err) => {
      console.error("Error adding menu item:", err);
      res.status(500).send("Error adding menu item");
    });
});

router.post("/deleteMenuItem", (req, res) => {
  const itemId = req.body.itemId;

  const deleteMenuItemQuery = `
    DELETE FROM menu_items
    WHERE item_id = $1
  `;

  client
    .query(deleteMenuItemQuery, [itemId])
    .then(() => {
      console.log("Menu item deleted successfully");
      res.redirect("/menu");
    })
    .catch((err) => {
      console.error("Error deleting menu item:", err);
      res.status(500).send("Error deleting menu item");
    });
});

module.exports = router;
