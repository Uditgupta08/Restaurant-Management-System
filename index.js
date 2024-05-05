const express = require("express");
const session = require("express-session");
const { Client } = require("pg");
const bodyParser = require("body-parser");
const path = require("path");
const app = express();
const port = 3000;

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
app.use(
  session({
    secret: "helloworld",
    resave: false,
    saveUninitialized: true,
  })
);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));

const menuRouter = require("./routes/menu");
const menuDisplayRouter = require("./routes/menuDisplay");
const staffRouter = require("./routes/staff");
const tablesRouter = require("./routes/dining");
const cartRouter = require("./routes/cart");

app.use("/menudisplay", menuDisplayRouter);
app.use("/menu", menuRouter);
app.use("/staff", staffRouter);
app.use("/dining", tablesRouter);
app.use("/cart", cartRouter);

const createFunctionQuery = `
CREATE OR REPLACE FUNCTION no_special_char(name VARCHAR)
RETURNS BOOLEAN AS 
BEGIN
  IF name ~* '[^a-zA-Z0-9]' THEN
    RETURN FALSE;
  ELSE
    RETURN TRUE;
  END IF;
END;
LANGUAGE plpgsql;
`;

client
  .query(createFunctionQuery)
  .then(() => {
    console.log("Function created successfully");
  })
  .catch((err) => {
    console.error("Error creating function:", err);
  });

app.get("/", (req, res) => {
  client.query(
    `
    CREATE TABLE IF NOT EXISTS customer (
        customer_id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(100) UNIQUE,
        phone_number VARCHAR(20),
        address TEXT
    );
`,
    (err, result) => {
      if (err) {
        console.error("Error creating customer table:", err);
        res.status(500).send("Error creating customer table");
      } else {
        console.log("Customer table created successfully");
        res.render("land");
      }
    }
  );
});
app.get("/thankYou", (req, res) => {
  res.render("thankYou");
});
app.get("/land", (req, res) => {
  res.render("land");
});
app.post("/addCustomer", (req, res) => {
  const { name, email, phone_number, address } = req.body;

  client
    .query("SELECT no_special_char($1)", [name])
    .then((result) => {
      if (result.rows[0].no_special_char) {
        const checkCustomerQuery = `SELECT * FROM customer WHERE email = $1`;
        client
          .query(checkCustomerQuery, [email])
          .then((result) => {
            if (result.rows.length > 0) {
              req.session.customerId = result.rows[0].customer_id;
              res.redirect("/menudisplay");
            } else {
              const insertDataQuery = `
                INSERT INTO customer (name, email, phone_number, address)
                VALUES ($1, $2, $3, $4)
                RETURNING customer_id`;
              client
                .query(insertDataQuery, [name, email, phone_number, address])
                .then((result) => {
                  req.session.customerId = result.rows[0].customer_id;
                  res.redirect("/menu");
                })
                .catch((err) => {
                  console.error("Error inserting customer data:", err);
                  res.status(500).send("Error inserting customer data");
                });
            }
          })
          .catch((err) => {
            console.error("Error checking customer existence:", err);
            res.status(500).send("Error checking customer existence");
          });
      } else {
        res.status(400).send("Username cannot contain special characters");
      }
    })
    .catch((err) => {
      console.error("Error validating username:", err);
      res.status(500).send("Error validating username");
    });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
