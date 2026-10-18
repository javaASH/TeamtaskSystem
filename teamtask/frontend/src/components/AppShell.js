"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthProvider";
import { api, errorMessage } from "@/lib/api";
import { inputCls } from "./ui";

const PUBLIC = ["/login"];

export default function AppShell({ children }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [unread, setUnread] = useState(0);
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [crash, setCrash] = useState("");

  // errors that escape every try/catch (event handlers, stray promises) get a friendly toast, not raw details
  useEffect(() => {
    let timer;
    const show = (e) => {
      e.preventDefault?.();
      console.error(e.reason ?? e.error ?? e);
      setCrash(errorMessage(e.reason ?? e.error));
      clearTimeout(timer);
      timer = setTimeout(() => setCrash(""), 5000);
    };
    window.addEventListener("error", show);
    window.addEventListener("unhandledrejection", show);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("error", show);
      window.removeEventListener("unhandledrejection", show);
    };
  }, []);

  const toast = crash && (
    <div role="alert" className="fixed right-4 bottom-4 z-50 flex max-w-sm items-start gap-3 rounded-md bg-red-600 px-4 py-3 text-sm text-white shadow-lg">
      <span className="flex-1">{crash}</span>
      <button onClick={() => setCrash("")} aria-label="Dismiss" className="font-semibold">×</button>
    </div>
  );
  const menuRef = useRef(null);

  // close the profile menu on outside click or Escape
  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e) => { if (!menuRef.current?.contains(e.target)) setMenuOpen(false); };
    const onKey = (e) => { if (e.key === "Escape") setMenuOpen(false); };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onClick); document.removeEventListener("keydown", onKey); };
  }, [menuOpen]);
  const isPublic = PUBLIC.includes(pathname);

  useEffect(() => {
    if (user === null && !isPublic) router.replace("/login");
    if (user && isPublic) router.replace("/");
  }, [user, isPublic, router]);

  useEffect(() => {
    if (!user) return;
    const load = () => api("/notifications", { query: { unread: "true" } }).then((d) => setUnread(d.unreadCount)).catch(() => {});
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, [user, pathname]);

  function searchTasks(e) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/tasks?search=${encodeURIComponent(q)}` : "/tasks");
  }

  if (isPublic) return <>{children}{toast}</>;
  if (!user) return <p className="p-8 text-center text-zinc-500">Loading…</p>;

  const links = [
    ["/", "Dashboard"],
    ["/my-tasks", "My tasks"],
    ["/created", "Created by me"],
    ["/tasks", "All tasks"],
    ["/calendar", "Calendar"],
    ["/notifications", `Notifications${unread ? ` (${unread})` : ""}`],
    ...(user.role !== "user" ? [["/admin", "Admin"]] : []),
    ["/settings", "Settings"],
  ];

  return (
    <div className="flex flex-1 flex-col md:flex-row">
      {/* sidebar on desktop, top bar on phones */}
      <aside className="border-b border-sky-200 bg-sky-100 md:sticky md:top-0 md:flex md:h-screen md:w-56 md:shrink-0 md:flex-col md:border-b-0 md:border-r dark:border-sky-900 dark:bg-sky-950">
        <Link href="/" className="block px-4 pt-4 pb-2 text-lg font-semibold md:pt-5 md:pb-4">TeamTask</Link>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-2 md:flex-1 md:flex-col md:overflow-visible">
          {links.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className={`shrink-0 rounded-md px-3 py-2 text-sm ${pathname === href ? "bg-white font-medium text-blue-700 shadow-sm dark:bg-sky-900 dark:text-sky-100" : "text-sky-900 hover:bg-sky-200 dark:text-sky-200 dark:hover:bg-sky-900"}`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-zinc-200 bg-white/90 px-4 py-2.5 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
          <form onSubmit={searchTasks} role="search" className="relative w-full max-w-md">
            <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400">
              <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.45 4.39l3.08 3.08a.75.75 0 1 1-1.06 1.06l-3.08-3.08A7 7 0 0 1 2 9Z" clipRule="evenodd" />
            </svg>
            <input
              type="search"
              className={`${inputCls} pl-9`}
              placeholder="Search tasks by name or description…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              maxLength={100}
              aria-label="Search tasks"
            />
          </form>
          <Link
            href="/notifications"
            aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
            className="relative ml-auto shrink-0 rounded-full p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-5 w-5">
              <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
            {unread > 0 && (
              <span className="absolute top-0.5 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white">
                {unread > 99 ? "99+" : unread}
              </span>
            )}
          </Link>
          <div ref={menuRef} className="relative shrink-0">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              className="flex items-center gap-2 rounded-md px-1.5 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-600 text-sm font-semibold text-white">
                {user.name[0]?.toUpperCase()}
              </span>
              <span className="hidden text-left leading-tight sm:block">
                <span className="block max-w-32 truncate text-sm font-medium">{user.name}</span>
                <span className="block text-xs text-zinc-500">{user.role}</span>
              </span>
              <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className={`h-4 w-4 text-zinc-500 transition-transform ${menuOpen ? "rotate-180" : ""}`}>
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06z" clipRule="evenodd" />
              </svg>
            </button>
            {menuOpen && (
              <div role="menu" className="absolute right-0 mt-1 w-48 overflow-hidden rounded-md border border-zinc-200 bg-white py-1 text-sm shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
                <p className="truncate border-b border-zinc-100 px-3 py-2 text-xs text-zinc-500 dark:border-zinc-800">{user.email}</p>
                <Link href="/settings" role="menuitem" onClick={() => setMenuOpen(false)} className="block px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-900">Settings</Link>
                <button role="menuitem" onClick={() => { setMenuOpen(false); logout(); }} className="block w-full px-3 py-2 text-left text-red-600 hover:bg-zinc-100 dark:hover:bg-zinc-900">Log out</button>
              </div>
            )}
          </div>
        </header>
        <main className="mx-auto w-full max-w-5xl min-w-0 flex-1 px-4 py-6">{children}</main>
      </div>
      {toast}
    </div>
  );
}
