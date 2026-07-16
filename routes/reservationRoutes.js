/**
 * 5. Reservation Management — Routes
 */
const express = require("express");
const router = express.Router();
const reservationController = require("../controllers/reservationController");

// Passenger - My Reservations page
router.get("/reservations", reservationController.getMyReservations);

// Admin - Reservation Management page
router.get("/admin/reservations", reservationController.getAllReservationsAdmin);

// Create reservation (called from booking flow)
router.post("/api/reservations", reservationController.createReservation);

// Update seat selection (AJAX)
router.post("/api/reservations/:id/seat", reservationController.updateSeat);

// Cancel reservation (AJAX, no page refresh)
router.post("/api/reservations/:id/cancel", reservationController.cancelReservation);

module.exports = router;