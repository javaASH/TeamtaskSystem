// Pure input validation. Every value from req.body / req.query is checked to be the
// expected primitive type, which also blocks NoSQL operator injection ({ "$gt": "" }).
// all Validation exist here to run on every value on req.body
const mongoose = require("mongoose");
const { STATUSES, PRIORITIES } = require("../modals/Task");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isStr = (v) => typeof v === "string";
const isId = (v) => isStr(v) && mongoose.isValidObjectId(v);
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function validateRegister(body = {}) {
    const errors = [];
    const { name, email, password } = body;
    if (!isStr(name) || !name.trim() || name.trim().length > 60)
        errors.push("name is required (max 60 chars)");
    if (!isStr(email) || !EMAIL_RE.test(email.trim()))
        errors.push("a valid email is required");
    if (!isStr(password) || password.length < 8 || password.length > 72)
        errors.push("password must be 8-72 characters"); // bcrypt ignores bytes past 72
    else if (!/[A-Za-z]/.test(password) || !/\d/.test(password))
        errors.push("password must contain a letter and a number");
    return { errors, value: errors.length ? null : { name: name.trim(), email: email.trim().toLowerCase(), password } };
}

function validateLogin(body = {}) {
    const { email, password } = body;
    const ok = isStr(email) && isStr(password) && email && password;
    return { errors: ok ? [] : ["email and password are required"], value: ok ? { email: email.trim().toLowerCase(), password } : null };
}

// partial = true for PATCH: only provided fields are checked
function validateTask(body = {}, { partial = false } = {}) {
    const errors = [];
    const value = {};
    const has = (k) => body[k] !== undefined;

    if (has("title") || !partial) {
        if (!isStr(body.title) || !body.title.trim() || body.title.trim().length > 120)
            errors.push("title is required (max 120 chars)");
        else value.title = body.title.trim();
    }
    if (has("description")) {
        if (!isStr(body.description) || body.description.length > 2000) errors.push("description must be text (max 2000 chars)");
        else value.description = body.description.trim();
    }
    if (has("dueDate")) {
        if (body.dueDate === null || body.dueDate === "") value.dueDate = null;
        else if (!isStr(body.dueDate) || isNaN(Date.parse(body.dueDate))) errors.push("dueDate must be a valid date");
        else value.dueDate = new Date(body.dueDate);
    }
    if (has("priority")) {
        if (!PRIORITIES.includes(body.priority)) errors.push(`priority must be one of ${PRIORITIES.join(", ")}`);
        else value.priority = body.priority;
    }
    if (has("status")) {
        if (!STATUSES.includes(body.status)) errors.push(`status must be one of ${STATUSES.join(", ")}`);
        else value.status = body.status;
    }
    if (has("assignedTo")) {
        if (body.assignedTo === null || body.assignedTo === "") value.assignedTo = null;
        else if (!isId(body.assignedTo)) errors.push("assignedTo must be a valid user id");
        else value.assignedTo = body.assignedTo;
    }
    if (partial && !errors.length && !Object.keys(value).length) errors.push("no valid fields to update");
    return { errors, value: errors.length ? null : value };
}

// Builds the Mongo filter for GET /api/tasks from query params.
// scope: "assigned" | "created" | "overdue" | undefined (all visible tasks)
function buildTaskFilter(query = {}, user, now = new Date()) {
    const errors = [];
    const and = [];
    const privileged = user.role === "admin" || user.role === "manager";
    const uid = new mongoose.Types.ObjectId(String(user._id));

    if (!privileged) and.push({ $or: [{ createdBy: uid }, { assignedTo: uid }] });

    const { search, status, priority, dueFrom, dueTo, scope } = query;
    if (search !== undefined) {
        if (!isStr(search) || search.length > 100) errors.push("search must be text (max 100 chars)");
        else if (search.trim()) {
            const re = new RegExp(escapeRegex(search.trim()), "i");
            and.push({ $or: [{ title: re }, { description: re }] });
        }
    }
    if (status !== undefined) {
        if (!STATUSES.includes(status)) errors.push(`status must be one of ${STATUSES.join(", ")}`);
        else and.push({ status });
    }
    if (priority !== undefined) {
        if (!PRIORITIES.includes(priority)) errors.push(`priority must be one of ${PRIORITIES.join(", ")}`);
        else and.push({ priority });
    }
    const due = {};
    for (const [key, op] of [["dueFrom", "$gte"], ["dueTo", "$lte"]]) {
        const v = query[key];
        if (v === undefined) continue;
        if (!isStr(v) || isNaN(Date.parse(v))) errors.push(`${key} must be a valid date`);
        else due[op] = new Date(v);
    }
    if (Object.keys(due).length) and.push({ dueDate: due });

    if (scope !== undefined) {
        if (scope === "assigned") and.push({ assignedTo: uid });
        else if (scope === "created") and.push({ createdBy: uid });
        else if (scope === "overdue") and.push({ dueDate: { $lt: now }, status: { $ne: "done" } });
        else errors.push("scope must be one of assigned, created, overdue");
    }
    return { errors, filter: and.length ? { $and: and } : {} };
}

module.exports = { validateRegister, validateLogin, validateTask, buildTaskFilter, escapeRegex, isId };
