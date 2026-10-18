const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const TIMEOUT_MS = 15000;

export const GENERIC_ERROR = "Something went wrong. Please try again.";

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Only 4xx messages come from our own validation and are meant for users; never show raw 5xx or network text.
function messageFor(status, body) {
  if (status === 429) return body?.message || "Too many attempts. Please wait a moment and try again.";
  if (status >= 500) return "The server ran into a problem. Please try again in a moment.";
  if (status === 404) return body?.message || "We couldn't find what you were looking for.";
  if (status === 401) return body?.message || "Please sign in again.";
  if (status === 403) return body?.message || "You don't have permission to do that.";
  return body?.errors?.join(", ") || body?.message || GENERIC_ERROR;
}

// Session cookie auth: every call must send credentials.
export async function api(path, { method = "GET", body, query } = {}) {
  const url = new URL(BASE + path);
  // backend rejects empty filter values, so drop them
  for (const [k, v] of Object.entries(query || {})) if (v !== "" && v != null) url.searchParams.set(k, v);

  let res;
  try {
    res = await fetch(url, {
      method,
      credentials: "include",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (e) {
    if (e?.name === "TimeoutError") throw new ApiError(0, "The server is taking too long to respond. Please try again.");
    throw new ApiError(0, "Can't reach the server. Check your connection and try again.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, messageFor(res.status, data));
  return data;
}

// For catch blocks: show our own API messages, hide anything else (runtime bugs, stack details).
export const errorMessage = (e) => (e instanceof ApiError ? e.message : GENERIC_ERROR);

export const STATUSES = ["todo", "in-progress", "done"];
export const PRIORITIES = ["low", "medium", "high"];

export const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : "—");
export const isOverdue = (t) => t.dueDate && t.status !== "done" && new Date(t.dueDate) < new Date();
