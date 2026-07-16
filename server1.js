const express = require("express");
const expresshbs = require("express-handlebars");
const path = require("path");

const app = express();

// Connect to MongoDB
require("./db/conn");

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
app.get("/booking", (req, res) => {
  res.render("booking");
});

// 2. Flight Management + 5. Reservation Management
app.use("/", require("./routes/flightRoutes"));
app.use("/", require("./routes/reservationRoutes"));

//Admin Page
app.get("/admin", (req, res) => {
  res.render("admin");
});

//Admin Dashboard
app.get("/admin/dashboard", (req, res) => {
  res.render("adminDashboard");
});

//Admin Flight Management
app.get("/admin/flight-management", (req, res) => {
  res.render("adminFlightManagement");
});

//Admin Reservation Management
app.get("/admin/reservation-management", (req, res) => {
  res.render("adminReservationManagement");
});




// =====================
// Start Server
// =====================

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});