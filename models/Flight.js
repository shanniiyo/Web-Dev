const mongoose = require("mongoose");

const flightSchema = new mongoose.Schema({
  flightNumber: {
    type: String,
    required: true,
    unique: true,
  },

  airline: {
    type: String,
    required: true,
  },

  origin: {
    type: String,
    required: true,
  },

  destination: {
    type: String,
    required: true,
  },

  departureDateTime: {
    type: Date,
    required: true,
  },

  arrivalDateTime: {
    type: Date,
    required: true,
  },

  availableSeats: {
    type: Number,
    required: true,
  },

  ticketPrice: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("Flight", flightSchema);
