"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import TaskList from "@/components/TaskList";

// dashboard cards link here with ?scope=assigned|created|overdue, the top search bar with ?search=
function AllTasks() {
  const params = useSearchParams();
  const scope = params.get("scope") || "";
  const search = params.get("search") || "";
  return <TaskList key={`${scope}|${search}`} title="All tasks" initialScope={scope} initialSearch={search} />;
}

export default function TasksPage() {
  return (
    <Suspense fallback={<p className="text-zinc-500">Loading…</p>}>
      <AllTasks />
    </Suspense>
  );
}
