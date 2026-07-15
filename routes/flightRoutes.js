/**
 * 2. Flight Management — Routes
 */
const express = require("express");
const router = express.Router();
const flightController = require("../controllers/flightController");

// Admin - Flight Management page
router.get("/admin/flights", flightController.getAllFlights);
router.post("/admin/flights", flightController.createFlight);
router.post("/admin/flights/:id/update", flightController.updateFlight);
router.post("/admin/flights/:id/delete", flightController.deleteFlight);

// Public - AJAX flight search (used by search.hbs)
router.get("/api/flights/search", flightController.searchFlights);

module.exports = router;