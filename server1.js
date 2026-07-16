const express = require("express");
const expresshbs = require("express-handlebars");
const path = require("path");

const app = express();

// Connect to MongoDB
require("./db/conn");
const Flight = require("./models/Flight");

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Static files (CSS, JS, Images)
app.use(express.static(path.join(__dirname, "public")));

// Handlebars
app.engine(
  "hbs",
  expresshbs.engine({
    extname: ".hbs",
    helpers: {
      eq: (a, b) => a === b,
      formatDate: (date) => {
        if (!date) return "";
        const d = new Date(date);
        return d.toLocaleString("en-PH", {
          dateStyle: "medium",
          timeStyle: "short",
        });
      },
    },
  })
);

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

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

// Booking Page
app.get("/booking", async (req, res) => {
  try {
    const flightId = req.query.flightId;
    if (!flightId) {
      return res.redirect("/search");
    }
    const flight = await Flight.findById(flightId);
    if (!flight) {
      return res.status(404).send("Flight not found");
    }
    const flightObj = flight.toObject();
    res.render("booking", { flight: flightObj });
  } catch (error) {
    console.error("Error fetching flight:", error);
    res.status(500).send("Server error");
  }
});

// 2. Flight Management + 5. Reservation Management
app.use("/", require("./routes/flightRoutes"));
app.use("/", require("./routes/reservationRoutes"));

//Admin Dashboard
app.get("/admin/dashboard", (req, res) => {
  res.render("admin-Dashboard");
});

//Admin Users
app.get("/admin/users", (req, res) => {
  res.render("admin-users");
});






// =====================
// Start Server
// =====================

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});