/**
 * 2. Flight Management
 * Administrators can perform CRUD operations for flights:
 * Create flights, View flights, Update flights, Delete flights.
 */
const Flight = require("../models/Flight");

// Show Flight Management Page
exports.getAllFlights = async (req, res) => {
  try {
    const flights = await Flight.find().sort({ departureDateTime: 1 }).lean();
    
    res.render("admin-flights", { flights });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading flights");
  }
};

// Create Flight
exports.createFlight = async (req, res) => {
  try {
    const newFlight = new Flight(req.body);
    await newFlight.save();

    res.redirect("/admin-flights");
  } catch (err) {
    console.error(err);
    res.status(400).send(err.message);
  }
};

// Update Flight
exports.updateFlight = async (req, res) => {
  try {
    await Flight.findByIdAndUpdate(req.params.id, req.body);

    res.redirect("/admin-flights");
  } catch (err) {
    console.error(err);
    res.status(400).send(err.message);
  }
};

// Delete Flight
exports.deleteFlight = async (req, res) => {
  try {
    await Flight.findByIdAndDelete(req.params.id);
    res.redirect("/admin-flights");
  } catch (err) {
    console.error(err);
    res.status(400).send(err.message);
  }
};

/**
 * AJAX Flight Search
 * GET /api/flights/search
 */
exports.searchFlights = async (req, res) => {
  try {
    const { origin, destination, departureDate } = req.query;
    
    const query = {};

    // Case-insensitive origin
    if (origin) {
      query.origin = {
        $regex: new RegExp("^" + origin + "$", "i"),
      };
    }

    // Case-insensitive destination
    if (destination) {
      query.destination = {
        $regex: new RegExp("^" + destination + "$", "i"),
      };
    }

    // Match selected departure date
    if (departureDate) {
      const start = new Date(departureDate);
      const end = new Date(departureDate);
      end.setDate(end.getDate() + 1);

      query.departureDateTime = {
        $gte: start,
        $lt: end,
      };
    }

    // Only flights with available seats
    query.availableSeats = { $gt: 0 };

    const flights = await Flight.find(query)
      .sort({ departureDateTime: 1 })
      .lean();

    res.json(flights);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Error searching flights",
    });
  }
};