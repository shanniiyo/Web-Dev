/**
 * 5. Reservation Management
 * Reservation Information:
 * Reservation Number, Flight Number, Passenger Name,
 * Seat Number, Booking Status.
 */
const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema({
  reservationNumber: {
    type: String,
    required: true,
    unique: true,
  },

  flight: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Flight",
    required: true,
  },

  flightNumber: {
    type: String,
    required: true,
  },

  passengerName: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
  },

  passportNumber: {
    type: String,
    required: true,
  },

  seatNumber: {
    type: String,
    required: true,
  },

  totalPrice: {
    type: Number,
    required: true,
  },

  bookingStatus: {
    type: String,
    enum: ["Confirmed", "Pending", "Cancelled", "Completed"],
    default: "Confirmed",
  },
},
{
  timestamps: true,
});

module.exports = mongoose.model("Reservation", reservationSchema);