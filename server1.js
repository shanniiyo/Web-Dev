const express = require("express");
const expresshbs = require("express-handlebars");
const session = require("express-session");
const path = require("path");

const app = express();

// Connect to MongoDB
require("./db/con");

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Static files (CSS, JS, Images)
app.use(express.static("public"));

// Sessions (used for login state / route protection)
app.use(
  session({
    secret: "flyscanners-mco1-secret", // demo secret; move to env var for production
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 4 }, // 4 hours
  })
);

// Handlebars
app.engine(
  "hbs",
  expresshbs.engine({
    extname: ".hbs",
    defaultLayout: false, // every .hbs view here is a full standalone page
    helpers: {
      eq: (a, b) => a === b,
    },
  })
);


app.set("view engine", "hbs");
app.set("views", "./views");

// Make the logged-in user available to every view as {{user}}
const { attachUserToLocals, requireAuth, requireAdmin } = require("./middleware/middleware_auth");
app.use(attachUserToLocals);


// Feature Routes
app.use("/", require("./routes/userRoutes"));        // #1 Register / Login / Logout
app.use("/", require("./routes/profileRoutes"));     // #1 View / Update Profile
app.use("/", require("./routes/flightRoutes"));       // #2 Flight Management (admin CRUD + search)
app.use("/", require("./routes/reservationRoutes"));  // #5 Reservation Management

// Public / Passenger Page Routes

// Home Page
app.get("/", (req, res) => {
  res.render("index");
});

// Search Page
app.get("/search", (req, res) => {
  res.render("search");
});

// Booking Page (requires login to book a flight)
app.get("/booking", requireAuth, (req, res) => {
  res.render("booking");
});

// Reservations Page
app.get("/reservations", (req, res) => {
  res.render("reservations");
});

// Admin Page Routes (no controller yet — static pages)
app.get("/admin-dashboard", requireAdmin, (req, res) => {
  res.render("admin-dashboard");
});

app.get("/admin-users", requireAdmin, (req, res) => {
  res.render("admin-users");
});

// =====================
// Start Server
// =====================

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
