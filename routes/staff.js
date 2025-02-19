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

// client.connect();

// client.query(
//   `CREATE TABLE IF NOT EXISTS staff (
//     id SERIAL PRIMARY KEY,
//     name VARCHAR(100),
//     phone VARCHAR(20),
//     position VARCHAR(100)
//   )`,
//   (err, result) => {
//     if (err) {
//       console.error("Error creating staff table:", err);
//     } else {
//       console.log("Staff table created or already exists");
//     }
//   }
// );

// router.get("/", (req, res) => {
//   client.query("SELECT * FROM staff", (err, result) => {
//     if (err) {
//       console.error("Error retrieving staff members:", err);
//       res.status(500).send("Error retrieving staff members");
//     } else {
//       res.render("staff", { staffMembers: result.rows });
//     }
//   });
// });

// router.post("/add", (req, res) => {
//   const { name, phone, position } = req.body;

//   const insertStaffQuery = `
//     INSERT INTO staff (name, phone, position)
//     VALUES ($1, $2, $3)
//   `;
//   client
//     .query(insertStaffQuery, [name, phone, position])
//     .then(() => {
//       res.redirect("/staff");
//     })
//     .catch((err) => {
//       console.error("Error adding staff:", err);
//       res.status(500).send("Error adding staff. Please try again later.");
//     });
// });

// router.post("/delete/:id", (req, res) => {
//   const staffId = req.params.id;

//   const deleteStaffQuery = `
//     DELETE FROM staff
//     WHERE id = $1
//   `;
//   client
//     .query(deleteStaffQuery, [staffId])
//     .then(() => {
//       res.redirect("/staff");
//     })
//     .catch((err) => {
//       console.error("Error deleting staff:", err);
//       res.status(500).send("Error deleting staff. Please try again later.");
//     });
// });

// module.exports = router;


const express = require("express");
const router = express.Router();
const {
  getStaffMembers,
  addStaffMember,
  deleteStaffMember,
} = require("../controllers/staffController");

router.get("/", getStaffMembers);
router.post("/add", addStaffMember);
router.post("/delete/:id", deleteStaffMember);

module.exports = router;
