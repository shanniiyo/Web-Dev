/**
 * 4. Audit Trail Logging
 * Admin can view the audit trail through an audit log page.
 */

const AuditLog = require("../models/AuditLog");

// Show Audit Log Viewer page (admin only)
exports.getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ timestamp: -1 }).lean();

    res.render("admin-audit-logs", { logs });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading audit logs");
  }
};
