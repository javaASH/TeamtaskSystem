const User = require("../modals/user");
const { ROLES } = require("../modals/user");
const { isId } = require("../service/validate");

// Any logged-in user can list teammates so they can assign tasks.
async function listUsers(req, res) {
    const users = await User.find().select("name email role").sort({ name: 1 });
    res.json({ users });
}

// Admin only: change a user's role.
async function updateRole(req, res) {
    const { id } = req.params;
    const { role } = req.body || {};
    if (!isId(id)) return res.status(400).json({ message: "Invalid user id" });
    if (!ROLES.includes(role)) return res.status(400).json({ message: `role must be one of ${ROLES.join(", ")}` });
    if (String(req.user._id) === id) return res.status(400).json({ message: "You cannot change your own role" });

    const user = await User.findByIdAndUpdate(id, { role }, { returnDocument: "after" });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
}

module.exports = { listUsers, updateRole };
