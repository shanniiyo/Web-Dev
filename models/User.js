const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },

  lastName: {
    type: String,
    required: true,
    trim: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },

  password: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    enum: ["passenger", "admin"],
    default: "passenger",
  },

  status: {
    type: String,
    enum: ["Active", "Inactive", "Suspended"],
    default: "Active",
  },

  // Profile fields (optional, filled in via "Update profile information")
  phone: { type: String, default: "" },
  countryCode: { type: String, default: "+63" },
  nationality: { type: String, default: "" },
  dateOfBirth: { type: Date },
  gender: { type: String, default: "" },
  emergencyContactName: { type: String, default: "" },
  emergencyContactPhone: { type: String, default: "" },

  // Passport (optional)
  passportNationality: { type: String, default: "" },
  passportNumber: { type: String, default: "" },
  passportExpiry: { type: Date },
  passportIssuedBy: { type: String, default: "" },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", userSchema);
