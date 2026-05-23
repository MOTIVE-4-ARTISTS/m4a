-- Phase 5: applications + admin auth.
--
-- Programs that accept applications: AIR (residency), International
-- Exchange, Discounted Space Subsidy. One row per submission, JSONB payload
-- for program-specific fields. Status moves: submitted -> under_review ->
-- shortlist -> accepted | declined.
--
-- RLS pattern:
--  - Applicants insert into `applications` via the service role from a
--    Server Action (the form does not require sign-in).
--  - Admins read all rows. Admin status is set in `admin_users` and
--    checked by `auth.uid()` being in that table.

create table applications (
  id              uuid primary key default gen_random_uuid(),
  program         text not null check (program in ('residency','international','discounted_space')),
  applicant_email text not null,
  applicant_name  text,
  payload         jsonb not null default '{}'::jsonb,
  status          text not null default 'submitted'
                    check (status in ('submitted','under_review','shortlist','accepted','declined','withdrawn')),
  internal_notes  text,
  decided_at      timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index applications_program_status_idx on applications(program, status);
create index applications_created_at_idx on applications(created_at desc);
-- Filtering applications by arbitrary payload keys is the central admin
-- workflow; without a GIN index it scans every row.
create index applications_payload_gin_idx on applications using gin(payload);

create trigger applications_set_updated_at before update on applications
  for each row execute function set_updated_at();

alter table applications enable row level security;

-- Admins: a single row per board / staff Supabase auth user.
create table admin_users (
  user_id   uuid primary key references auth.users(id) on delete cascade,
  email     text not null unique,
  role      text not null default 'reviewer' check (role in ('reviewer','admin')),
  added_at  timestamptz not null default now()
);

alter table admin_users enable row level security;

-- Admin users can see their own row (used to gate /admin client-side
-- once we expose more nuanced role logic).
create policy "self read" on admin_users
  for select using (auth.uid() = user_id);

-- Applications: admins read everything; applicants only insert (service
-- role bypasses RLS in webhooks, so anon-side INSERTs are gated through
-- the Server Action).
create policy "admins read applications" on applications
  for select using (
    exists (
      select 1 from admin_users au where au.user_id = auth.uid()
    )
  );

create policy "admins update applications" on applications
  for update using (
    exists (
      select 1 from admin_users au where au.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from admin_users au where au.user_id = auth.uid()
    )
  );

-- Optional applicant file uploads (work samples, headshots). Files
-- themselves live in Supabase Storage; this table tracks the mapping.
create table application_files (
  id               uuid primary key default gen_random_uuid(),
  application_id   uuid not null references applications(id) on delete cascade,
  storage_path     text not null,
  filename         text not null,
  mime_type        text,
  size_bytes       bigint,
  created_at       timestamptz not null default now()
);

create index application_files_application_id_idx on application_files(application_id);

alter table application_files enable row level security;

create policy "admins read application_files" on application_files
  for select using (
    exists (
      select 1 from admin_users au where au.user_id = auth.uid()
    )
  );
