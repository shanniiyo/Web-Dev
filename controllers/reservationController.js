/**
 * 5. Reservation Management
 * Passengers can: View reservations, Update seat selection, Cancel reservations.
 * Enforces business rules: flight availability, seat availability,
 * required passenger information.
 */
const Reservation = require("../models/Reservation");
const Flight = require("../models/Flight");

// to check ownership
function canModify(req, reservation) {
  const u = req.session && req.session.user;
  if (!u) return false;
  if (u.role === "admin") return true;
  return String(reservation.user) === String(u.id);
}

// Show only passenger's reservations page
exports.getMyReservations = async (req, res) => {
  try {
    // filteration, so that the other passenger cant see the database
    const reservations = await Reservation.find({ user: req.session.user.id })
      .populate("flight")
      .sort({ createdAt: -1 })
      .lean();

    res.render("reservations", { reservations });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading reservations");
  }
};

// Show ADMIN Reservation Management page (all reservations)
exports.getAllReservationsAdmin = async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate("flight")
      .populate("user", "firstName lastName email")
      .sort({ createdAt: -1 })
      .lean();

    res.render("admin-reservations", { reservations });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading reservations");
  }
};

// Create a reservation (called from the booking flow)
exports.createReservation = async (req, res) => {
  try {
    const { flightId, passengerName, email, passportNumber, seatNumber } = req.body;

    if (!passengerName || !email || !passportNumber || !seatNumber) {
      return res.status(400).json({ error: "Missing required passenger information" });
    }

    const flight = await Flight.findById(flightId);
    if (!flight) {
      return res.status(404).json({ error: "Flight not found" });
    }

    // Business rule: flight must have available seats
    if (flight.availableSeats <= 0) {
      return res.status(400).json({ error: "This flight has no available seats" });
    }

    // Business rule: seat can only be assigned to one passenger on this flight
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
      reservationNumber, // based on the schema, without it every save() threw. Taken from the session, never from the request body.
      user: req.session.user.id,
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

    if (Array.isArray(flight.seats)) {
      const seatIndex = flight.seats.findIndex((s) => s.seatNumber === seatNumber);
      if (seatIndex !== -1) flight.seats[seatIndex].isAvailable = false;
    }

    // Decrease available seats
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

    if (!canModify(req, reservation)) {
      return res.status(403).json({ error: "You cannot modify this reservation" });
    }

    if (reservation.bookingStatus === "Cancelled") {
      return res.status(400).json({ error: "This reservation is cancelled" });
    }

    // Business rule: new seat must not already be taken on this flight
    const seatTaken = await Reservation.findOne({
      flight: reservation.flight,
      seatNumber,
      bookingStatus: { $ne: "Cancelled" },
      _id: { $ne: reservation._id },
    });
    if (seatTaken) {
      return res.status(400).json({ error: "This seat is already taken" });
    }
    const oldSeat = reservation.seatNumber;

    reservation.seatNumber = seatNumber;
    await reservation.save();

    await Flight.findByIdAndUpdate(
      reservation.flight,
      { $set: { "seats.$[old].isAvailable": true } },
      { arrayFilters: [{ "old.seatNumber": oldSeat }] }
    );
    
    // Mark new seat as unavailable
    await Flight.findByIdAndUpdate(
      reservation.flight,
      { $set: { "seats.$[fresh].isAvailable": false } },
      { arrayFilters: [{ "fresh.seatNumber": seatNumber }] }
    );

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

    // Without this a passenger could cancel anyone's booking
    // just by guessing or reading the ID.
    if (!canModify(req, reservation)) {
      return res.status(403).json({ error: "You cannot cancel this reservation" });
    }

    if (reservation.bookingStatus === "Cancelled") {
      return res.status(400).json({ error: "Reservation is already cancelled" });
    }

    reservation.bookingStatus = "Cancelled";
    await reservation.save();

    // Give the seat back
    await Flight.findByIdAndUpdate(
      reservation.flight,
      {
        $inc: { availableSeats: 1 },
        $set: { "seats.$[elem].isAvailable": true },
      },
      { arrayFilters: [{ "elem.seatNumber": reservation.seatNumber }] }
    );

    res.json({ success: true, reservation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error cancelling reservation" });
  }
};