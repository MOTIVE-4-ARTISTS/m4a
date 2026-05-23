-- Initial schema for MOtiVE 4 Artists Inc.
--
-- Tables introduced here cover the Phase 4 donation flow and the Phase 5
-- newsletter capture. Phase 5 adds applications/application_files/
-- admin_users in 0002_applications.sql.
--
-- RLS Pattern
-- Every table has RLS enabled and at least one policy. The "service role"
-- bypasses RLS, so server-side webhooks (Stripe -> donations) and admin
-- inserts use the service-role client. Anonymous and authenticated readers
-- never touch these tables directly.

-- ----------------------------------------------------------------------
-- Helpers
-- ----------------------------------------------------------------------
create extension if not exists pgcrypto;

create or replace function set_updated_at() returns trigger
  language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ----------------------------------------------------------------------
-- Donors
-- ----------------------------------------------------------------------
-- One row per donor email. We do not store payment-method details — Stripe
-- holds the customer object; we hold just enough to issue IRS-compliant
-- receipts (name + email + mailing address for any single gift >= $250 per
-- §170(f)(8) substantiation).

create table donors (
  id              uuid primary key default gen_random_uuid(),
  email           text not null unique,
  name            text,
  address_line1   text,
  address_line2   text,
  city            text,
  region          text,
  postal_code     text,
  country         text default 'US',
  stripe_customer_id text unique,
  anonymized      boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create trigger donors_set_updated_at before update on donors
  for each row execute function set_updated_at();

alter table donors enable row level security;

-- Donors are private. Only the service role (server-side) reads/writes.
create policy "service role only" on donors
  for all using (false) with check (false);

-- ----------------------------------------------------------------------
-- Donations
-- ----------------------------------------------------------------------
-- One row per completed gift. Reconciliation key is stripe_event_id (unique)
-- so duplicate webhook deliveries are idempotent at the DB layer.

create table donations (
  id                  uuid primary key default gen_random_uuid(),
  donor_id            uuid references donors(id) on delete set null,
  stripe_session_id   text unique,
  stripe_event_id     text unique,
  amount_cents        integer not null check (amount_cents > 0),
  currency            text not null default 'usd',
  recurring           boolean not null default false,
  status              text not null
                        check (status in ('pending','succeeded','refunded','failed')),
  receipt_sent_at     timestamptz,
  note                text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index donations_donor_id_idx on donations(donor_id);
create index donations_created_at_idx on donations(created_at desc);

create trigger donations_set_updated_at before update on donations
  for each row execute function set_updated_at();

alter table donations enable row level security;

create policy "service role only" on donations
  for all using (false) with check (false);

-- ----------------------------------------------------------------------
-- Subscribers
-- ----------------------------------------------------------------------
-- Newsletter list. Double-opt-in: confirmed_at is null until the subscriber
-- clicks the confirmation link in the Resend email. We do not send marketing
-- to unconfirmed addresses.

create table subscribers (
  id              uuid primary key default gen_random_uuid(),
  email           text not null unique,
  source          text,
  confirmation_token text,
  confirmed_at    timestamptz,
  unsubscribed_at timestamptz,
  created_at      timestamptz not null default now()
);

create index subscribers_confirmed_idx on subscribers(confirmed_at)
  where confirmed_at is not null;

alter table subscribers enable row level security;

create policy "service role only" on subscribers
  for all using (false) with check (false);
