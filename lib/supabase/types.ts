// Minimal hand-written types for our Supabase schema until we wire
// `supabase gen types typescript --linked` in CI. Keeping this thin means
// any drift between SQL and TS shows up quickly at query call sites.
//
// When `supabase gen types` is wired (Phase 6 task), replace this file
// with the generated output and update the import path in callers.

export type DonationStatus = "pending" | "succeeded" | "refunded" | "failed";

export interface Donor {
  id: string;
  email: string;
  name: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  region: string | null;
  postal_code: string | null;
  country: string | null;
  stripe_customer_id: string | null;
  anonymized: boolean;
  created_at: string;
  updated_at: string;
}

export interface Donation {
  id: string;
  donor_id: string | null;
  stripe_session_id: string | null;
  stripe_event_id: string | null;
  amount_cents: number;
  currency: string;
  recurring: boolean;
  status: DonationStatus;
  receipt_sent_at: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface Subscriber {
  id: string;
  email: string;
  source: string | null;
  confirmation_token: string | null;
  confirmed_at: string | null;
  unsubscribed_at: string | null;
  created_at: string;
}

// /opportunities — see supabase/migrations/0003_opportunities.sql and
// docs/adr/0005-opportunities-data-model.md. Kept structurally aligned with
// the SQL; any drift will surface at the first query call site.

export type OpportunityType = "grant" | "residency" | "fellowship" | "call";

export type LocationRequirement = "nyc" | "nyc_metro" | "ny_state" | "national" | "international";

export type SubmissionStatus = "pending" | "approved" | "rejected";

export interface Opportunity {
  id: string;
  canonical_key: string;
  name: string;
  funder_name: string;
  funder_slug: string;
  type: OpportunityType;
  deadline: string | null;
  is_rolling: boolean;
  application_window: string | null;
  amount_min_cents: number | null;
  amount_max_cents: number | null;
  amount_display: string | null;
  eligibility_individual: boolean;
  eligibility_fiscal_sponsor: boolean;
  eligibility_501c3: boolean;
  location_requirement: LocationRequirement;
  application_fee_cents: number;
  discipline_tags: string[];
  genre_tags: string[];
  career_stage: string[];
  equity_tags: string[];
  description_short: string;
  source_url: string;
  application_platform: string | null;
  is_archived: boolean;
  archived_reason: string | null;
  last_verified_at: string;
  verified_by: string;
  embedding: number[] | null;
  created_at: string;
  updated_at: string;
}

export interface OpportunitySource {
  id: string;
  opportunity_id: string;
  source: string;
  source_url: string;
  seen_at: string;
  raw_payload: Record<string, unknown>;
}

export interface OpportunitySubmission {
  id: string;
  name: string;
  funder_name: string;
  funder_slug: string | null;
  type: OpportunityType;
  deadline: string | null;
  is_rolling: boolean;
  application_window: string | null;
  amount_min_cents: number | null;
  amount_max_cents: number | null;
  amount_display: string | null;
  eligibility_individual: boolean | null;
  eligibility_fiscal_sponsor: boolean | null;
  eligibility_501c3: boolean | null;
  location_requirement: LocationRequirement | null;
  application_fee_cents: number | null;
  discipline_tags: string[];
  genre_tags: string[];
  career_stage: string[];
  equity_tags: string[];
  description_short: string | null;
  source_url: string;
  application_platform: string | null;
  submitter_email: string | null;
  status: SubmissionStatus;
  reviewer_notes: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  // Added in 0007: how this row entered the review queue + the ingest
  // pipeline's self-reported confidence, so the admin queue can sort by
  // "most-likely-good first" and explain why each row needs a human.
  submission_kind: SubmissionKind;
  extraction_confidence: number | null;
  raw_payload: Record<string, unknown>;
  embedding: number[] | null;
  created_at: string;
  updated_at: string;
}

// How a submission landed in the review queue. `community` = the public
// /opportunities/submit form; the rest come from the ingest pipeline.
export type SubmissionKind = "community" | "dedup_review" | "low_confidence" | "discovery";

// Operational bookkeeping tables (migrations 0006 / 0008). Service-role
// only; never read from a public surface.
export interface IngestRun {
  source: string;
  last_ran_at: string;
  counts: Record<string, number>;
  updated_at: string;
}

export interface DiscoverySeen {
  url: string;
  query: string | null;
  first_seen_at: string;
}

// Funders / aggregators the source-discovery meta-agent proposes we track
// (migration 0009). Admins triage; "accepting" is an engineering follow-up.
export type ProposedSourceStatus = "pending" | "accepted" | "dismissed";

export interface ProposedSource {
  id: string;
  name: string;
  url: string;
  rationale: string | null;
  status: ProposedSourceStatus;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
}

// /events — see supabase/migrations/0005_events.sql and
// docs/adr/0007-events-data-model.md. Named `EventRecord` (not `Event`)
// because the bare `Event` collides with the DOM global.

export type EventType = "sharing" | "gathering" | "workshop" | "performance" | "talk";

export interface EventRecord {
  id: string;
  slug: string;
  title: string;
  event_type: EventType;
  starts_at: string;
  ends_at: string | null;
  timezone: string;
  location_name: string | null;
  location_address: string | null;
  is_online: boolean;
  online_url: string | null;
  summary: string;
  description: string | null;
  cohort_slug: string | null;
  program_id: string | null;
  rsvp_url: string | null;
  rsvp_label: string | null;
  image_path: string | null;
  is_published: boolean;
  is_cancelled: boolean;
  created_at: string;
  updated_at: string;
}

// Database shape passed to Supabase clients. Once `supabase gen types
// typescript --linked` is wired in CI, this becomes the auto-generated
// `Database` type instead — the structural shape stays the same.
//
// The full Supabase generic expects Views / Functions / Enums /
// CompositeTypes properties (even when empty); without them the SSR /
// supabase-js client falls back to `never` query results.
export interface Database {
  public: {
    Tables: {
      donors: {
        Row: Donor;
        Insert: Partial<Donor> & Pick<Donor, "email">;
        Update: Partial<Donor>;
        Relationships: [];
      };
      donations: {
        Row: Donation;
        Insert: Partial<Donation> & Pick<Donation, "amount_cents" | "status">;
        Update: Partial<Donation>;
        Relationships: [];
      };
      subscribers: {
        Row: Subscriber;
        Insert: Partial<Subscriber> & Pick<Subscriber, "email">;
        Update: Partial<Subscriber>;
        Relationships: [];
      };
      opportunities: {
        Row: Opportunity;
        // The narrowed-insert shape mirrors the SQL: every NOT NULL column
        // without a default must be present. This catches missing fields at
        // compile time instead of at runtime.
        Insert: Partial<Opportunity> &
          Pick<
            Opportunity,
            | "canonical_key"
            | "name"
            | "funder_name"
            | "funder_slug"
            | "type"
            | "description_short"
            | "source_url"
            | "verified_by"
          >;
        Update: Partial<Opportunity>;
        Relationships: [];
      };
      opportunity_sources: {
        Row: OpportunitySource;
        Insert: Partial<OpportunitySource> &
          Pick<OpportunitySource, "opportunity_id" | "source" | "source_url">;
        Update: Partial<OpportunitySource>;
        Relationships: [];
      };
      opportunity_submissions: {
        Row: OpportunitySubmission;
        Insert: Partial<OpportunitySubmission> &
          Pick<OpportunitySubmission, "name" | "funder_name" | "type" | "source_url">;
        Update: Partial<OpportunitySubmission>;
        Relationships: [];
      };
      _ingest_runs: {
        Row: IngestRun;
        Insert: Partial<IngestRun> & Pick<IngestRun, "source">;
        Update: Partial<IngestRun>;
        Relationships: [];
      };
      _discovery_seen: {
        Row: DiscoverySeen;
        Insert: Partial<DiscoverySeen> & Pick<DiscoverySeen, "url">;
        Update: Partial<DiscoverySeen>;
        Relationships: [];
      };
      proposed_sources: {
        Row: ProposedSource;
        Insert: Partial<ProposedSource> & Pick<ProposedSource, "name" | "url">;
        Update: Partial<ProposedSource>;
        Relationships: [];
      };
      events: {
        Row: EventRecord;
        // Narrowed insert mirrors the SQL: NOT NULL columns without a
        // default must be present at compile time.
        Insert: Partial<EventRecord> &
          Pick<EventRecord, "slug" | "title" | "starts_at" | "summary">;
        Update: Partial<EventRecord>;
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: {
      opportunity_type: OpportunityType;
      location_requirement: LocationRequirement;
      submission_status: SubmissionStatus;
      event_type: EventType;
    };
    CompositeTypes: Record<never, never>;
  };
}
