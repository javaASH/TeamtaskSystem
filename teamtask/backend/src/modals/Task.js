const mongoose = require("mongoose");
const dateOnly = require("./dateOnly");

const STATUSES = ["todo", "in-progress", "done"];
const PRIORITIES = ["low", "medium", "high"];

const taskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 120
        },
        description: {
            type: String,
            trim: true,
            maxlength: 2000,
            default: ""
        },
        dueDate: {
            type: Date
        },
        priority: {
            type: String,
            enum: PRIORITIES,
            default: "medium"
        },
        status: {
            type: String,
            enum: STATUSES,
            default: "todo" },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },
    },
    { timestamps: true }
);

taskSchema.index({ assignedTo: 1, status: 1, dueDate: 1 });
taskSchema.index({ createdBy: 1 });
taskSchema.set("toJSON", { transform: dateOnly });

module.exports = mongoose.model("Task", taskSchema);
module.exports.STATUSES = STATUSES;
module.exports.PRIORITIES = PRIORITIES;
