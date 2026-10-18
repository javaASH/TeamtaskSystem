"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";

// Last resort when the root layout itself crashes. It replaces the whole document,
// so it can't rely on globals.css and uses inline styles instead.
export default function GlobalError({ error, retry }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", display: "grid", placeItems: "center", minHeight: "100vh", margin: 0 }}>
        <title>Something went wrong · TeamTask</title>
        <div style={{ textAlign: "center", padding: 16 }}>
          <h1 style={{ fontSize: 24, marginBottom: 8 }}>Something went wrong</h1>
          <p style={{ color: "#71717a", marginBottom: 16 }}>TeamTask hit an unexpected problem. Please try again.</p>
          <button
            onClick={() => retry()}
            style={{ background: "#2563eb", color: "#fff", border: 0, borderRadius: 6, padding: "8px 16px", cursor: "pointer" }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
