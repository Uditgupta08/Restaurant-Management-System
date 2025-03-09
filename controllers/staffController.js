const client = require("../db");

// Fetch all staff members
const initializeTables = async () => {
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS staff (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        phone VARCHAR(15) NOT NULL,
        position VARCHAR(50) NOT NULL
      );
    `);
  } catch (error) {
    console.error("Error creating staff table:", error);
  }
};

initializeTables();

const getStaffMembers = async (req, res) => {
  try {
    const result = await client.query("SELECT * FROM staff");
    res.render("staff", { staffMembers: result.rows });
  } catch (error) {
    console.error("Error retrieving staff members:", error);
    res.status(500).send("Error retrieving staff members");
  }
};

// Add a new staff member
const addStaffMember = async (req, res) => {
  try {
    const { name, phone, position } = req.body;
    const query = `INSERT INTO staff (name, phone, position) VALUES ($1, $2, $3)`;
    await client.query(query, [name, phone, position]);
    res.redirect("/staff");
  } catch (error) {
    console.error("Error adding staff:", error);
    res.status(500).send("Error adding staff. Please try again later.");
  }
};

// Delete a staff member
const deleteStaffMember = async (req, res) => {
  try {
    const staffId = req.params.id;
    await client.query("DELETE FROM staff WHERE id = $1", [staffId]);
    res.redirect("/staff");
  } catch (error) {
    console.error("Error deleting staff:", error);
    res.status(500).send("Error deleting staff. Please try again later.");
  }
};

module.exports = {
  getStaffMembers,
  addStaffMember,
  deleteStaffMember,
};
