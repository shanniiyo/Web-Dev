/**
 * 2. Flight Management
 * Administrators can perform CRUD operations for flights:
 * Create flights, View flights, Update flights, Delete flights.
 */
const Flight = require("../models/Flight");

// Show the admin Flight Management page with all flights
exports.getAllFlights = async (req, res) => {
  try {
    const flights = await Flight.find().sort({ departureDateTime: 1 });
    res.render("admin-flights", { flights });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading flights");
  }
};

// Create a new flight
exports.createFlight = async (req, res) => {
  try {
    const {
      flightNumber,
      airline,
      origin,
      destination,
      departureDateTime,
      arrivalDateTime,
      availableSeats,
      ticketPrice,
    } = req.body;

    // Server-side validation
    if (!flightNumber || !airline || !origin || !destination || !departureDateTime || !arrivalDateTime || !availableSeats || !ticketPrice) {
      return res.status(400).send("All fields are required");
    }

    const newFlight = new Flight({
      flightNumber,
      airline,
      origin,
      destination,
      departureDateTime,
      arrivalDateTime,
      availableSeats,
      ticketPrice,
    });

    await newFlight.save();
    res.redirect("/admin/flights");
  } catch (err) {
    console.error(err);
    res.status(400).send("Error creating flight: " + err.message);
  }
};

// Update an existing flight
exports.updateFlight = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      flightNumber,
      airline,
      origin,
      destination,
      departureDateTime,
      arrivalDateTime,
      availableSeats,
      ticketPrice,
    } = req.body;

    await Flight.findByIdAndUpdate(id, {
      flightNumber,
      airline,
      origin,
      destination,
      departureDateTime,
      arrivalDateTime,
      availableSeats,
      ticketPrice,
    });

    res.redirect("/admin/flights");
  } catch (err) {
    console.error(err);
    res.status(400).send("Error updating flight: " + err.message);
  }
};

// Delete a flight
exports.deleteFlight = async (req, res) => {
  try {
    const { id } = req.params;
    await Flight.findByIdAndDelete(id);
    res.redirect("/admin/flights");
  } catch (err) {
    console.error(err);
    res.status(400).send("Error deleting flight: " + err.message);
  }
};

// AJAX flight search (used by search.hbs)
exports.searchFlights = async (req, res) => {
  try {
    const { origin, destination, departureDate } = req.query;
    const query = {};

    if (origin) query.origin = origin;
    if (destination) query.destination = destination;

    if (departureDate) {
      const start = new Date(departureDate);
      const end = new Date(departureDate);
      end.setDate(end.getDate() + 1);
      query.departureDateTime = { $gte: start, $lt: end };
    }

    const flights = await Flight.find(query).sort({ departureDateTime: 1 });
    res.json(flights);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error searching flights" });
  }
};

exports.getAllFlights = async (req, res) => {
  try {
    const flights = await Flight.find().sort({ departureDateTime: 1 });
    console.log("Flights found:", flights); // ← ADD THIS LINE
    console.log("Number of flights:", flights.length); // ← ADD THIS LINE
    res.render("admin-flights", { flights });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading flights");
  }
};