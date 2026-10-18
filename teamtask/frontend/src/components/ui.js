import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { formatDate, isOverdue } from "@/lib/api";

export const inputCls =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900";
export const btnCls =
  "rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50";
export const btnGhostCls =
  "rounded-md border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-800";

const BADGE = {
  todo: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  "in-progress": "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  done: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  low: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  medium: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  high: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
};

// Runs one async action at a time: extra clicks while it is running are ignored (double-click safe).
// A ref, not state, is the lock, because state updates land too late to stop a fast second click.
export function useSingleFlight() {
  const running = useRef(false);
  const [busy, setBusy] = useState(false);
  const run = useCallback(async (fn) => {
    if (running.current) return;
    running.current = true;
    setBusy(true);
    try {
      return await fn();
    } finally {
      running.current = false;
      setBusy(false);
    }
  }, []);
  return [run, busy];
}

export const Badge = ({ value }) => (
  <span className={`rounded px-2 py-0.5 text-xs font-medium ${BADGE[value] || ""}`}>{value}</span>
);

export const ErrorText = ({ error }) =>
  error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">{error}</p> : null;

export function TaskRow({ task }) {
  return (
    <Link
      href={`/tasks/${task._id}`}
      className="flex flex-wrap items-center gap-2 border-b border-zinc-100 px-3 py-2.5 last:border-0 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
    >
      <span className="min-w-0 flex-1 truncate font-medium">{task.title}</span>
      <Badge value={task.priority} />
      <Badge value={task.status} />
      <span className={`w-24 text-right text-xs ${isOverdue(task) ? "font-medium text-red-600" : "text-zinc-500"}`}>
        {formatDate(task.dueDate)}
      </span>
      <span className="w-28 truncate text-right text-xs text-zinc-500">{task.assignedTo?.name || "Unassigned"}</span>
    </Link>
  );
}
