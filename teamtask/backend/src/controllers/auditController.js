const AuditLog = require("../modals/AuditLog");
const { isId } = require("../service/validate");

// Admin / manager: newest first, optional ?task=<id> or ?user=<id>
async function listAuditLogs(req, res) {
    const filter = {};
    for (const key of ["task", "user"]) {
        const v = req.query[key];
        if (v === undefined) continue;
        if (!isId(v)) return res.status(400).json({
            message: `Invalid ${key} id`
        });
        filter[key] = v;
    }
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 50));
    const [logs, total] = await Promise.all([
        AuditLog.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate("user", "name email"),
        AuditLog.countDocuments(filter),
    ]);
    res.json({ logs, total, page, pages: Math.ceil(total / limit) || 1 });
}

module.exports = { listAuditLogs };
