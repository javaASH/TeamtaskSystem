"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, errorMessage } from "@/lib/api";
import { btnCls, ErrorText, TaskRow } from "@/components/ui";

const SECTIONS = [
  ["assigned", "Assigned to me"],
  ["created", "Created by me"],
  ["overdue", "Overdue"],
];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/tasks/dashboard").then(setData).catch((e) => setError(errorMessage(e)));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <Link href="/tasks/new" className={btnCls}>Create task</Link>
      </div>
      <ErrorText error={error} />
      {!data && !error && <p className="text-zinc-500">Loading…</p>}
      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            {SECTIONS.map(([key, label]) => (
              <Link
                key={key}
                href={`/tasks?scope=${key}`}
                className="rounded-lg border border-zinc-200 bg-white p-4 hover:border-blue-400 dark:border-zinc-800 dark:bg-zinc-950"
              >
                <p className="text-sm text-zinc-500">{label}</p>
                <p className={`text-3xl font-semibold ${key === "overdue" && data.overdue.count ? "text-red-600" : ""}`}>
                  {data[key].count}
                </p>
              </Link>
            ))}
          </div>
          {SECTIONS.map(([key, label]) => (
            <section key={key} className="space-y-2">
              <h2 className="font-medium">{label}</h2>
              <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
                {data[key].tasks.length ? (
                  data[key].tasks.map((t) => <TaskRow key={t._id} task={t} />)
                ) : (
                  <p className="px-3 py-4 text-sm text-zinc-500">Nothing here.</p>
                )}
              </div>
            </section>
          ))}
        </>
      )}
    </div>
  );
}
