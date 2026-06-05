/*
  # Fix RLS Auth UID Performance & Function Search Path Security

  ## Summary
  This migration addresses all security advisor warnings:

  1. **RLS Auth Initialization Plan** - Replaces `auth.uid()` with `(select auth.uid())` in all
     policies across all tables. This prevents re-evaluation of auth functions per row, significantly
     improving query performance at scale.

  2. **Function Search Path Mutable** - Adds `SET search_path = ''` to all functions with mutable
     search paths to prevent search path injection attacks.

  ## Tables Fixed
  - users, tasks, habits, notes, student_items, events, birthdays
  - organization_tasks, shop_items, meals, grocery_items
  - workouts, workout_logs, workout_exercises
  - student_classes, student_assignments, student_exams, student_study_sessions
  - student_projects, student_custom_blocks
  - lifestyle_modules, lifestyle_routines, lifestyle_steps
  - user_checklists, checklist_progress, checklist_custom_items
  - custom_recipes, stripe_customers, stripe_subscriptions, stripe_orders
  - shopping_items, password_vault, users_audit_log

  ## Functions Fixed
  - seed_checklists_for_user, update_checklist_progress_updated_at
  - reset_checklist_progress_daily, create_default_lifestyle_modules
  - seed_lifestyle_for_user, reset_lifestyle_for_user
  - seed_home_org_for_user, reset_home_org_weekly
  - update_updated_at_column, update_grocery_items_updated_at
*/

-- ============================================================
-- TABLE: users
-- ============================================================
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- ============================================================
-- TABLE: tasks
-- ============================================================
DROP POLICY IF EXISTS "Users can view own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can insert own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can update own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete own tasks" ON public.tasks;

CREATE POLICY "Users can view own tasks"
  ON public.tasks FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own tasks"
  ON public.tasks FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own tasks"
  ON public.tasks FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own tasks"
  ON public.tasks FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================
-- TABLE: habits
-- ============================================================
DROP POLICY IF EXISTS "Users can view own habits" ON public.habits;
DROP POLICY IF EXISTS "Users can insert own habits" ON public.habits;
DROP POLICY IF EXISTS "Users can update own habits" ON public.habits;
DROP POLICY IF EXISTS "Users can delete own habits" ON public.habits;

CREATE POLICY "Users can view own habits"
  ON public.habits FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own habits"
  ON public.habits FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own habits"
  ON public.habits FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own habits"
  ON public.habits FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================
-- TABLE: notes
-- ============================================================
DROP POLICY IF EXISTS "Users can view own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can insert own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can update own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can delete own notes" ON public.notes;

CREATE POLICY "Users can view own notes"
  ON public.notes FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own notes"
  ON public.notes FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own notes"
  ON public.notes FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own notes"
  ON public.notes FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================
-- TABLE: student_items
-- ============================================================
DROP POLICY IF EXISTS "Users can view own student_items" ON public.student_items;
DROP POLICY IF EXISTS "Users can insert own student_items" ON public.student_items;
DROP POLICY IF EXISTS "Users can update own student_items" ON public.student_items;
DROP POLICY IF EXISTS "Users can delete own student_items" ON public.student_items;

CREATE POLICY "Users can view own student_items"
  ON public.student_items FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own student_items"
  ON public.student_items FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own student_items"
  ON public.student_items FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own student_items"
  ON public.student_items FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================
-- TABLE: events
-- ============================================================
DROP POLICY IF EXISTS "Users can view own events" ON public.events;
DROP POLICY IF EXISTS "Users can insert own events" ON public.events;
DROP POLICY IF EXISTS "Users can update own events" ON public.events;
DROP POLICY IF EXISTS "Users can delete own events" ON public.events;

CREATE POLICY "Users can view own events"
  ON public.events FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own events"
  ON public.events FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own events"
  ON public.events FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own events"
  ON public.events FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================
-- TABLE: birthdays
-- ============================================================
DROP POLICY IF EXISTS "Users can view own birthdays" ON public.birthdays;
DROP POLICY IF EXISTS "Users can insert own birthdays" ON public.birthdays;
DROP POLICY IF EXISTS "Users can update own birthdays" ON public.birthdays;
DROP POLICY IF EXISTS "Users can delete own birthdays" ON public.birthdays;

CREATE POLICY "Users can view own birthdays"
  ON public.birthdays FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own birthdays"
  ON public.birthdays FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own birthdays"
  ON public.birthdays FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own birthdays"
  ON public.birthdays FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================
-- TABLE: organization_tasks
-- ============================================================
DROP POLICY IF EXISTS "Users can view own organization tasks" ON public.organization_tasks;
DROP POLICY IF EXISTS "Users can insert own organization tasks" ON public.organization_tasks;
DROP POLICY IF EXISTS "Users can update own non-curated organization tasks" ON public.organization_tasks;
DROP POLICY IF EXISTS "Users can toggle completed on curated organization tasks" ON public.organization_tasks;
DROP POLICY IF EXISTS "Users can delete own non-curated organization tasks" ON public.organization_tasks;

CREATE POLICY "Users can view own organization tasks"
  ON public.organization_tasks FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own organization tasks"
  ON public.organization_tasks FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own non-curated organization tasks"
  ON public.organization_tasks FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id AND is_curated = false)
  WITH CHECK ((select auth.uid()) = user_id AND is_curated = false);

CREATE POLICY "Users can toggle completed on curated organization tasks"
  ON public.organization_tasks FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id AND is_curated = true)
  WITH CHECK ((select auth.uid()) = user_id AND is_curated = true);

CREATE POLICY "Users can delete own non-curated organization tasks"
  ON public.organization_tasks FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id AND is_curated = false);

-- ============================================================
-- TABLE: shop_items
-- ============================================================
DROP POLICY IF EXISTS "Users can view own shop items" ON public.shop_items;
DROP POLICY IF EXISTS "Users can insert own shop items" ON public.shop_items;
DROP POLICY IF EXISTS "Users can update own shop items" ON public.shop_items;
DROP POLICY IF EXISTS "Users can delete own shop items" ON public.shop_items;

CREATE POLICY "Users can view own shop items"
  ON public.shop_items FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own shop items"
  ON public.shop_items FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own shop items"
  ON public.shop_items FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own shop items"
  ON public.shop_items FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================
-- TABLE: meals
-- ============================================================
DROP POLICY IF EXISTS "Users can view own meals" ON public.meals;
DROP POLICY IF EXISTS "Users can insert own meals" ON public.meals;
DROP POLICY IF EXISTS "Users can update own meals" ON public.meals;
DROP POLICY IF EXISTS "Users can delete own meals" ON public.meals;

CREATE POLICY "Users can view own meals"
  ON public.meals FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own meals"
  ON public.meals FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own meals"
  ON public.meals FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own meals"
  ON public.meals FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================
-- TABLE: grocery_items
-- ============================================================
DROP POLICY IF EXISTS "Users can view own grocery items" ON public.grocery_items;
DROP POLICY IF EXISTS "Users can insert own grocery items" ON public.grocery_items;
DROP POLICY IF EXISTS "Users can update own grocery items" ON public.grocery_items;
DROP POLICY IF EXISTS "Users can delete own grocery items" ON public.grocery_items;

CREATE POLICY "Users can view own grocery items"
  ON public.grocery_items FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own grocery items"
  ON public.grocery_items FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own grocery items"
  ON public.grocery_items FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own grocery items"
  ON public.grocery_items FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================
-- TABLE: workouts
-- ============================================================
DROP POLICY IF EXISTS "Users can view own workouts" ON public.workouts;
DROP POLICY IF EXISTS "Users can insert own workouts" ON public.workouts;
DROP POLICY IF EXISTS "Users can update own workouts" ON public.workouts;
DROP POLICY IF EXISTS "Users can delete own workouts" ON public.workouts;

CREATE POLICY "Users can view own workouts"
  ON public.workouts FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own workouts"
  ON public.workouts FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own workouts"
  ON public.workouts FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own workouts"
  ON public.workouts FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================
-- TABLE: workout_exercises
-- ============================================================
DROP POLICY IF EXISTS "Users can view own workout exercises" ON public.workout_exercises;
DROP POLICY IF EXISTS "Users can insert own workout exercises" ON public.workout_exercises;
DROP POLICY IF EXISTS "Users can update own workout exercises" ON public.workout_exercises;
DROP POLICY IF EXISTS "Users can delete own workout exercises" ON public.workout_exercises;

CREATE POLICY "Users can view own workout exercises"
  ON public.workout_exercises FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.workouts
      WHERE workouts.id = workout_exercises.workout_id
      AND workouts.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can insert own workout exercises"
  ON public.workout_exercises FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workouts
      WHERE workouts.id = workout_exercises.workout_id
      AND workouts.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can update own workout exercises"
  ON public.workout_exercises FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.workouts
      WHERE workouts.id = workout_exercises.workout_id
      AND workouts.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can delete own workout exercises"
  ON public.workout_exercises FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.workouts
      WHERE workouts.id = workout_exercises.workout_id
      AND workouts.user_id = (select auth.uid())
    )
  );

-- ============================================================
-- TABLE: workout_logs
-- ============================================================
DROP POLICY IF EXISTS "Users can view own workout logs" ON public.workout_logs;
DROP POLICY IF EXISTS "Users can insert own workout logs" ON public.workout_logs;
DROP POLICY IF EXISTS "Users can update own workout logs" ON public.workout_logs;
DROP POLICY IF EXISTS "Users can delete own workout logs" ON public.workout_logs;

CREATE POLICY "Users can view own workout logs"
  ON public.workout_logs FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own workout logs"
  ON public.workout_logs FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own workout logs"
  ON public.workout_logs FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own workout logs"
  ON public.workout_logs FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================
-- TABLE: student_classes
-- ============================================================
DROP POLICY IF EXISTS "Users can view own classes" ON public.student_classes;
DROP POLICY IF EXISTS "Users can insert own classes" ON public.student_classes;
DROP POLICY IF EXISTS "Users can update own classes" ON public.student_classes;
DROP POLICY IF EXISTS "Users can delete own classes" ON public.student_classes;

CREATE POLICY "Users can view own classes"
  ON public.student_classes FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own classes"
  ON public.student_classes FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own classes"
  ON public.student_classes FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own classes"
  ON public.student_classes FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================
-- TABLE: student_assignments
-- ============================================================
DROP POLICY IF EXISTS "Users can view own assignments" ON public.student_assignments;
DROP POLICY IF EXISTS "Users can insert own assignments" ON public.student_assignments;
DROP POLICY IF EXISTS "Users can update own assignments" ON public.student_assignments;
DROP POLICY IF EXISTS "Users can delete own assignments" ON public.student_assignments;

CREATE POLICY "Users can view own assignments"
  ON public.student_assignments FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own assignments"
  ON public.student_assignments FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own assignments"
  ON public.student_assignments FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own assignments"
  ON public.student_assignments FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================
-- TABLE: student_exams
-- ============================================================
DROP POLICY IF EXISTS "Users can view own exams" ON public.student_exams;
DROP POLICY IF EXISTS "Users can insert own exams" ON public.student_exams;
DROP POLICY IF EXISTS "Users can update own exams" ON public.student_exams;
DROP POLICY IF EXISTS "Users can delete own exams" ON public.student_exams;

CREATE POLICY "Users can view own exams"
  ON public.student_exams FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own exams"
  ON public.student_exams FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own exams"
  ON public.student_exams FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own exams"
  ON public.student_exams FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================
-- TABLE: student_study_sessions
-- ============================================================
DROP POLICY IF EXISTS "Users can view own study sessions" ON public.student_study_sessions;
DROP POLICY IF EXISTS "Users can insert own study sessions" ON public.student_study_sessions;
DROP POLICY IF EXISTS "Users can update own study sessions" ON public.student_study_sessions;
DROP POLICY IF EXISTS "Users can delete own study sessions" ON public.student_study_sessions;

CREATE POLICY "Users can view own study sessions"
  ON public.student_study_sessions FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own study sessions"
  ON public.student_study_sessions FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own study sessions"
  ON public.student_study_sessions FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own study sessions"
  ON public.student_study_sessions FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================
-- TABLE: student_projects
-- ============================================================
DROP POLICY IF EXISTS "Users can view own projects" ON public.student_projects;
DROP POLICY IF EXISTS "Users can insert own projects" ON public.student_projects;
DROP POLICY IF EXISTS "Users can update own projects" ON public.student_projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON public.student_projects;

CREATE POLICY "Users can view own projects"
  ON public.student_projects FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own projects"
  ON public.student_projects FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own projects"
  ON public.student_projects FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own projects"
  ON public.student_projects FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================
-- TABLE: student_custom_blocks
-- ============================================================
DROP POLICY IF EXISTS "Users can view own custom blocks" ON public.student_custom_blocks;
DROP POLICY IF EXISTS "Users can insert own custom blocks" ON public.student_custom_blocks;
DROP POLICY IF EXISTS "Users can update own custom blocks" ON public.student_custom_blocks;
DROP POLICY IF EXISTS "Users can delete own custom blocks" ON public.student_custom_blocks;

CREATE POLICY "Users can view own custom blocks"
  ON public.student_custom_blocks FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own custom blocks"
  ON public.student_custom_blocks FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own custom blocks"
  ON public.student_custom_blocks FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own custom blocks"
  ON public.student_custom_blocks FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================
-- TABLE: lifestyle_modules
-- ============================================================
DROP POLICY IF EXISTS "Users can view own modules" ON public.lifestyle_modules;
DROP POLICY IF EXISTS "Users can insert own modules" ON public.lifestyle_modules;
DROP POLICY IF EXISTS "Users can update own modules" ON public.lifestyle_modules;
DROP POLICY IF EXISTS "Users can delete own non-default modules" ON public.lifestyle_modules;

CREATE POLICY "Users can view own modules"
  ON public.lifestyle_modules FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own modules"
  ON public.lifestyle_modules FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own modules"
  ON public.lifestyle_modules FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own non-default modules"
  ON public.lifestyle_modules FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id AND is_default = false);

-- ============================================================
-- TABLE: lifestyle_routines
-- ============================================================
DROP POLICY IF EXISTS "Users can view own routines" ON public.lifestyle_routines;
DROP POLICY IF EXISTS "Users can insert own routines" ON public.lifestyle_routines;
DROP POLICY IF EXISTS "Users can update own routines" ON public.lifestyle_routines;
DROP POLICY IF EXISTS "Users can delete own non-curated routines" ON public.lifestyle_routines;

CREATE POLICY "Users can view own routines"
  ON public.lifestyle_routines FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own routines"
  ON public.lifestyle_routines FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own routines"
  ON public.lifestyle_routines FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own non-curated routines"
  ON public.lifestyle_routines FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id AND is_curated = false);

-- ============================================================
-- TABLE: lifestyle_steps
-- ============================================================
DROP POLICY IF EXISTS "Users can view own steps" ON public.lifestyle_steps;
DROP POLICY IF EXISTS "Users can insert own steps" ON public.lifestyle_steps;
DROP POLICY IF EXISTS "Users can update own steps" ON public.lifestyle_steps;
DROP POLICY IF EXISTS "Users can delete own steps" ON public.lifestyle_steps;

CREATE POLICY "Users can view own steps"
  ON public.lifestyle_steps FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own steps"
  ON public.lifestyle_steps FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own steps"
  ON public.lifestyle_steps FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own steps"
  ON public.lifestyle_steps FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================
-- TABLE: user_checklists
-- ============================================================
DROP POLICY IF EXISTS "Users can select own checklists" ON public.user_checklists;
DROP POLICY IF EXISTS "Users can insert own checklists" ON public.user_checklists;
DROP POLICY IF EXISTS "Users can update own checklists" ON public.user_checklists;
DROP POLICY IF EXISTS "Users can delete own checklists" ON public.user_checklists;

CREATE POLICY "Users can select own checklists"
  ON public.user_checklists FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own checklists"
  ON public.user_checklists FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own checklists"
  ON public.user_checklists FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own checklists"
  ON public.user_checklists FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================
-- TABLE: checklist_progress
-- ============================================================
DROP POLICY IF EXISTS "Users can select own checklist progress" ON public.checklist_progress;
DROP POLICY IF EXISTS "Users can insert own checklist progress" ON public.checklist_progress;
DROP POLICY IF EXISTS "Users can update own checklist progress" ON public.checklist_progress;
DROP POLICY IF EXISTS "Users can delete own checklist progress" ON public.checklist_progress;

CREATE POLICY "Users can select own checklist progress"
  ON public.checklist_progress FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own checklist progress"
  ON public.checklist_progress FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own checklist progress"
  ON public.checklist_progress FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own checklist progress"
  ON public.checklist_progress FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================
-- TABLE: checklist_custom_items
-- ============================================================
DROP POLICY IF EXISTS "Users can select own custom items" ON public.checklist_custom_items;
DROP POLICY IF EXISTS "Users can insert own custom items" ON public.checklist_custom_items;
DROP POLICY IF EXISTS "Users can update own custom items" ON public.checklist_custom_items;
DROP POLICY IF EXISTS "Users can delete own custom items" ON public.checklist_custom_items;

CREATE POLICY "Users can select own custom items"
  ON public.checklist_custom_items FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own custom items"
  ON public.checklist_custom_items FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own custom items"
  ON public.checklist_custom_items FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own custom items"
  ON public.checklist_custom_items FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================
-- TABLE: custom_recipes
-- ============================================================
DROP POLICY IF EXISTS "Users can select own custom recipes" ON public.custom_recipes;
DROP POLICY IF EXISTS "Users can insert own custom recipes" ON public.custom_recipes;
DROP POLICY IF EXISTS "Users can update own custom recipes" ON public.custom_recipes;
DROP POLICY IF EXISTS "Users can delete own custom recipes" ON public.custom_recipes;

CREATE POLICY "Users can select own custom recipes"
  ON public.custom_recipes FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own custom recipes"
  ON public.custom_recipes FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own custom recipes"
  ON public.custom_recipes FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own custom recipes"
  ON public.custom_recipes FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================
-- TABLE: stripe_customers
-- ============================================================
DROP POLICY IF EXISTS "Users can view their own customer data" ON public.stripe_customers;

CREATE POLICY "Users can view their own customer data"
  ON public.stripe_customers FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================
-- TABLE: stripe_subscriptions
-- ============================================================
DROP POLICY IF EXISTS "Users can view their own subscription data" ON public.stripe_subscriptions;

CREATE POLICY "Users can view their own subscription data"
  ON public.stripe_subscriptions FOR SELECT
  TO authenticated
  USING (
    customer_id IN (
      SELECT customer_id FROM public.stripe_customers
      WHERE user_id = (select auth.uid())
    )
  );

-- ============================================================
-- TABLE: stripe_orders
-- ============================================================
DROP POLICY IF EXISTS "Users can view their own order data" ON public.stripe_orders;

CREATE POLICY "Users can view their own order data"
  ON public.stripe_orders FOR SELECT
  TO authenticated
  USING (
    customer_id IN (
      SELECT customer_id FROM public.stripe_customers
      WHERE user_id = (select auth.uid())
    )
  );

-- ============================================================
-- TABLE: shopping_items
-- ============================================================
DROP POLICY IF EXISTS "Users can select own shopping items" ON public.shopping_items;
DROP POLICY IF EXISTS "Users can insert own shopping items" ON public.shopping_items;
DROP POLICY IF EXISTS "Users can update own shopping items" ON public.shopping_items;
DROP POLICY IF EXISTS "Users can delete own shopping items" ON public.shopping_items;

CREATE POLICY "Users can select own shopping items"
  ON public.shopping_items FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own shopping items"
  ON public.shopping_items FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own shopping items"
  ON public.shopping_items FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own shopping items"
  ON public.shopping_items FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================
-- TABLE: password_vault
-- ============================================================
DROP POLICY IF EXISTS "Users can view own vault entries" ON public.password_vault;
DROP POLICY IF EXISTS "Users can insert own vault entries" ON public.password_vault;
DROP POLICY IF EXISTS "Users can update own vault entries" ON public.password_vault;
DROP POLICY IF EXISTS "Users can delete own vault entries" ON public.password_vault;

CREATE POLICY "Users can view own vault entries"
  ON public.password_vault FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own vault entries"
  ON public.password_vault FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own vault entries"
  ON public.password_vault FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own vault entries"
  ON public.password_vault FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================
-- TABLE: users_audit_log
-- ============================================================
DROP POLICY IF EXISTS "Users can view own audit log" ON public.users_audit_log;

CREATE POLICY "Users can view own audit log"
  ON public.users_audit_log FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================
-- FUNCTIONS: Fix mutable search_path
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_grocery_items_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_checklist_progress_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.reset_checklist_progress_daily()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.checklist_progress
  SET is_checked = false, updated_at = now()
  WHERE is_checked = true;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_default_lifestyle_modules()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.lifestyle_modules (user_id, name, icon, color, sort_order, is_default)
  VALUES
    (NEW.id, 'Morning', 'sun', '#F59E0B', 1, true),
    (NEW.id, 'Evening', 'moon', '#6366F1', 2, true),
    (NEW.id, 'Fitness', 'dumbbell', '#10B981', 3, true),
    (NEW.id, 'Nutrition', 'utensils', '#EF4444', 4, true),
    (NEW.id, 'Mindfulness', 'heart', '#EC4899', 5, true),
    (NEW.id, 'Learning', 'book-open', '#3B82F6', 6, true);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.seed_lifestyle_for_user(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_module_id uuid;
  v_curated_module_id uuid;
  v_routine_id uuid;
  v_curated_routine_id uuid;
  v_sort_order int;
BEGIN
  FOR v_curated_module_id IN
    SELECT id FROM public.curated_lifestyle_modules ORDER BY sort_order
  LOOP
    SELECT id INTO v_module_id
    FROM public.lifestyle_modules
    WHERE user_id = p_user_id
      AND name = (SELECT name FROM public.curated_lifestyle_modules WHERE id = v_curated_module_id);

    IF v_module_id IS NULL THEN
      INSERT INTO public.lifestyle_modules (user_id, name, icon, color, sort_order, is_default, image_url)
      SELECT p_user_id, name, icon, color, sort_order, true, image_url
      FROM public.curated_lifestyle_modules
      WHERE id = v_curated_module_id
      RETURNING id INTO v_module_id;
    END IF;

    v_sort_order := 1;
    FOR v_curated_routine_id IN
      SELECT id FROM public.curated_lifestyle_routines
      WHERE module_id = v_curated_module_id
      ORDER BY sort_order
    LOOP
      IF NOT EXISTS (
        SELECT 1 FROM public.lifestyle_routines
        WHERE user_id = p_user_id
          AND module_id = v_module_id
          AND title = (SELECT title FROM public.curated_lifestyle_routines WHERE id = v_curated_routine_id)
      ) THEN
        INSERT INTO public.lifestyle_routines (user_id, module_id, title, description, duration, sort_order, is_curated)
        SELECT p_user_id, v_module_id, title, description, duration, v_sort_order, true
        FROM public.curated_lifestyle_routines
        WHERE id = v_curated_routine_id
        RETURNING id INTO v_routine_id;

        INSERT INTO public.lifestyle_steps (user_id, routine_id, title, sort_order)
        SELECT p_user_id, v_routine_id, title, sort_order
        FROM public.curated_lifestyle_steps
        WHERE routine_id = v_curated_routine_id
        ORDER BY sort_order;

        v_sort_order := v_sort_order + 1;
      END IF;
    END LOOP;
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.reset_lifestyle_for_user(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  DELETE FROM public.lifestyle_steps
  WHERE user_id = p_user_id
    AND routine_id IN (
      SELECT id FROM public.lifestyle_routines
      WHERE user_id = p_user_id AND is_curated = true
    );

  DELETE FROM public.lifestyle_routines
  WHERE user_id = p_user_id AND is_curated = true;

  DELETE FROM public.lifestyle_modules
  WHERE user_id = p_user_id AND is_default = true;

  PERFORM public.seed_lifestyle_for_user(p_user_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.seed_checklists_for_user(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_checklist_id uuid;
  v_curated_checklist record;
  v_curated_item record;
BEGIN
  FOR v_curated_checklist IN
    SELECT * FROM public.curated_checklists ORDER BY sort_order
  LOOP
    SELECT id INTO v_checklist_id
    FROM public.user_checklists
    WHERE user_id = p_user_id AND title = v_curated_checklist.title;

    IF v_checklist_id IS NULL THEN
      INSERT INTO public.user_checklists (user_id, title, category, sort_order)
      VALUES (p_user_id, v_curated_checklist.title, v_curated_checklist.category, v_curated_checklist.sort_order)
      RETURNING id INTO v_checklist_id;
    END IF;

    FOR v_curated_item IN
      SELECT * FROM public.curated_checklist_items
      WHERE checklist_id = v_curated_checklist.id
      ORDER BY sort_order
    LOOP
      IF NOT EXISTS (
        SELECT 1 FROM public.checklist_progress
        WHERE user_id = p_user_id
          AND checklist_id = v_checklist_id
          AND item_title = v_curated_item.title
      ) THEN
        INSERT INTO public.checklist_progress (user_id, checklist_id, item_title, sort_order)
        VALUES (p_user_id, v_checklist_id, v_curated_item.title, v_curated_item.sort_order);
      END IF;
    END LOOP;
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.seed_home_org_for_user(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_curated record;
BEGIN
  FOR v_curated IN
    SELECT * FROM public.curated_home_org_tasks ORDER BY sort_order
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM public.organization_tasks
      WHERE user_id = p_user_id AND title = v_curated.title AND room = v_curated.room
    ) THEN
      INSERT INTO public.organization_tasks (user_id, title, room, frequency, sort_order, is_curated)
      VALUES (p_user_id, v_curated.title, v_curated.room, v_curated.frequency, v_curated.sort_order, true);
    END IF;
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.reset_home_org_weekly()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.organization_tasks
  SET completed = false, updated_at = now()
  WHERE is_curated = true AND completed = true;
END;
$$;
