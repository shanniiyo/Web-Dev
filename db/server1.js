const express = require("express");
const expresshbs = require("express-handlebars");
const path = require("path");

const app = express();

// Connect to MongoDB
require("./db/con");

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Static files (CSS, JS, Images)
app.use(express.static(path.join(__dirname, ".", "public")));

// Handlebars
app.engine(
  "hbs",
  expresshbs.engine({
    extname: ".hbs",
    helpers: {
      eq: (a, b) => a === b,
    },
  })
);

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, ".", "views"));

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

// 2. Flight Management + 5. Reservation Management
app.use("/", require("./routes/flightRoutes"));
app.use("/", require("./routes/reservationRoutes"));

// =====================
// Start Server
// =====================

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
