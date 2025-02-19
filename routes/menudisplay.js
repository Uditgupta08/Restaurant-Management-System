const express = require("express");
const router = express.Router();
const client = require("../db");

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
