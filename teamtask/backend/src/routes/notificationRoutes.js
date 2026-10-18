const router = require("express").Router();
const { listNotifications, markRead, markAllRead } = require("../controllers/notificationController");
const { requireAuth } = require("../middleware/auth");

router.use(requireAuth);
router.get("/", listNotifications);
router.patch("/read-all", markAllRead);
router.patch("/:id/read", markRead);

module.exports = router;
