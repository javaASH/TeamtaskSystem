const router = require("express").Router();
const { listAuditLogs } = require("../controllers/auditController");
const { requireAuth, requireRole } = require("../middleware/auth");

router.get("/", requireAuth, requireRole("admin", "manager"), listAuditLogs);

module.exports = router;
