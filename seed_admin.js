const express = require("express");
const expresshbs = require("express-handlebars");
const session = require("express-session");
const path = require("path");

const app = express();

// Connect to MongoDB
require("./db/conn");

const Flight = require("./models/Flight");

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Static files (CSS, JS, Images)
app.use(express.static("public"));

// Sessions (used for login state / route protection)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "flyscanners-mco2-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true, // JS on the page can't read the cookie
      sameSite: "lax", // basic CSRF mitigation
      maxAge: 1000 * 60 * 60 * 4,
    },
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
      json: (context) => JSON.stringify(context),
      startsWith: (str, prefix) => str && str.startsWith(prefix),
      endsWith: (str, suffix) => str && str.endsWith(suffix),
      formatDate: (date) => {
        if (!date) return "";
        const d = new Date(date);
        if (isNaN(d)) return "";
        return d.toLocaleString("en-PH", {
          year: "numeric",
          month: "short",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
      },
    },
  })
);

//booking page
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

app.set("view engine", "hbs");
app.set("views", "./views");

// Make the logged-in user available to every view as "user"
const {
  attachUserToLocals,
  requireAuth,
  requireAdmin,
  requireRole,
} = require("./middleware/middleware_auth");
app.use(attachUserToLocals);

// Feature Routes
app.use("/", require("./routes/userRoutes")); // #1 Register / Login / Logout
app.use("/", require("./routes/profileRoutes")); // #1 View / Update Profile
app.use("/", require("./routes/flightRoutes")); // #2 Flight Management (admin CRUD + search)
app.use("/", require("./routes/reservationRoutes")); // #5 Reservation Management
app.use("/", require("./routes/auditRoutes")); // #4 Audit Trail Logging

// Public pages
app.get("/", (req, res) => res.render("index"));
app.get("/search", (req, res) => res.render("search"));

//Passenger only
app.get("/booking", requireRole("passenger"), (req, res) => {
  res.render("booking");
});

// Pau: I moved the reservations to reservationRoutes.js behind requireAuth + user filtering.

//Admin only
app.get("/admin-dashboard", requireRole("admin"), (req, res) => {
  res.render("admin-dashboard");
});

app.get("/admin-users", requireRole("admin"), (req, res) => {
  res.render("admin-users");
});

//404
app.use((req, res) => {
  res.status(404).render("access-denied", { message: "Page not found." });
});

// Catch-all error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("Something went wrong.");
});

// Start Server

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
