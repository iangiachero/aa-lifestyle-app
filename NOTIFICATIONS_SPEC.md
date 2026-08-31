# Notifications — spec for the iOS build

Ava's request (2026-08-24), reproduced in full so nothing gets lost in translation:

> I'd like the notifications to feel clean, personalized, and premium rather
> than excessive. I would want: Calendar reminders (based on the reminder time
> they select), Task reminders (unless it's ongoing), School reminders
> (assignments/exams/projects, a few days before + the day due), Meal plan
> reminders (optional), Lifestyle & routine reminders (personalized, user
> schedules them), Home organization & checklist reminders (scheduled cleaning
> / checklist items), a Morning overview (optional daily digest), an Evening
> reminder (review unfinished tasks, prep for tomorrow). Users should choose
> which notifications they want and customize timing. Tapping a notification
> should go straight to the related item.

**Answer: yes, all of it is buildable**, and the shape of the request happens
to fit a simpler and cheaper architecture than "push notifications" usually
implies — explained below. This is scoped for **after** Capacitor exists
(HANDOFF.md section 4.1) — nothing here can be built into the current web app.

---

## Architecture: local notifications, not server push

Everything on Ava's list is either:
- tied to a specific point in time the app already knows (an event's start
  time, an assignment's due date), or
- a fixed daily time the user picks (morning overview, evening reminder).

None of it requires a message to arrive from a server while the app isn't
running in a way only *push* can do (e.g. "a teammate just did X"). That means
the whole feature can run on **Capacitor's Local Notifications plugin**
(`@capacitor/local-notifications`), scheduled entirely on-device:

- No Apple Push Notification service certificate, no push server, no
  `SUPABASE_SERVICE_ROLE_KEY`-holding backend job to build and keep alive.
- Works even if the phone is offline at notification time — it was scheduled
  locally in advance.
- Simpler to build and to keep buildable: this is the right default for an
  MVP, and stays the right choice unless a specific feature later genuinely
  needs a server-initiated push (nothing on this list does).

The trade-off worth knowing: local notifications are scheduled by the app
itself, so they need to be *rescheduled* whenever the underlying data changes
(edit a task's due date → reschedule its reminder; delete an event → cancel
its reminder). That bookkeeping is the actual engineering work here, more than
the scheduling API itself.

---

## Per-notification-type breakdown

| Type | Data already exists? | Notes |
|---|---|---|
| Calendar reminders | ✅ `events` has start time; user already picks a reminder offset in some flows | Recurring events need per-occurrence scheduling, not just the base row |
| Task reminders | ✅ `tasks.due_date` | "Unless it's ongoing" — needs a rule for tasks with no due date (skip) |
| School (assignments/exams/projects) | ✅ `due_date`, `due_time`, `exam_date` already on the student tables | "A few days before" is already conceptually there via `dueStatus()` in `Student.jsx` — same logic, different output |
| Meal plan reminders | ✅ meals have a planned date | Straightforward |
| Lifestyle & routine reminders | ⛔ **no time field exists** — `lifestyle_routines` only has `created_at` | Needs a new schedule field before this can be built at all |
| Home organization & checklist reminders | ⛔ **no time field exists** — `organization_tasks` only has `last_completed` | Same gap — "scheduled cleaning" isn't a concept in the data model yet |
| Morning overview | New | Aggregates today's events/tasks/deadlines into one digest notification — needs to be *rescheduled daily* with fresh content, not a one-shot |
| Evening reminder | New | Simpler — fixed daily time, generic copy, no per-day content to compute |

---

## Building blocks required

1. **Permission flow** — iOS requires an explicit, user-facing prompt before
   any local notification can fire. Standard Capacitor pattern, but it's a
   real screen/moment in onboarding or first-notification-setup that needs
   designing.
2. **Notification preferences** — new table (or a JSON column on `users`)
   storing which categories are on, and the chosen offset/time per category.
   Needs a settings screen; this is genuinely new UI, not just wiring.
3. **Two new schema fields** — a scheduled time/day for `lifestyle_routines`
   and for `organization_tasks`, since neither currently has one.
4. **Scheduling/rescheduling logic** — hook into every create/edit/delete path
   for events, tasks, assignments, meals, routines and checklist items so
   their notifications stay in sync with the data. This is the bulk of the
   engineering effort, not the notification API itself.
5. **Deep links on tap** — Capacitor's Local Notifications API supports an
   `extra` payload per notification (e.g. `{ type: 'assignment', id }`) and a
   tap listener (`localNotificationActionPerformed`) that reads it and
   navigates — straightforward given the app already has routes for every
   item type.
6. **Morning overview's daily refresh** — needs its content recomputed and
   rescheduled once a day (e.g. on app foreground, or via a background task)
   rather than scheduled once and forgotten, since "today's tasks" changes
   daily.

None of this is exotic — it's a real feature with real surface area, not a
quick toggle. Realistic sequencing: after Capacitor/the iOS shell exists, this
is its own scoped chunk of work, roughly on the order of the account-deletion
or IAP work already documented in HANDOFF.md, not a same-day add-on.
