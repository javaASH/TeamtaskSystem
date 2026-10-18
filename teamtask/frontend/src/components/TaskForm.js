"use client";

import { useEffect, useState } from "react";
import { api, PRIORITIES, STATUSES, errorMessage } from "@/lib/api";
import { btnCls, ErrorText, inputCls, useSingleFlight } from "./ui";

const toForm = (t = {}) => ({
  title: t.title || "",
  description: t.description || "",
  dueDate: t.dueDate ? t.dueDate.slice(0, 10) : "",
  priority: t.priority || "medium",
  status: t.status || "todo",
  assignedTo: t.assignedTo?._id || "",
});

// statusOnly: the assignee may only change status, so the other fields are locked
export default function TaskForm({ task, statusOnly = false, submitLabel, onSubmit }) {
  const [form, setForm] = useState(() => toForm(task));
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [runOnce, saving] = useSingleFlight();

  useEffect(() => {
    api("/users").then((d) => setUsers(d.users)).catch(() => {});
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setError("");
    await runOnce(async () => {
      try {
        await onSubmit(statusOnly ? { status: form.status } : { ...form, assignedTo: form.assignedTo || null, dueDate: form.dueDate || null });
      } catch (err) {
        setError(errorMessage(err));
      }
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <ErrorText error={error} />
      <label className="block space-y-1">
        <span className="text-sm font-medium">Title</span>
        <input className={inputCls} value={form.title} onChange={set("title")} required maxLength={120} disabled={statusOnly} />
      </label>
      <label className="block space-y-1">
        <span className="text-sm font-medium">Description</span>
        <textarea className={inputCls} rows={4} value={form.description} onChange={set("description")} maxLength={2000} disabled={statusOnly} />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1">
          <span className="text-sm font-medium">Due date</span>
          <input type="date" className={inputCls} value={form.dueDate} onChange={set("dueDate")} disabled={statusOnly} />
        </label>
        <label className="block space-y-1">
          <span className="text-sm font-medium">Assignee</span>
          <select className={inputCls} value={form.assignedTo} onChange={set("assignedTo")} disabled={statusOnly}>
            <option value="">Unassigned</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
            ))}
          </select>
        </label>
        <label className="block space-y-1">
          <span className="text-sm font-medium">Priority</span>
          <select className={inputCls} value={form.priority} onChange={set("priority")} disabled={statusOnly}>
            {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
          </select>
        </label>
        <label className="block space-y-1">
          <span className="text-sm font-medium">Status</span>
          <select className={inputCls} value={form.status} onChange={set("status")}>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </label>
      </div>
      <button className={btnCls} disabled={saving}>{saving ? "Saving…" : submitLabel}</button>
    </form>
  );
}
