const AuditLog = require("../models/AuditLog");

/**
 * Records one audit trail entry in MongoDB.
 * @param {Object} entry
 * @param {string} entry.username - Email or username of the user who performed the activity.
 * @param {string} entry.role - Role of the user at the time.
 * @param {string} entry.activity - Short label of what happened.
 * @param {string} [entry.details] - Optional extra context.
 */
async function logActivity({ username, role, activity, details = "" }) {
  try {
    await AuditLog.create({
      username: username || "unknown",
      role: role || "unknown",
      activity,
      details,
    });
  } catch (err) {
    console.error("Audit log error:", err);
  }
}

module.exports = { logActivity };
