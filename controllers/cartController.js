const client = require("../db");

// Create cart table if not exists
const createCartTable = async () => {
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS cart (
        id SERIAL PRIMARY KEY,
        item_id INT NOT NULL,
        quantity INT NOT NULL,
        FOREIGN KEY (item_id) REFERENCES menu_items(item_id)
      )
    `);
    console.log("Cart table created successfully");
  } catch (err) {
    console.error("Error creating cart table:", err);
  }
};

// Get all cart items with price calculations
const getCartItems = async () => {
  try {
    const result = await client.query(`
      SELECT cart.item_id, menu_items.item_name, menu_items.price, cart.quantity
      FROM cart
      INNER JOIN menu_items ON cart.item_id = menu_items.item_id
    `);

    let totalPrice = result.rows.reduce((acc, item) => acc + item.price * item.quantity, 0);

    return { cartItems: result.rows, totalPrice };
  } catch (err) {
    console.error("Error fetching cart items:", err);
    throw err;
  }
};

// Add item to cart or update quantity if already exists
const addItemToCart = async (itemId, quantity) => {
  try {
    const itemCheck = await client.query("SELECT quantity FROM menu_items WHERE item_id = $1", [itemId]);

    if (itemCheck.rows.length === 0) throw new Error("Item not found");

    const availableQuantity = itemCheck.rows[0].quantity;
    if (availableQuantity < quantity) throw new Error("Not enough quantity available");

    const existingCartItem = await client.query("SELECT * FROM cart WHERE item_id = $1", [itemId]);

    if (existingCartItem.rows.length > 0) {
      await client.query("UPDATE cart SET quantity = quantity + $1 WHERE item_id = $2", [quantity, itemId]);
    } else {
      await client.query("INSERT INTO cart (item_id, quantity) VALUES ($1, $2)", [itemId, quantity]);
    }

    return "Item added to cart";
  } catch (err) {
    console.error("Error adding item to cart:", err);
    throw err;
  }
};

// Delete item from cart
const deleteCartItem = async (itemId) => {
  try {
    await client.query("DELETE FROM cart WHERE item_id = $1", [itemId]);
    return "Item deleted from cart";
  } catch (err) {
    console.error("Error deleting cart item:", err);
    throw err;
  }
};

// Place order logic
const placeOrder = async (customerId) => {
  try {
    if (!customerId) throw new Error("Customer not found");

    const result = await client.query(`
      SELECT cart.item_id, cart.quantity, menu_items.quantity AS available_quantity
      FROM cart
      INNER JOIN menu_items ON cart.item_id = menu_items.item_id
    `);

    const cartItems = result.rows;
    const insufficientItems = cartItems.filter((item) => item.quantity > item.available_quantity);

    if (insufficientItems.length > 0) throw new Error("Insufficient quantity available");

    await client.query(`DELETE FROM cart`);

    for (const item of cartItems) {
      await client.query(`UPDATE menu_items SET quantity = quantity - $1 WHERE item_id = $2`, [item.quantity, item.item_id]);
    }

    return "Order placed successfully";
  } catch (err) {
    console.error("Error placing order:", err);
    throw err;
  }
};

module.exports = {
  createCartTable,
  getCartItems,
  addItemToCart,
  deleteCartItem,
  placeOrder,
};
