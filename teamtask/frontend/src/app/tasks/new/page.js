"use client";

import { useRouter } from "next/navigation";
import { useRef } from "react";
import { api } from "@/lib/api";
import TaskForm from "@/components/TaskForm";

export default function NewTaskPage() {
  const router = useRouter();
  const created = useRef(false);

  async function create(body) {
    // the form unlocks before navigation finishes; don't create a duplicate on a late extra click
    if (created.current) return;
    const { task } = await api("/tasks", { method: "POST", body });
    created.current = true;
    router.push(`/tasks/${task._id}`);
  }

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-2xl font-semibold">Create task</h1>
      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <TaskForm submitLabel="Create task" onSubmit={create} />
      </div>
    </div>
  );
}
