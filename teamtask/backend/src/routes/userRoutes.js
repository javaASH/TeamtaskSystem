const router = require("express").Router();
const { listUsers, updateRole } = require("../controllers/userController");
const { requireAuth, requireRole } = require("../middleware/auth");

router.use(requireAuth);
router.get("/", listUsers);
router.patch("/:id/role", requireRole("admin"), updateRole);

module.exports = router;
