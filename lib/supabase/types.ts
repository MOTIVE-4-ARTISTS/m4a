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
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
}
