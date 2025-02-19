const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");
require("dotenv").config();
const client = require("./db");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));

// Import Routes
const menuRouter = require("./routes/menu");
const menuDisplayRouter = require("./routes/menudisplay");
const staffRouter = require("./routes/staff");
const tablesRouter = require("./routes/dining");
const cartRouter = require("./routes/cart");

// Use Routes
app.use("/menudisplay", menuDisplayRouter);
app.use("/menu", menuRouter);
app.use("/staff", staffRouter);
app.use("/dining", tablesRouter);
app.use("/cart", cartRouter);

// Import Controllers
const { createCustomerTable, addCustomer } = require("./controllers/customerController");
require("./controllers/functionController");

app.get("/", createCustomerTable);
app.get("/thankYou", (req, res) => res.render("thankYou"));
app.get("/land", (req, res) => res.render("land"));
app.post("/addCustomer", addCustomer);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
