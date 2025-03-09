// const client = require("../db");

// // Create necessary tables if not exists
// const createTables = () => {
//   const createTableQuery = `
//     CREATE TABLE IF NOT EXISTS dining (
//       table_id SERIAL PRIMARY KEY,
//       table_name VARCHAR(100) UNIQUE NOT NULL,
//       seating_capacity INTEGER NOT NULL,
//       occupied BOOLEAN DEFAULT false
//     );
//   `;
//   const createReservation = `
//     CREATE TABLE IF NOT EXISTS reservation (
//       reservation_id SERIAL PRIMARY KEY,
//       table_id INTEGER REFERENCES dining(table_id),
//       customer_id INTEGER REFERENCES customer(customer_id),
//       reservation_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//     );
//   `;

//   client
//     .query(createTableQuery)
//     .then(() => console.log("Dining table created successfully"))
//     .catch((error) => console.error("Error creating dining table:", error));

//   client
//     .query(createReservation)
//     .then(() => console.log("Reservation table created successfully"))
//     .catch((error) => console.error("Error creating reservation table:", error));
// };

// // Fetch dining tables
// const getDiningTables = async (req, res) => {
//   try {
//     const tablesResult = await client.query("SELECT * FROM dining");
//     res.render("dining", { tables: tablesResult.rows });
//   } catch (error) {
//     console.error("Error fetching dining tables:", error);
//     res.status(500).send("Error fetching dining tables");
//   }
// };

// // Add dining table
// const addDiningTable = async (req, res) => {
//   try {
//     const { tableName, seatingCapacity } = req.body;
//     await client.query(
//       `INSERT INTO dining (table_name, seating_capacity) VALUES ($1, $2)`,
//       [tableName, seatingCapacity]
//     );
//     res.redirect("/dining");
//   } catch (error) {
//     console.error("Error adding dining table:", error);
//     res.status(500).send("Error adding dining table");
//   }
// };

// // Delete dining table
// const deleteDiningTable = async (req, res) => {
//   try {
//     const tableId = req.params.id;
//     const reservationResult = await client.query(
//       "SELECT * FROM reservation WHERE table_id = $1",
//       [tableId]
//     );
//     if (reservationResult.rows.length > 0) {
//       return res.status(400).send("Cannot delete table as it is reserved.");
//     }

//     await client.query("DELETE FROM dining WHERE table_id = $1", [tableId]);
//     res.redirect("/dining");
//   } catch (error) {
//     console.error("Error deleting dining table:", error);
//     res.status(500).send("Error deleting dining table");
//   }
// };

// // Reserve a table
// const reserveTable = async (req, res) => {
//   try {
//     const { name, email, phone_number, address } = req.body;
//     const tableId = req.params.id;

//     const existingReservation = await client.query(
//       "SELECT * FROM reservation WHERE table_id = $1",
//       [tableId]
//     );
//     if (existingReservation.rows.length > 0) {
//       return res.status(400).send("Table is already reserved.");
//     }

//     let customerId;
//     const customerResult = await client.query(
//       "SELECT * FROM customer WHERE email = $1",
//       [email]
//     );

//     if (customerResult.rows.length > 0) {
//       customerId = customerResult.rows[0].customer_id;
//     } else {
//       const newCustomerResult = await client.query(
//         `INSERT INTO customer (name, email, phone_number, address) 
//          VALUES ($1, $2, $3, $4) RETURNING customer_id`,
//         [name, email, phone_number, address]
//       );
//       customerId = newCustomerResult.rows[0].customer_id;
//     }

//     await client.query(
//       `INSERT INTO reservation (table_id, customer_id) VALUES ($1, $2)`,
//       [tableId, customerId]
//     );

//     await client.query(
//       `UPDATE dining SET occupied = true WHERE table_id = $1`,
//       [tableId]
//     );

//     res.redirect("/dining");
//   } catch (error) {
//     console.error("Error making reservation:", error);
//     res.status(500).send("Error making reservation");
//   }
// };

// // Vacate a table
// const vacateTable = async (req, res) => {
//   try {
//     const tableId = req.params.id;
//     await client.query("DELETE FROM reservation WHERE table_id = $1", [
//       tableId,
//     ]);
//     await client.query("UPDATE dining SET occupied = false WHERE table_id = $1", [
//       tableId,
//     ]);
//     res.redirect("/dining");
//   } catch (error) {
//     console.error("Error vacating table:", error);
//     res.status(500).send("Error vacating table");
//   }
// };

// // Update table status
// const updateTableStatus = async (req, res) => {
//   try {
//     const tableId = req.params.id;
//     const { occupied } = req.body;
//     await client.query("UPDATE dining SET occupied = $1 WHERE table_id = $2", [
//       occupied,
//       tableId,
//     ]);
//     res.redirect("/dining");
//   } catch (error) {
//     console.error("Error updating table status:", error);
//     res.status(500).send("Error updating table status");
//   }
// };

// module.exports = {
//   createTables,
//   getDiningTables,
//   addDiningTable,
//   deleteDiningTable,
//   reserveTable,
//   vacateTable,
//   updateTableStatus,
// };

const client = require("../db");

const initializeTables = async () => {
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS dining (
        table_id SERIAL PRIMARY KEY,
        table_name VARCHAR(50) NOT NULL,
        seating_capacity INT NOT NULL CHECK (seating_capacity > 0),
        occupied BOOLEAN DEFAULT FALSE
      );

      CREATE TABLE IF NOT EXISTS customer (
        customer_id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        phone_number VARCHAR(15) NOT NULL,
        address TEXT
      );

      CREATE TABLE IF NOT EXISTS reservation (
        reservation_id SERIAL PRIMARY KEY,
        table_id INT REFERENCES dining(table_id) ON DELETE CASCADE,
        customer_id INT REFERENCES customer(customer_id) ON DELETE CASCADE,
        reservation_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  } catch (error) {
    console.error("Error creating dining tables:", error);
  }
};

initializeTables();
// Fetch all dining tables
const getDiningTables = async (req, res) => {
  try {
    const result = await client.query("SELECT * FROM dining");
    res.render("dining", { tables: result.rows });
  } catch (error) {
    console.error("Error fetching dining tables:", error);
    res.status(500).send("Error fetching dining tables");
  }
};

// Add a new dining table
const addDiningTable = async (req, res) => {
  try {
    const { tableName, seatingCapacity } = req.body;
    const query = `INSERT INTO dining (table_name, seating_capacity) VALUES ($1, $2)`;
    await client.query(query, [tableName, seatingCapacity]);
    res.redirect("/dining");
  } catch (error) {
    console.error("Error adding dining table:", error);
    res.status(500).send("Error adding dining table");
  }
};

// Delete a dining table
const deleteDiningTable = async (req, res) => {
  try {
    const tableId = req.params.id;

    const checkReservationQuery = "SELECT * FROM reservation WHERE table_id = $1";
    const reservationResult = await client.query(checkReservationQuery, [tableId]);
    
    if (reservationResult.rows.length > 0) {
      return res.status(400).send("Cannot delete table, it is reserved.");
    }

    const deleteQuery = "DELETE FROM dining WHERE table_id = $1";
    await client.query(deleteQuery, [tableId]);
    res.redirect("/dining");
  } catch (error) {
    console.error("Error deleting table:", error);
    res.status(500).send("Error deleting table");
  }
};

// Reserve a dining table
const reserveTable = async (req, res) => {
  try {
    const { name, email, phone_number, address } = req.body;
    const tableId = req.params.id;

    const checkQuery = "SELECT * FROM reservation WHERE table_id = $1";
    const existingReservation = await client.query(checkQuery, [tableId]);
    if (existingReservation.rows.length > 0) {
      return res.status(400).send("Table is already reserved.");
    }

    let customerId;
    const customerQuery = "SELECT * FROM customer WHERE email = $1";
    const customerResult = await client.query(customerQuery, [email]);

    if (customerResult.rows.length > 0) {
      customerId = customerResult.rows[0].customer_id;
    } else {
      const insertCustomer = `
        INSERT INTO customer (name, email, phone_number, address)
        VALUES ($1, $2, $3, $4) RETURNING customer_id
      `;
      const newCustomer = await client.query(insertCustomer, [name, email, phone_number, address]);
      customerId = newCustomer.rows[0].customer_id;
    }

    const reserveQuery = "INSERT INTO reservation (table_id, customer_id) VALUES ($1, $2)";
    await client.query(reserveQuery, [tableId, customerId]);

    await client.query("UPDATE dining SET occupied = true WHERE table_id = $1", [tableId]);
    res.redirect("/dining");
  } catch (error) {
    console.error("Error reserving table:", error);
    res.status(500).send("Error reserving table");
  }
};

module.exports = {
    getDiningTables,
    addDiningTable,
    deleteDiningTable,
    reserveTable,
}