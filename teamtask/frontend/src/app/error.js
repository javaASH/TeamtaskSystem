"use client"; // Error boundaries must be Client Components

import Link from "next/link";
import { useEffect } from "react";
import { btnCls, btnGhostCls } from "@/components/ui";

// Catches crashes while rendering any page; the user sees a friendly screen, never the stack trace.
export default function Error({ error, retry }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-md space-y-4 py-16 text-center">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="text-sm text-zinc-500">This page couldn&apos;t be displayed. Please try again, or go back to the dashboard.</p>
      <div className="flex justify-center gap-2">
        <button className={btnCls} onClick={() => retry()}>Try again</button>
        <Link href="/" className={btnGhostCls}>Go to dashboard</Link>
      </div>
    </div>
  );
}
