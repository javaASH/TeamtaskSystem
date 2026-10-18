"use client";

import { errorMessage } from "@/lib/api";
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { btnCls, ErrorText, inputCls, useSingleFlight } from "@/components/ui";

export default function LoginPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [runOnce, busy] = useSingleFlight();
  const [showPassword, setShowPassword] = useState(false);
  const isRegister = mode === "register";

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setError("");
    await runOnce(async () => {
      try {
        if (isRegister) await register(form.name, form.email, form.password);
        else await login(form.email, form.password);
      } catch (err) {
        setError(errorMessage(err));
      }
    });
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="text-xl font-semibold">{isRegister ? "Create account" : "Sign in to TeamTask"}</h1>
        <ErrorText error={error} />
        {isRegister && (
          <label className="block space-y-1">
            <span className="text-sm font-medium">Name</span>
            <input className={inputCls} value={form.name} onChange={set("name")} required maxLength={60} autoComplete="name" />
          </label>
        )}
        <label className="block space-y-1">
          <span className="text-sm font-medium">Email</span>
          <input type="email" className={inputCls} value={form.email} onChange={set("email")} required autoComplete="email" />
        </label>
        <label className="block space-y-1">
          <span className="text-sm font-medium">Password</span>
          <input
            type={showPassword ? "text" : "password"}
            className={inputCls}
            value={form.password}
            onChange={set("password")}
            required
            minLength={isRegister ? 8 : undefined}
            maxLength={72}
            autoComplete={isRegister ? "new-password" : "current-password"}
          />
          {isRegister && <span className="text-xs text-zinc-500">8–72 characters, at least one letter and one number.</span>}
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={showPassword} onChange={(e) => setShowPassword(e.target.checked)} />
          Show password
        </label>
        <button className={`${btnCls} w-full`} disabled={busy}>
          {busy ? "Please wait…" : isRegister ? "Create account" : "Sign in"}
        </button>
        <button
          type="button"
          onClick={() => { setMode(isRegister ? "login" : "register"); setError(""); }}
          className="w-full text-sm text-blue-600 hover:underline"
        >
          {isRegister ? "Already have an account? Sign in" : "No account? Create one"}
        </button>
      </form>
    </main>
  );
}
