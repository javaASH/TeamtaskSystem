const mongoose = require("mongoose");
const dateOnly = require("./dateOnly");

const notificationSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
        type: { type: String, enum: ["assigned", "updated"], required: true },
        message: { type: String, required: true },
        task: { type: mongoose.Schema.Types.ObjectId, ref: "Task" },
        read: { type: Boolean, default: false },
    },
    { timestamps: true }
);

notificationSchema.set("toJSON", { transform: dateOnly });

module.exports = mongoose.model("Notification", notificationSchema);
