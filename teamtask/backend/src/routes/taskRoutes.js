const router = require("express").Router();
const c = require("../controllers/taskController");
const { requireAuth } = require("../middleware/auth");

router.use(requireAuth);
router.get("/dashboard", c.dashboard); // before /:id so "dashboard" isn't read as an id
router.route("/").get(c.listTasks).post(c.createTask);
router.route("/:id").get(c.getTask).patch(c.updateTask).delete(c.deleteTask);

module.exports = router;
