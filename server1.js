const express = require("express");
const expresshbs = require("express-handlebars");
const path = require("path");

const app = express();

// Connect to MongoDB
require("./db/con");

// // Middleware
// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());

// Static files (CSS, JS, Images)
app.use(express.static("public"));

// Handlebars
app.engine(
  "hbs",
  expresshbs.engine({
    extname: ".hbs",
  })
);

app.set("view engine", "hbs");
app.set("views", "./views");

// =====================
// Routes
// =====================

// Home Page
app.get("/", (req, res) => {
  res.render("index");
});

// Search Page
app.get("/search", (req, res) => {
  res.render("search");
});

// Reservations Page
app.get("/reservations", (req, res) => {
  res.render("reservations");
});

// =====================
// Start Server
// =====================

const PORT = 3001;

app.listen(3001, () => {
  console.log(`Server running at http://localhost:3001`);
});
