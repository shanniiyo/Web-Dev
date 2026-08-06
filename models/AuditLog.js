const mongoose = require("mongoose");

// 4. Audit Trail Logging
// Each entry records: Date and Time, Username, User Role, Activity Performed.
const auditLogSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    required: true,
  },

  activity: {
    type: String,
    required: true,
  },

  // Short extra context
  details: {
    type: String,
    default: "",
  },

  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("AuditLog", auditLogSchema, "auditlogs");
