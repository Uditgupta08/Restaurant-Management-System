const client = require("../db");

const createCustomerTable = async (req, res) => {
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS customer (
          customer_id SERIAL PRIMARY KEY,
          name VARCHAR(100),
          email VARCHAR(100) UNIQUE,
          phone_number VARCHAR(20),
          address TEXT
      );
    `);
    console.log("Customer table created successfully");
    res.render("land");
  } catch (err) {
    console.error("Error creating customer table:", err);
    res.status(500).send("Error creating customer table");
  }
};

const addCustomer = async (req, res) => {
  const { name, email, phone_number, address } = req.body;
  
  try {
    const validationResult = await client.query("SELECT no_special_char($1)", [name]);
    
    if (!validationResult.rows[0].no_special_char) {
      return res.status(400).send("Username cannot contain special characters");
    }

    const checkCustomerQuery = `SELECT * FROM customer WHERE email = $1`;
    const existingCustomer = await client.query(checkCustomerQuery, [email]);

    if (existingCustomer.rows.length > 0) {
      req.session.customerId = existingCustomer.rows[0].customer_id;
      return res.redirect("/menudisplay");
    }

    const insertDataQuery = `
      INSERT INTO customer (name, email, phone_number, address)
      VALUES ($1, $2, $3, $4)
      RETURNING customer_id`;
    const newCustomer = await client.query(insertDataQuery, [name, email, phone_number, address]);
    req.session.customerId = newCustomer.rows[0].customer_id;
    res.redirect("/menu");
  } catch (err) {
    console.error("Error processing customer:", err);
    res.status(500).send("Error processing customer");
  }
};

module.exports  = {
    createCustomerTable,
    addCustomer
}