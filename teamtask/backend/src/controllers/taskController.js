const Task = require("../modals/Task");
const User = require("../modals/user");
const { validateTask, buildTaskFilter, isId } = require("../service/validate");
const { notify } = require("../service/notificationService");
const { audit } = require("../service/auditService");

const POPULATE = [
    { path: "createdBy", select: "name email" },
    { path: "assignedTo", select: "name email" },
];
const SORTS = ["createdAt", "-createdAt", "dueDate", "-dueDate", "updatedAt", "-updatedAt"];

const isPrivileged = (user) => user.role === "admin" || user.role === "manager";
const isCreator = (task, user) => String(task.createdBy._id ?? task.createdBy) === String(user._id);
const isAssignee = (task, user) => task.assignedTo && String(task.assignedTo._id ?? task.assignedTo) === String(user._id);
const canView = (task, user) => isPrivileged(user) || isCreator(task, user) || isAssignee(task, user);

async function assigneeExists(id) {
    return !id || Boolean(await User.exists({ _id: id }));
}

async function loadTask(req, res) {
    if (!isId(req.params.id)) {
        res.status(400).json({ message: "Invalid task id" });
        return null;
    }
    const task = await Task.findById(req.params.id);
    // 404 instead of 403 so users can't probe which task ids exist
    if (!task || !canView(task, req.user)) {
        res.status(404).json({ message: "Task not found" });
        return null;
    }
    return task;
}

async function createTask(req, res) {
    const { errors, value } = validateTask(req.body);
    if (errors.length) return res.status(400).json({ message: "Validation failed", errors });
    if (!(await assigneeExists(value.assignedTo))) return res.status(400).json({ message: "Assigned user does not exist" });

    const task = await Task.create({ ...value, createdBy: req.user._id });
    await audit(req.user._id, "created", task, value);
    if (task.assignedTo) {
        await notify(task.assignedTo, req.user._id, "assigned", `${req.user.name} assigned you "${task.title}"`, task._id);
        await audit(req.user._id, "assigned", task, { assignedTo: task.assignedTo });
    }
    res.status(201).json({ task: await task.populate(POPULATE) });
}

async function listTasks(req, res) {
    const { errors, filter } = buildTaskFilter(req.query, req.user);
    const sort = req.query.sort ?? "-createdAt";
    if (!SORTS.includes(sort)) errors.push(`sort must be one of ${SORTS.join(", ")}`);
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    if (errors.length) return res.status(400).json({ message: "Invalid query", errors });

    const [tasks, total] = await Promise.all([
        Task.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).populate(POPULATE),
        Task.countDocuments(filter),
    ]);
    res.json({ tasks, total, page, pages: Math.ceil(total / limit) || 1 });
}

async function getTask(req, res) {
    const task = await loadTask(req, res);
    if (task) res.json({ task: await task.populate(POPULATE) });
}

async function updateTask(req, res) {
    const task = await loadTask(req, res);
    if (!task) return;

    const { errors, value } = validateTask(req.body, { partial: true });
    if (errors.length) return res.status(400).json({ message: "Validation failed", errors });

    // the assignee (who isn't creator/admin/manager) may only move the task through statuses
    const fullAccess = isPrivileged(req.user) || isCreator(task, req.user);
    if (!fullAccess && Object.keys(value).some((k) => k !== "status"))
        return res.status(403).json({ message: "Assignees can only update the task status" });
    if (!(await assigneeExists(value.assignedTo))) return res.status(400).json({ message: "Assigned user does not exist" });

    const previousAssignee = task.assignedTo ? String(task.assignedTo) : null;
    const changes = {};
    for (const [k, v] of Object.entries(value)) {
        if (String(task[k] ?? null) !== String(v ?? null)) changes[k] = { from: task[k] ?? null, to: v };
    }
    if (!Object.keys(changes).length) return res.json({ task: await task.populate(POPULATE) });

    task.set(value);
    await task.save();
    await audit(req.user._id, "updated", task, changes);

    const newAssignee = task.assignedTo ? String(task.assignedTo) : null;
    if (changes.assignedTo && newAssignee) {
        await notify(newAssignee, req.user._id, "assigned", `${req.user.name} assigned you "${task.title}"`, task._id);
        await audit(req.user._id, "assigned", task, { from: previousAssignee, to: newAssignee });
    }
    // tell the other party (creator / existing assignee) about the change
    const summary = Object.keys(changes).filter((k) => k !== "assignedTo").join(", ");
    if (summary) {
        const msg = `${req.user.name} updated ${summary} on "${task.title}"`;
        const recipients = new Set([String(task.createdBy), previousAssignee === newAssignee ? newAssignee : null]);
        for (const r of recipients) if (r) await notify(r, req.user._id, "updated", msg, task._id);
    }
    res.json({ task: await task.populate(POPULATE) });
}

async function deleteTask(req, res) {
    const task = await loadTask(req, res);
    if (!task) return;
    if (!isPrivileged(req.user) && !isCreator(task, req.user))
        return res.status(403).json({ message: "Only the creator, a manager or an admin can delete this task" });

    await task.deleteOne();
    await audit(req.user._id, "deleted", task);
    res.json({ message: "Task deleted" });
}

// One request for the dashboard: counts plus the latest few tasks in each bucket.
async function dashboard(req, res) {
    const now = new Date();
    const uid = req.user._id;
    const buckets = {
        assigned: { assignedTo: uid },
        created: { createdBy: uid },
        overdue: { $or: [{ assignedTo: uid }, { createdBy: uid }], dueDate: { $lt: now }, status: { $ne: "done" } },
    };
    const result = {};
    await Promise.all(
        Object.entries(buckets).map(async ([name, filter]) => {
            const [tasks, count] = await Promise.all([
                Task.find(filter).sort(name === "overdue" ? { dueDate: 1 } : { createdAt: -1 }).limit(5).populate(POPULATE),
                Task.countDocuments(filter),
            ]);
            result[name] = { count, tasks };
        })
    );
    res.json(result);
}

module.exports = { createTask, listTasks, getTask, updateTask, deleteTask, dashboard };
