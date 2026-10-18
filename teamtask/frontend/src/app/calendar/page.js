"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, errorMessage } from "@/lib/api";
import { btnGhostCls, ErrorText } from "@/components/ui";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DOT = { low: "bg-zinc-400", medium: "bg-blue-500", high: "bg-red-500" };
const pad = (n) => String(n).padStart(2, "0");
const key = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;

// the API caps limit at 100, so walk every page of the month
async function loadMonth(y, m) {
  const query = { dueFrom: key(y, m, 1), dueTo: key(y, m, new Date(y, m + 1, 0).getDate()), sort: "dueDate", limit: 100 };
  const tasks = [];
  for (let page = 1; ; page++) {
    const d = await api("/tasks", { query: { ...query, page } });
    tasks.push(...d.tasks);
    if (page >= d.pages) return tasks;
  }
}

export default function CalendarPage() {
    const now = new Date();
    const [month, setMonth] = useState({y: now.getFullYear(), m: now.getMonth()});
    const [tasks, setTasks] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTasks(null);
        setError("");
        loadMonth(month.y, month.m).then(setTasks).catch((e) => setError(errorMessage(e)));
    }, [month]);

    const shift = (n) => setMonth(({y, m}) => ({
        y: new Date(y, m + n).getFullYear(),
        m: new Date(y, m + n).getMonth()
    }));

    // due dates are stored as UTC midnight of the picked day
    const byDay = {};
    for (const t of tasks || []) (byDay[t.dueDate.slice(0, 10)] ||= []).push(t);

    const blanks = new Date(month.y, month.m, 1).getDay();
    const days = new Date(month.y, month.m + 1, 0).getDate();
    const today = key(now.getFullYear(), now.getMonth(), now.getDate());

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h1 className="text-2xl font-semibold">
                    {new Date(month.y, month.m).toLocaleDateString(undefined, {month: "long", year: "numeric"})}
                </h1>
                <div className="flex gap-2">
                    <button className={btnGhostCls} onClick={() => shift(-1)}>Previous</button>
                    <button className={btnGhostCls}
                            onClick={() => setMonth({y: now.getFullYear(), m: now.getMonth()})}>Today
                    </button>
                    <button className={btnGhostCls} onClick={() => shift(1)}>Next</button>
                </div>
            </div>

            <ErrorText error={error}/>
            {!tasks && !error && <p className="text-sm text-zinc-500">Loading…</p>}

            <div
                className="grid grid-cols-7 overflow-hidden rounded-lg border border-zinc-200 bg-white text-sm dark:border-zinc-800 dark:bg-zinc-950">
                {WEEKDAYS.map((d) => (
                    <div key={d}
                         className="border-b border-zinc-200 px-2 py-1.5 text-xs font-medium text-zinc-500 dark:border-zinc-800">{d}</div>
                ))}
                {Array.from({length: blanks}, (_, i) => <div key={`b${i}`}
                                                             className="min-h-24 border-b border-r border-zinc-100 dark:border-zinc-900"/>)}
                {Array.from({length: days}, (_, i) => {
                    const k = key(month.y, month.m, i + 1);
                    return (
                        <div key={k}
                             className="min-h-24 min-w-0 space-y-1 border-b border-r border-zinc-100 p-1.5 dark:border-zinc-900">
                            <div
                                className={`text-xs ${k === today ? "inline-block rounded-full bg-blue-600 px-1.5 font-semibold text-white" : "text-zinc-500"}`}>{i + 1}</div>
                            {byDay[k]?.map((t) => (
                                <Link
                                    key={t._id}
                                    href={`/tasks/${t._id}`}
                                    title={`${t.title} · ${t.status}`}
                                    className={`flex items-center gap-1 truncate rounded px-1 py-0.5 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 ${t.status === "done" ? "text-zinc-400 line-through" : ""}`}
                                >
                                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${DOT[t.priority]}`}/>
                                    <span className="truncate">{t.title}</span>
                                </Link>
                            ))}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
