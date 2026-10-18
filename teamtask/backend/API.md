# TeamTask API

Base URL (local): `http://localhost:5000/api`

Authentication uses an httpOnly session cookie (`tt.sid`). Send requests with credentials
(`fetch(..., { credentials: "include" })`, Postman keeps the cookie automatically).
All responses are JSON. Errors look like `{ "message": "...", "errors": ["..."] }`.

## Roles
| Role | Can |
|------|-----|
| admin | everything, change user roles (first registered user becomes admin) |
| manager | view / edit / delete any task, read audit log |
| user | tasks they created (full access) or are assigned to (view + change status) |

## Auth
| Method | Path | Body | Notes |
|--------|------|------|-------|
| POST | /auth/register | `{ name, email, password }` | password 8-72 chars, letter + number. Logs you in. |
| POST | /auth/login | `{ email, password }` | rate limited: 20 / 15 min |
| POST | /auth/logout | – | |
| GET | /auth/me | – | current user |
| PATCH | /auth/preferences | `{ assigned?: bool, updated?: bool }` | mute notification types |

## Tasks
| Method | Path | Body / Query |
|--------|------|--------------|
| GET | /tasks | `search, status, priority, dueFrom, dueTo, scope (assigned\|created\|overdue), sort, page, limit` |
| POST | /tasks | `{ title, description?, dueDate?, priority?, status?, assignedTo? }` |
| GET | /tasks/dashboard | – returns `{ assigned, created, overdue }`, each `{ count, tasks }` |
| GET | /tasks/:id | – |
| PATCH | /tasks/:id | any task fields (assignee may only send `status`) |
| DELETE | /tasks/:id | creator, manager or admin |

- `status`: `todo` \| `in-progress` \| `done`
- `priority`: `low` \| `medium` \| `high`
- `sort`: `createdAt`, `dueDate`, `updatedAt` (prefix `-` for descending, default `-createdAt`)
- `assignedTo`: a user id from `GET /users`, or `null` to unassign

## Users
| Method | Path | Body | Notes |
|--------|------|------|-------|
| GET | /users | – | teammates for the assign dropdown |
| PATCH | /users/:id/role | `{ role }` | admin only |

## Notifications
| Method | Path | Notes |
|--------|------|-------|
| GET | /notifications?unread=true | latest 50 + `unreadCount` |
| PATCH | /notifications/:id/read | |
| PATCH | /notifications/read-all | |

Created when a task is assigned to you, or when someone else updates a task you created / are assigned to.

## Audit log
| Method | Path | Notes |
|--------|------|-------|
| GET | /audit?task=&user=&page= | admin / manager only |
