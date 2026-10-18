"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, PRIORITIES, STATUSES, errorMessage } from "@/lib/api";
import { btnCls, btnGhostCls, ErrorText, inputCls, TaskRow } from "@/components/ui";

const SORTS = [
  ["-createdAt", "Newest"],
  ["createdAt", "Oldest"],
  ["dueDate", "Due soonest"],
  ["-dueDate", "Due latest"],
  ["-updatedAt", "Recently updated"],
];

// fixedScope locks the list to one view (My tasks, Created by me) and hides the scope picker
export default function TaskList({ title = "Tasks", scope: fixedScope, initialScope = "", initialSearch = "" }) {
  const [filters, setFilters] = useState({
    search: initialSearch, status: "", priority: "", scope: fixedScope ?? initialScope, dueFrom: "", dueTo: "", sort: "-createdAt",
  });
  const [search, setSearch] = useState(initialSearch);
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  // debounce typing so each keystroke doesn't hit the API
  useEffect(() => {
    const id = setTimeout(() => setFilters((f) => (f.search === search ? f : { ...f, search })), 300);
    return () => clearTimeout(id);
  }, [search]);

  useEffect(() => {
    setError("");
    api("/tasks", { query: { ...filters, page, limit: 20 } }).then(setData).catch((e) => setError(errorMessage(e)));
  }, [filters, page]);

  const set = (k) => (e) => { setFilters((f) => ({ ...f, [k]: e.target.value })); setPage(1); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <Link href="/tasks/new" className={btnCls}>Create task</Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <input className={`${inputCls} sm:col-span-3 lg:col-span-4`} placeholder="Search title or description…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} maxLength={100} aria-label="Search" />
        {fixedScope === undefined && (
        <select className={inputCls} value={filters.scope} onChange={set("scope")} aria-label="Scope">
          <option value="">All visible tasks</option>
          <option value="assigned">Assigned to me</option>
          <option value="created">Created by me</option>
          <option value="overdue">Overdue</option>
        </select>
        )}
        <select className={inputCls} value={filters.status} onChange={set("status")} aria-label="Status">
          <option value="">Any status</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select className={inputCls} value={filters.priority} onChange={set("priority")} aria-label="Priority">
          <option value="">Any priority</option>
          {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
        </select>
        <select className={inputCls} value={filters.sort} onChange={set("sort")} aria-label="Sort">
          {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <label className="flex items-center gap-2 text-sm">
          <span className="shrink-0 text-zinc-500">Due from</span>
          <input type="date" className={inputCls} value={filters.dueFrom} onChange={set("dueFrom")} />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <span className="shrink-0 text-zinc-500">Due to</span>
          <input type="date" className={inputCls} value={filters.dueTo} onChange={set("dueTo")} />
        </label>
      </div>

      <ErrorText error={error} />
      <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        {!data ? (
          <p className="px-3 py-4 text-sm text-zinc-500">Loading…</p>
        ) : data.tasks.length ? (
          data.tasks.map((t) => <TaskRow key={t._id} task={t} />)
        ) : (
          <p className="px-3 py-4 text-sm text-zinc-500">No tasks match these filters.</p>
        )}
      </div>

      {data && data.pages > 1 && (
        <div className="flex items-center justify-center gap-3 text-sm">
          <button className={btnGhostCls} disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
          <span>Page {data.page} of {data.pages} · {data.total} tasks</span>
          <button className={btnGhostCls} disabled={page >= data.pages} onClick={() => setPage((p) => p + 1)}>Next</button>
        </div>
      )}
    </div>
  );
}

