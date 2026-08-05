/**
 * 4. Audit Trail Logging — Routes
 */
const express = require("express");
const router = express.Router();
const auditController = require("../controllers/auditController");
const { requireAdmin } = require("../middleware/middleware_auth");

// Admin - Audit Log Viewer page
router.get("/admin-audit-logs", requireAdmin, auditController.getAuditLogs);

module.exports = router;
