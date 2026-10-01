/*
  Turns a notification's `extra` payload into an app route to navigate to on
  tap. Call with the value read via onNotificationTapped() from
  src/lib/notifications.js.

  Honest limitation, checked against App.tsx's actual routes (2026-08-24):
  none of these pages accept an item id in the URL today (no
  `/calendar/:eventId`), so this can only route to the right SECTION, not
  open the specific event/task/item within it. Getting the exact item to
  open on arrival needs two small additions per page, neither built yet:
    1. accept an id via query string here (already done, e.g. ?eventId=...)
    2. each destination page reading that param on mount and opening the
       matching item's modal/detail view — this part is what's missing.
  Until that per-page work happens, tapping a notification lands the user on
  the right page, scrolled to the top, not on the specific item.
*/

const ROUTES_BY_TYPE = {
  event: (id) => `/calendar?eventId=${id}`,
  task: (id) => `/tasks?taskId=${id}`,
  assignment: (id) => `/student?assignmentId=${id}`,
  exam: (id) => `/student?examId=${id}`,
  project: (id) => `/student?projectId=${id}`,
  meal: (id) => `/meals?mealId=${id}`,
  routine: (id) => `/lifestyle?routineId=${id}`,
  home_org_category: (id) => `/home-organization?categoryId=${id}`,
  morning_overview: () => `/`,
  evening_reminder: () => `/tasks`,
};

export function resolveNotificationRoute(extra) {
  if (!extra?.type) return '/';
  const build = ROUTES_BY_TYPE[extra.type];
  return build ? build(extra.id) : '/';
}
