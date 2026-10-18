const User = require("../modals/user");

// Loads the logged-in user from the session on every protected request,
// so role changes and deleted accounts take effect immediately.
async function requireAuth(req, res, next) {
    if (!req.session.userId) return res.status(401).json({ message: "Not authenticated" });
    const user = await User.findById(req.session.userId);
    if (!user) {
        req.session.destroy(() => {});
        return res.status(401).json({ message: "Not authenticated" });
    }
    req.user = user;
    next();
}

const requireRole = (...roles) => (req, res, next) =>
    roles.includes(req.user.role) ? next() : res.status(403).json({ message: "Forbidden" });

module.exports = { requireAuth, requireRole };
