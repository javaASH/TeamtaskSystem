"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api, formatDate, errorMessage } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import TaskForm from "@/components/TaskForm";
import { ErrorText, useSingleFlight } from "@/components/ui";

export default function TaskPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [task, setTask] = useState(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [runOnce, deleting] = useSingleFlight();

  useEffect(() => {
    api(`/tasks/${id}`).then((d) => setTask(d.task)).catch((e) => setError(errorMessage(e)));
  }, [id]);

  if (error && !task) return <ErrorText error={error} />;
  if (!task) return <p className="text-zinc-500">Loading…</p>;

  // mirrors the backend rules in taskController
  const fullAccess = user.role !== "user" || task.createdBy?._id === user._id;

  async function save(body) {
    const d = await api(`/tasks/${id}`, { method: "PATCH", body });
    setTask(d.task);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const remove = () => runOnce(async () => {
    if (!window.confirm(`Delete "${task.title}"?`)) return;
    try {
      await api(`/tasks/${id}`, { method: "DELETE" });
      router.push("/tasks");
    } catch (e) {
      setError(errorMessage(e));
    }
  });

  return (
    <div className="max-w-2xl space-y-4">
      <Link href="/tasks" className="text-sm text-blue-600 hover:underline">← All tasks</Link>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h1 className="text-2xl font-semibold">{task.title}</h1>
        {fullAccess && (
          <button onClick={remove} disabled={deleting} className="disabled:opacity-50 rounded-md border border-red-300 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950">
            Delete
          </button>
        )}
      </div>
      <p className="text-sm text-zinc-500">
        Created by {task.createdBy?.name} on {formatDate(task.createdAt)} · updated {formatDate(task.updatedAt)}
      </p>
      <ErrorText error={error} />
      {saved && <p className="text-sm text-green-600">Saved.</p>}
      {!fullAccess && <p className="text-sm text-zinc-500">You are the assignee, so you can only change the status.</p>}
      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <TaskForm key={task.updatedAt + task.status} task={task} statusOnly={!fullAccess} submitLabel="Save changes" onSubmit={save} />
      </div>
    </div>
  );
}
