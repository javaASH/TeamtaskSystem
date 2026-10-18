"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, formatDate, errorMessage } from "@/lib/api";
import { btnGhostCls, ErrorText, useSingleFlight } from "@/components/ui";

export default function NotificationsPage() {
  const [data, setData] = useState(null);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [error, setError] = useState("");
  const [runOnce, busy] = useSingleFlight();

  const load = () =>
    api("/notifications", { query: { unread: unreadOnly ? "true" : "" } }).then(setData).catch((e) => setError(errorMessage(e)));

  useEffect(() => { load(); }, [unreadOnly]); // eslint-disable-line react-hooks/exhaustive-deps

  const run = (fn) => runOnce(async () => {
    setError("");
    try { await fn(); await load(); } catch (e) { setError(errorMessage(e)); }
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">Notifications</h1>
        <div className="flex gap-2">
          <button className={btnGhostCls} onClick={() => setUnreadOnly((v) => !v)}>
            {unreadOnly ? "Show all" : "Unread only"}
          </button>
          <button className={btnGhostCls} disabled={busy || !data?.unreadCount} onClick={() => run(() => api("/notifications/read-all", { method: "PATCH" }))}>
            Mark all read
          </button>
        </div>
      </div>

      <ErrorText error={error} />
      <ul className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        {!data && <li className="px-3 py-4 text-sm text-zinc-500">Loading…</li>}
        {data && !data.notifications.length && <li className="px-3 py-4 text-sm text-zinc-500">No notifications.</li>}
        {data?.notifications.map((n) => (
          <li key={n._id} className={`flex flex-wrap items-center gap-2 border-b border-zinc-100 px-3 py-2.5 last:border-0 dark:border-zinc-800 ${n.read ? "text-zinc-500" : ""}`}>
            {!n.read && <span className="h-2 w-2 rounded-full bg-blue-600" aria-label="unread" />}
            <span className="min-w-0 flex-1">
              {n.task ? <Link href={`/tasks/${n.task._id}`} className="hover:underline">{n.message}</Link> : n.message}
            </span>
            <span className="text-xs text-zinc-500">{formatDate(n.createdAt)}</span>
            {!n.read && (
              <button className="text-xs text-blue-600 hover:underline" onClick={() => run(() => api(`/notifications/${n._id}/read`, { method: "PATCH" }))}>
                Mark read
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
