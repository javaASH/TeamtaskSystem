const test = require("node:test");
const assert = require("node:assert");
const { validateRegister, validateTask, buildTaskFilter, escapeRegex } = require("../src/service/validate");

const user = {
    _id: "64b000000000000000000001",
    role: "user"
};
const admin = {
    _id: "64b000000000000000000002",
    role: "admin"
};

test("register: rejects weak password and bad email, normalises email", () => {
    assert.ok(
        validateRegister({
            name: "A",
            email: "nope",
            password: "short"
        }).errors.length >= 2
    );
    assert.ok(validateRegister({
        name: "A",
        email: "a@b.co",
        password: "allletters"
    }).errors.length
    );
    const { errors, value } = validateRegister({
        name: " Ann ",
        email: " Ann@X.com ",
        password: "secret123"
    });
    assert.deepStrictEqual(
        errors, []);
    assert.strictEqual(value.email,
        "ann@x.com"
    );
    assert.strictEqual(
        value.name, "Ann"
    );
});

test("register/task: blocks NoSQL operator objects", () => {
    assert.ok(validateRegister({ name: "A", email: { $gt: "" }, password: "secret123" }).errors.length);
    assert.ok(buildTaskFilter({ status: { $ne: "x" } }, user).errors.length);
});

test("task: create requires title, partial update needs at least one field", () => {
    assert.ok(validateTask({}).errors.length);
    assert.ok(validateTask({}, { partial: true }).errors.length);
    assert.deepStrictEqual(validateTask({ status: "done" }, { partial: true }).value, { status: "done" });
    assert.ok(validateTask({ title: "x", priority: "urgent" }).errors.length);
    assert.ok(validateTask({ title: "x", dueDate: "not-a-date" }).errors.length);
    assert.strictEqual(validateTask({ title: "x", assignedTo: "" }).value.assignedTo, null);
});

test("filter: regular users only see their own tasks, admins see all", () => {
    assert.ok(JSON.stringify(buildTaskFilter({}, user).filter).includes("createdBy"));
    assert.deepStrictEqual(buildTaskFilter({}, admin).filter, {});
});

test("filter: search is regex-escaped and overdue excludes done", () => {
    assert.strictEqual(escapeRegex("a.*b"), "a\\.\\*b");
    const now = new Date("2026-01-01");
    const { filter } = buildTaskFilter({ search: "fix (bug)", scope: "overdue" }, admin, now);
    const [search, overdue] = filter.$and;
    assert.ok(search.$or[0].title.test("Fix (bug) now"));
    assert.deepStrictEqual(overdue, { dueDate: { $lt: now }, status: { $ne: "done" } });
});
