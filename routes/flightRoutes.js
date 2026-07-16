/**
 * 2. Flight Management — Routes
 */
const express = require("express");
const router = express.Router();
const flightController = require("../controllers/flightController");
const { requireAdmin } = require("../middleware/middleware_auth");

// Admin - Flight Management page (view all flights)
router.get("/admin-flights", requireAdmin, flightController.getAllFlights);

// Admin - Create a new flight
router.post("/admin-flights", requireAdmin, flightController.createFlight);

// Admin - Update an existing flight
router.post("/admin-flights/:id/update", requireAdmin, flightController.updateFlight);

// Admin - Delete a flight
router.post("/admin-flights/:id/delete", requireAdmin, flightController.deleteFlight);

// Public - AJAX flight search (used by search.hbs)
router.get("/api/flights/search", flightController.searchFlights);

module.exports = router;