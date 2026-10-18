const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        action: { type: String, enum: ["created", "updated", "assigned", "deleted"], required: true },
        task: { type: mongoose.Schema.Types.ObjectId, ref: "Task" },
        taskTitle: String, // kept so the log still reads after the task is deleted
        changes: { type: Object },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

module.exports = mongoose.model("AuditLog", auditLogSchema);
