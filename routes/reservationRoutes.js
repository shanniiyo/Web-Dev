/**
 * 5. Reservation Management — Routes
 */
const express = require("express");
const router = express.Router();
const reservationController = require("../controllers/reservationController");
const { requireAuth, requireRole } = require("../middleware/middleware_auth");

// Passenger - My Reservations page
router.get("/reservations", requireAuth, reservationController.getMyReservations);

// Admin - Reservation Management page
router.get("/admin-reservations", requireRole("admin"), reservationController.getAllReservationsAdmin);

// Create reservation (called from booking flow)
router.post("/api/reservations", requireRole ("passenger"), reservationController.createReservation);

// Update seat selection (AJAX)
router.post("/api/reservations/:id/seat", requireAuth, reservationController.updateSeat);

// Cancel reservation (AJAX, no page refresh)
router.post("/api/reservations/:id/cancel", requireAuth, reservationController.cancelReservation);

module.exports = router;