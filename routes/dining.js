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
    createTables();
  })
  .catch((err) => {
    console.error("Error connecting to the database:", err);
  });

const createTables = () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS dining (
      table_id SERIAL PRIMARY KEY,
      table_name VARCHAR(100) UNIQUE NOT NULL,
      seating_capacity INTEGER NOT NULL,
      occupied BOOLEAN DEFAULT false
    )
  `;
  client
    .query(createTableQuery)
    .then((result) => {
      console.log("Dining table created successfully");
    })
    .catch((error) => {
      console.error("Error creating dining table:", error);
    });
  const createReservation = `
    CREATE TABLE IF NOT EXISTS reservation (
      reservation_id SERIAL PRIMARY KEY,
      table_id INTEGER REFERENCES dining(table_id),
      customer_id INTEGER REFERENCES customer(customer_id),
      reservation_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
  `;
  client
    .query(createReservation)
    .then((result) => {
      console.log("Reservation table created successfully");
    })
    .catch((error) => {
      console.error("Error creating dining table:", error);
    });
};

router.get("/", async (req, res) => {
  try {
    const tablesQuery = "SELECT * FROM dining";
    const tablesResult = await client.query(tablesQuery);

    res.render("dining", { tables: tablesResult.rows });
  } catch (error) {
    console.error("Error fetching dining tables:", error);
    res.status(500).send("Error fetching dining tables");
  }
});

router.post("/add", async (req, res) => {
  try {
    const { tableName, seatingCapacity } = req.body;
    const insertTableQuery = `
          INSERT INTO dining (table_name, seating_capacity)
          VALUES ($1, $2)
      `;
    await client.query(insertTableQuery, [tableName, seatingCapacity]);

    res.redirect("/dining");
  } catch (error) {
    console.error("Error adding dining table:", error);
    res.status(500).send("Error adding dining table");
  }
});

router.post("/delete/:id", async (req, res) => {
  try {
    const tableId = req.params.id;

    const checkReservationQuery =
      "SELECT * FROM reservation WHERE table_id = $1";
    const reservationResult = await client.query(checkReservationQuery, [
      tableId,
    ]);
    if (reservationResult.rows.length > 0) {
      return res
        .status(400)
        .send("Cannot delete the table because it is reserved.");
    }
    const deleteTableQuery = "DELETE FROM dining WHERE table_id = $1";
    await client.query(deleteTableQuery, [tableId]);

    res.redirect("/dining");
  } catch (error) {
    console.error("Error deleting dining table:", error);
    res.status(500).send("Error deleting dining table");
  }
});
router.post("/reserve/:id", async (req, res) => {
  try {
    const { name, email, phone_number, address } = req.body;
    const tableId = req.params.id;
    const checkReservationQuery = `
      SELECT * FROM reservation WHERE table_id = $1
    `;
    const existingReservation = await client.query(checkReservationQuery, [
      tableId,
    ]);
    if (existingReservation.rows.length > 0) {
      return res
        .status(400)
        .send("A reservation already exists for this table.");
    }
    let customerId;
    const checkCustomerQuery = `SELECT * FROM customer WHERE email = $1`;
    const customerResult = await client.query(checkCustomerQuery, [email]);
    if (customerResult.rows.length > 0) {
      customerId = customerResult.rows[0].customer_id;
    } else {
      const insertCustomerQuery = `
        INSERT INTO customer (name, email, phone_number, address)
        VALUES ($1, $2, $3, $4)
        RETURNING customer_id`;
      const newCustomerResult = await client.query(insertCustomerQuery, [
        name,
        email,
        phone_number,
        address,
      ]);
      customerId = newCustomerResult.rows[0].customer_id;
    }
    const insertReservationQuery = `
      INSERT INTO reservation (table_id, customer_id)
      VALUES ($1, $2)
    `;
    await client.query(insertReservationQuery, [tableId, customerId]);
    const updateTableStatusQuery = `
      UPDATE dining
      SET occupied = true
      WHERE table_id = $1
    `;
    await client.query(updateTableStatusQuery, [tableId]);

    res.redirect("/dining");
  } catch (error) {
    console.error("Error making reservation:", error);
    res.status(500).send("Error making reservation");
  }
});

router.post("/vacate/:id", async (req, res) => {
  try {
    const tableId = req.params.id;

    const deleteReservationQuery =
      "DELETE FROM reservation WHERE table_id = $1";
    await client.query(deleteReservationQuery, [tableId]);

    const updateTableStatusQuery =
      "UPDATE dining SET occupied = false WHERE table_id = $1";
    await client.query(updateTableStatusQuery, [tableId]);

    res.redirect("/dining");
  } catch (error) {
    console.error("Error vacating table:", error);
    res.status(500).send("Error vacating table");
  }
});

router.post("/update-status/:id", async (req, res) => {
  try {
    const tableId = req.params.id;
    const { occupied } = req.body;
    const updateStatusQuery =
      "UPDATE dining SET occupied = $1 WHERE table_id = $2";
    await client.query(updateStatusQuery, [occupied, tableId]);

    res.redirect("/dining");
  } catch (error) {
    console.error("Error updating dining table status:", error);
    res.status(500).send("Error updating dining table status");
  }
});

module.exports = router;
