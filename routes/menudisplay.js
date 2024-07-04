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
  })
  .catch((err) => {
    console.error("Error connecting to the database:", err);
  });

router.get("/", (req, res) => {
  client
    .query("SELECT * FROM menu_items")
    .then((result) => {
      const menuItems = result.rows;
      res.render("menudisplay", { menuItems });
    })
    .catch((err) => {
      console.error("Error displaying menu items:", err);
      res.status(500).send("Error displaying menu items");
    });
});

module.exports = router;
