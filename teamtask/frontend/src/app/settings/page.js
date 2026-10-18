"use client";

import { useState } from "react";
import { api, formatDate, errorMessage } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import { btnGhostCls, ErrorText, useSingleFlight } from "@/components/ui";

const card = "space-y-3 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950";

export default function SettingsPage() {
  const { user, setUser, logout } = useAuth();
  const [error, setError] = useState("");
  const [runOnce, saving] = useSingleFlight();

  const togglePref = (key) => runOnce(async () => {
    setError("");
    try {
      const d = await api("/auth/preferences", { method: "PATCH", body: { [key]: !(user.notificationPrefs?.[key] ?? true) } });
      setUser(d.user);
    } catch (e) {
      setError(errorMessage(e));
    }
  });

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <ErrorText error={error} />

      <section className={card}>
        <h2 className="font-medium">Account</h2>
        <dl className="grid grid-cols-[8rem_1fr] gap-y-2 text-sm">
          <dt className="text-zinc-500">Name</dt><dd>{user.name}</dd>
          <dt className="text-zinc-500">Email</dt><dd>{user.email}</dd>
          <dt className="text-zinc-500">Role</dt><dd className="capitalize">{user.role}</dd>
          <dt className="text-zinc-500">Member since</dt><dd>{formatDate(user.createdAt)}</dd>
        </dl>
      </section>

      <section className={card}>
        <h2 className="font-medium">Notify me when</h2>
        {[["assigned", "a task is assigned to me"], ["updated", "a task of mine is updated"]].map(([key, label]) => (
          <label key={key} className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={user.notificationPrefs?.[key] ?? true} onChange={() => togglePref(key)} disabled={saving} />
            {label}
          </label>
        ))}
      </section>

      <section className={card}>
        <h2 className="font-medium">Session</h2>
        <button className={btnGhostCls} onClick={() => logout()}>Log out</button>
      </section>
    </div>
  );
}
