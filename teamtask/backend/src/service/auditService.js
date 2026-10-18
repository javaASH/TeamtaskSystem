const AuditLog = require("../modals/AuditLog");

// Audit failures must never break the user's request, so errors are logged and swallowed.
async function audit(userId, action, task, changes) {
    try {
        await AuditLog.create({ user: userId, action, task: task?._id, taskTitle: task?.title, changes });
    } catch (err) {
        console.error("audit log failed:", err.message);
    }
}

module.exports = { audit };
