# Backing up and restoring Ava's real account for a delete-account test

Ava wants to personally delete and recreate her own real account
(`ava.amad@gmail.com`) to verify account deletion herself. The deletion
feature is already proven working end-to-end (verified 2026-08-23 on a
separate account — data wiped, Stripe row removed, login actually gone,
confirmed by the access token itself becoming invalid afterward). This
procedure exists only so her real data survives *her own* test of it.

**Read all three phases before starting anything.** Phase 1 must run before
she touches the delete button. Phase 3 can only run after she has signed up
again with the same email.

## What this does and does not cover

- Covers: every table the app itself considers "hers" — the same list
  `delete-account` uses (tasks, notes, checklists, recipes, password vault
  entries, home organization, student data, habits, workouts, etc.), plus her
  profile row (`users`, including the vault PIN hash and salt — vault entries
  will still unlock with her existing PIN after restore) and her Stripe
  customer link if she has one.
- Does **not** cover uploaded files (profile picture, any custom photos she
  uploaded). `delete-account` deletes those from storage as part of the
  guideline-required wipe, and a plain SQL backup can't preserve file bytes.
  If she has a profile picture, she'll need to re-upload it after restoring —
  everything else (all her actual content) comes back automatically.
- If she has a **live paid subscription**, deleting her account cancels it
  immediately through Stripe — this is real and intentional (App Store
  requires it), not something this backup undoes. Confirm she's aware before
  Phase 2.

---

## Phase 1 — run this now, before she does anything

Creates a snapshot inside the same database (a separate schema, not a file to
manage) of every row belonging to her current account.

```sql
create schema if not exists ava_backup;

do $$
declare
  v_uid uuid := (select id from auth.users where email = 'ava.amad@gmail.com');
  t text;
begin
  if v_uid is null then
    raise exception 'No account found for that email — check the address before continuing';
  end if;

  foreach t in array array[
    'birthdays','checklist_custom_items','checklist_progress','content_ideas',
    'custom_recipes','events','grocery_items','habits','home_org_categories',
    'lifestyle_modules','lifestyle_routines','lifestyle_steps','meals','notes',
    'organization_tasks','password_vault','shop_items','shopping_items',
    'student_assignments','student_classes','student_custom_blocks',
    'student_exams','student_projects','student_study_sessions','tasks',
    'user_checklists','workout_exercises','workouts','users','stripe_customers'
  ]
  loop
    begin
      execute format('drop table if exists ava_backup.%I', t);
      execute format(
        'create table ava_backup.%I as select * from public.%I where user_id = %L',
        t, t, v_uid
      );
    exception when undefined_table or undefined_column then
      raise notice 'skipped %: table or user_id column not present in this deployment', t;
    end;
  end loop;
end $$;
```

**Check what actually got backed up** — run this after, and eyeball that the
tables you'd expect her to have data in show a non-zero count:

```sql
select
  t.table_name,
  (select count(*) from information_schema.columns
     where table_schema = 'ava_backup' and table_name = t.table_name) as columns_backed_up
from information_schema.tables t
where t.table_schema = 'ava_backup'
order by t.table_name;
```

(That query confirms the tables exist with their columns; if you want row
counts per table instead, ask and I'll give you that version — it needs a
slightly different query shape.)

Once this has run successfully, she's safe to delete her account.

---

## Phase 2 — Ava deletes her account

Normal flow, inside the app: Profile → Delete account → type DELETE → Delete
my account. Nothing else to do here — this is the exact path already tested.

---

## Phase 3 — Ava signs up again

Same email (`ava.amad@gmail.com`), goes through onboarding again. This gets
her a **new** internal account ID — expected, that's how account deletion is
supposed to work. Don't run anything below until she's told you she's signed
up and reached the home screen.

---

## Phase 4 — restore her data onto the new account

Run only after Phase 3 is confirmed done. Signing up again auto-creates a
blank profile row and some starter curated content for the new account (the
app seeds every new signup automatically) — this script clears that starter
state per table right before restoring her real data into it, so nothing
duplicates.

```sql
do $$
declare
  v_new_uid uuid := (select id from auth.users where email = 'ava.amad@gmail.com');
  t text;
begin
  if v_new_uid is null then
    raise exception 'No account found for that email — she needs to sign up again first';
  end if;

  -- Parent-shaped tables first, in case anything below references their id
  -- (e.g. checklist items belonging to a checklist) — the whole block is one
  -- transaction, so a wrong guess here fails cleanly with nothing partially
  -- restored, rather than leaving a half-done state. If it errors, send me
  -- the exact message rather than re-running it.
  foreach t in array array[
    'user_checklists', 'student_classes', 'home_org_categories', 'custom_recipes',
    'users', 'stripe_customers',
    'birthdays','checklist_custom_items','checklist_progress','content_ideas',
    'events','grocery_items','habits',
    'lifestyle_modules','lifestyle_routines','lifestyle_steps','meals','notes',
    'organization_tasks','password_vault','shop_items','shopping_items',
    'student_assignments','student_custom_blocks',
    'student_exams','student_projects','student_study_sessions','tasks',
    'workout_exercises','workouts'
  ]
  loop
    begin
      -- Point the backup rows at the new account id.
      execute format('update ava_backup.%I set user_id = %L', t, v_new_uid);
      -- Clear whatever auto-seeded for the new signup, then restore the real data.
      execute format('delete from public.%I where user_id = %L', t, v_new_uid);
      execute format('insert into public.%I select * from ava_backup.%I', t, t);
    exception when undefined_table then
      raise notice 'skipped %: no backup exists for this table', t;
    end;
  end loop;
end $$;
```

**Verify before telling her it's done** — have her open the app and check a
few sections (checklists, notes, home organization), and confirm the Password
Vault still unlocks with her existing PIN.

---

## Cleanup — once she's confirmed everything looks right

The backup schema has real personal data sitting in it — don't leave it
indefinitely.

```sql
drop schema ava_backup cascade;
```
