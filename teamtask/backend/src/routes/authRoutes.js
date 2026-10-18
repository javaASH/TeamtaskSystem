const router = require("express").Router();
const rateLimit = require("express-rate-limit");
const { register, login, logout, me, updatePreferences } = require("../controllers/authController");
const { requireAuth } = require("../middleware/auth");

// slows down password guessing
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false,
    message: { message: "Too many attempts, try again in 15 minutes" } });

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/logout", logout);
router.get("/me", requireAuth, me);
router.patch("/preferences", requireAuth, updatePreferences);

module.exports = router;
