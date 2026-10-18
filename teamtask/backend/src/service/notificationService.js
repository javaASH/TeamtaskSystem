const Notification = require("../modals/Notification");
const User = require("../modals/user");

// Creates an in-app notification unless the recipient is the actor or has muted this type.
async function notify(recipientId, actorId, type, message, taskId) {
    if (!recipientId || String(recipientId) === String(actorId)) return null;
    const recipient = await User.findById(recipientId).select("notificationPrefs");
    if (!recipient || recipient.notificationPrefs?.[type] === false) return null;
    return Notification.create({ user: recipientId, type, message, task: taskId });
}

module.exports = { notify };
