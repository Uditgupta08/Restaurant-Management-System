const client = require("../db");

const initializeTables = async () => {
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS menu_items (
        item_id SERIAL PRIMARY KEY,
        item_name VARCHAR(100) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        quantity INT NOT NULL CHECK (quantity >= 0)
      );
    `);
  } catch (error) {
    console.error("Error creating menu_items table:", error);
  }
};

initializeTables();
// Fetch menu items
const getMenuItems = async (req, res) => {
  try {
    const result = await client.query("SELECT * FROM menu_items");
    res.render("menu", { menuItems: result.rows });
  } catch (error) {
    console.error("Error fetching menu items:", error);
    res.status(500).send("Error fetching menu items");
  }
};

// Add a menu item
const addMenuItem = async (req, res) => {
  try {
    const { itemName, description, price, quantity } = req.body;
    const query = `INSERT INTO menu_items (item_name, description, price, quantity) VALUES ($1, $2, $3, $4)`;
    await client.query(query, [itemName, description, price, quantity]);
    res.redirect("/menu");
  } catch (error) {
    console.error("Error adding menu item:", error);
    res.status(500).send("Error adding menu item");
  }
};

// Delete a menu item
const deleteMenuItem = async (req, res) => {
  try {
    const itemId = req.body.itemId;
    await client.query("DELETE FROM menu_items WHERE item_id = $1", [itemId]);
    res.redirect("/menu");
  } catch (error) {
    console.error("Error deleting menu item:", error);
    res.status(500).send("Error deleting menu item");
  }
};

// Increase menu item quantity
const increaseQuantity = async (req, res) => {
  try {
    const { itemId, increaseAmount } = req.body;
    if (!increaseAmount || increaseAmount <= 0) {
      return res.status(400).send("Invalid increase amount");
    }

    await client.query("UPDATE menu_items SET quantity = quantity + $1 WHERE item_id = $2", [
      increaseAmount,
      itemId,
    ]);
    res.redirect("/menu");
  } catch (error) {
    console.error("Error increasing quantity:", error);
    res.status(500).send("Error increasing quantity");
  }
};

// Decrease menu item quantity
const decreaseQuantity = async (req, res) => {
  try {
    const { itemId, decreaseAmount } = req.body;
    if (!decreaseAmount || decreaseAmount <= 0) {
      return res.status(400).send("Invalid decrease amount");
    }

    // Ensure quantity does not go below 0
    await client.query(
      `UPDATE menu_items 
       SET quantity = GREATEST(0, quantity - $1) 
       WHERE item_id = $2`,
      [decreaseAmount, itemId]
    );

    res.redirect("/menu");
  } catch (error) {
    console.error("Error decreasing quantity:", error);
    res.status(500).send("Error decreasing quantity");
  }
};

module.exports = {
  getMenuItems,
  addMenuItem,
  deleteMenuItem,
  increaseQuantity,
  decreaseQuantity,
};
