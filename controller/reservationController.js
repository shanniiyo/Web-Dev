/**
 * 5. Reservation Management
 * Passengers can: View reservations, Update seat selection, Cancel reservations.
 * Enforces business rules: flight availability, seat availability,
 * required passenger information.
 */
const Reservation = require("../models/Reservation");
const Flight = require("../models/Flight");

// Show passenger's reservations page
exports.getMyReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate("flight")
      .sort({ createdAt: -1 });

    res.render("reservations", { reservations });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading reservations");
  }
};

// Show admin Reservation Management page (all reservations)
exports.getAllReservationsAdmin = async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate("flight")
      .sort({ createdAt: -1 });

    res.render("admin-reservations", { reservations });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading reservations");
  }
};

// Create a reservation (called from the booking flow)
exports.createReservation = async (req, res) => {
  try {
    const { flightId, passengerName, email, passportNumber, seatNumber } =
      req.body;

    if (!passengerName || !email || !passportNumber) {
      return res.status(400).json({ error: "Missing required passenger information" });
    }

    const flight = await Flight.findById(flightId);
    if (!flight) {
      return res.status(404).json({ error: "Flight not found" });
    }

    if (flight.availableSeats <= 0) {
      return res.status(400).json({ error: "This flight has no available seats" });
    }

    const seatTaken = await Reservation.findOne({
      flight: flight._id,
      seatNumber,
      bookingStatus: { $ne: "Cancelled" },
    });
    if (seatTaken) {
      return res.status(400).json({ error: "This seat is already taken" });
    }

    const reservationNumber = "BR-" + Date.now().toString().slice(-8);

    const reservation = new Reservation({
      reservationNumber,
      flight: flight._id,
      flightNumber: flight.flightNumber,
      passengerName,
      email,
      passportNumber,
      seatNumber,
      totalPrice: flight.ticketPrice,
      bookingStatus: "Confirmed",
    });

    await reservation.save();

    flight.availableSeats -= 1;
    await flight.save();

    res.status(201).json(reservation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error creating reservation" });
  }
};

// Update seat selection on an existing reservation
exports.updateSeat = async (req, res) => {
  try {
    const { id } = req.params;
    const { seatNumber } = req.body;

    const reservation = await Reservation.findById(id);
    if (!reservation) {
      return res.status(404).json({ error: "Reservation not found" });
    }

    const seatTaken = await Reservation.findOne({
      flight: reservation.flight,
      seatNumber,
      bookingStatus: { $ne: "Cancelled" },
      _id: { $ne: reservation._id },
    });
    if (seatTaken) {
      return res.status(400).json({ error: "This seat is already taken" });
    }

    reservation.seatNumber = seatNumber;
    await reservation.save();

    res.json(reservation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error updating seat" });
  }
};

// Cancel a reservation (AJAX - no page refresh)
exports.cancelReservation = async (req, res) => {
  try {
    const { id } = req.params;

    const reservation = await Reservation.findById(id);
    if (!reservation) {
      return res.status(404).json({ error: "Reservation not found" });
    }

    if (reservation.bookingStatus === "Cancelled") {
      return res.status(400).json({ error: "Reservation is already cancelled" });
    }

    reservation.bookingStatus = "Cancelled";
    await reservation.save();

    await Flight.findByIdAndUpdate(reservation.flight, {
      $inc: { availableSeats: 1 },
    });

    res.json({ success: true, reservation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error cancelling reservation" });
  }
};