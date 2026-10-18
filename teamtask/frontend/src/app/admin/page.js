"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, formatDate, errorMessage } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import { btnGhostCls, ErrorText, inputCls } from "@/components/ui";

const ROLES = ["admin", "manager", "user"];

export default function AdminPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const isAdmin = user.role === "admin";

  useEffect(() => {
    api("/users").then((d) => setUsers(d.users)).catch((e) => setError(errorMessage(e)));
  }, []);

  useEffect(() => {
    if (user.role === "user") return;
    api("/audit", { query: { page } }).then(setLogs).catch((e) => setError(errorMessage(e)));
  }, [page, user.role]);

  if (user.role === "user") return <ErrorText error="Admins and managers only." />;

  async function changeRole(id, role) {
    setError("");
    try {
      const d = await api(`/users/${id}/role`, { method: "PATCH", body: { role } });
      setUsers((us) => us.map((u) => (u._id === id ? { ...u, role: d.user.role } : u)));
    } catch (e) {
      setError(errorMessage(e));
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Admin</h1>
      <ErrorText error={error} />

      <section className="space-y-2">
        <h2 className="font-medium">Team</h2>
        <ul className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          {users.map((u) => (
            <li key={u._id} className="flex flex-wrap items-center gap-2 border-b border-zinc-100 px-3 py-2.5 last:border-0 dark:border-zinc-800">
              <span className="min-w-0 flex-1">
                {u.name} <span className="text-sm text-zinc-500">{u.email}</span>
              </span>
              {isAdmin && u._id !== user._id ? (
                <select className={`${inputCls} w-32`} value={u.role} onChange={(e) => changeRole(u._id, e.target.value)} aria-label={`Role for ${u.name}`}>
                  {ROLES.map((r) => <option key={r}>{r}</option>)}
                </select>
              ) : (
                <span className="text-sm text-zinc-500">{u.role}</span>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="font-medium">Audit log</h2>
        <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <table className="w-full text-sm">
            <thead className="text-left text-zinc-500">
              <tr>
                <th className="px-3 py-2 font-medium">Date</th>
                <th className="px-3 py-2 font-medium">User</th>
                <th className="px-3 py-2 font-medium">Action</th>
                <th className="px-3 py-2 font-medium">Task</th>
                <th className="px-3 py-2 font-medium">Changes</th>
              </tr>
            </thead>
            <tbody>
              {logs?.logs.map((l) => (
                <tr key={l._id} className="border-t border-zinc-100 align-top dark:border-zinc-800">
                  <td className="whitespace-nowrap px-3 py-2">{formatDate(l.createdAt)}</td>
                  <td className="px-3 py-2">{l.user?.name || "—"}</td>
                  <td className="px-3 py-2">{l.action}</td>
                  <td className="px-3 py-2">
                    {l.task && l.action !== "deleted" ? <Link href={`/tasks/${l.task}`} className="text-blue-600 hover:underline">{l.taskTitle}</Link> : l.taskTitle}
                  </td>
                  <td className="px-3 py-2 text-xs text-zinc-500">
                    {l.changes ? Object.keys(l.changes).join(", ") : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {logs && !logs.logs.length && <p className="px-3 py-4 text-sm text-zinc-500">No activity yet.</p>}
        </div>
        {logs && logs.pages > 1 && (
          <div className="flex items-center justify-center gap-3 text-sm">
            <button className={btnGhostCls} disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
            <span>Page {logs.page} of {logs.pages}</span>
            <button className={btnGhostCls} disabled={page >= logs.pages} onClick={() => setPage((p) => p + 1)}>Next</button>
          </div>
        )}
      </section>
    </div>
  );
}
