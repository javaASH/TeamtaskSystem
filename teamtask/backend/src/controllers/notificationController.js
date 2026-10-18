const Notification = require("../modals/Notification");
const { isId } = require("../service/validate");

async function listNotifications(req, res) {
    const filter = { user: req.user._id };
    if (req.query.unread === "true") filter.read = false;
    const [notifications, unreadCount] = await Promise.all([
        Notification.find(filter).sort({ createdAt: -1 }).limit(50).populate("task", "title"),
        Notification.countDocuments({ user: req.user._id, read: false }),
    ]);
    res.json({ notifications, unreadCount });
}

async function markRead(req, res) {
    if (!isId(req.params.id)) return res.status(400).json({ message: "Invalid notification id" });
    // scoped to the owner so users can't touch each other's notifications
    const notification = await Notification.findOneAndUpdate(
        { _id: req.params.id, user: req.user._id },
        { read: true },
        { returnDocument: "after" }
    );
    if (!notification) return res.status(404).json({ message: "Notification not found" });
    res.json({ notification });
}

async function markAllRead(req, res) {
    const { modifiedCount } = await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
    res.json({ updated: modifiedCount });
}

module.exports = { listNotifications, markRead, markAllRead };
