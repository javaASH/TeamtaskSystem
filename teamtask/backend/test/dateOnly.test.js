const test = require("node:test");
const assert = require("node:assert");
const Task = require("../src/modals/Task");
const User = require("../src/modals/user");

test("API JSON shows createdAt/updatedAt as date only, document keeps full Date", () => {
    const at = new Date("2026-10-18T15:42:10.123Z");
    const task = new Task({ title: "t", createdBy: "64b000000000000000000001", createdAt: at, updatedAt: at });
    const json = JSON.parse(JSON.stringify(task));
    assert.strictEqual(json.createdAt, "2026-10-18");
    assert.strictEqual(json.updatedAt, "2026-10-18");
    assert.ok(task.createdAt instanceof Date);

    const user = JSON.parse(JSON.stringify(new User({ name: "a", email: "a@b.co", password: "x", createdAt: at })));
    assert.strictEqual(user.createdAt, "2026-10-18");
    assert.strictEqual(user.password, undefined);
});
