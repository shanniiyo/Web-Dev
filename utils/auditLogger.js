const AuditLog = require("../models/AuditLog");

/**
 * Records one audit trail entry in MongoDB.
 *
 * This is intentionally "fire and forget" from the caller's point of view:
 * if writing the audit log fails for some reason, we log the error to the
 * console instead of throwing, so a logging problem never blocks or breaks
 * the actual user action (registration, booking, etc.).
 *
 * @param {Object} entry
 * @param {string} entry.username - Email (or username) of the user who performed the activity.
 * @param {string} entry.role - Role of the user at the time ("admin" or "passenger").
 * @param {string} entry.activity - Short label of what happened, e.g. "User Login".
 * @param {string} [entry.details] - Optional extra context (flight number, reservation ref, etc.).
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
