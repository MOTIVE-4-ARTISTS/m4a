import { beforeEach, describe, expect, it, vi } from "vitest";
import type { EventRecord } from "@/lib/supabase/types";

// Control the Supabase server client per test: null exercises the static
// fallback path, a fake chain exercises the live split.
const { mockCreateClient } = vi.hoisted(() => ({
  mockCreateClient: vi.fn<() => Promise<unknown>>(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mockCreateClient,
}));

import { FALLBACK_EVENTS, getEventBySlug, listEvents } from "./read";

function row(overrides: Partial<EventRecord> = {}): EventRecord {
  return {
    id: crypto.randomUUID(),
    slug: `e-${Math.random().toString(36).slice(2, 8)}`,
    title: "An Event",
    event_type: "sharing",
    starts_at: "2026-06-20T23:00:00Z",
    ends_at: "2026-06-21T01:00:00Z",
    timezone: "America/New_York",
    location_name: "MOtiVE Brooklyn",
    location_address: null,
    is_online: false,
    online_url: null,
    summary: "Summary.",
    description: null,
    cohort_slug: null,
    program_id: null,
    rsvp_url: null,
    rsvp_label: null,
    image_path: null,
    is_published: true,
    is_cancelled: false,
    created_at: "2026-05-01T00:00:00Z",
    updated_at: "2026-05-01T00:00:00Z",
    ...overrides,
  };
}

// A minimal stand-in for the supabase-js chain listEvents/getEventBySlug use.
function fakeClient(opts: { listData?: EventRecord[]; single?: EventRecord | null }) {
  return {
    from: () => ({
      select: () => ({
        order: () => ({
          limit: async () => ({ data: opts.listData ?? [], error: null }),
        }),
        eq: () => ({
          maybeSingle: async () => ({ data: opts.single ?? null, error: null }),
        }),
      }),
    }),
  };
}

beforeEach(() => {
  mockCreateClient.mockReset();
});

describe("listEvents", () => {
  it("returns the static fallback (notConfigured) when Supabase is unset", async () => {
    mockCreateClient.mockResolvedValue(null);
    const page = await listEvents(new Date("2026-01-01T00:00:00Z"));
    expect(page.notConfigured).toBe(true);
    // The single fallback event is in the future relative to Jan 2026.
    expect(page.upcoming).toHaveLength(FALLBACK_EVENTS.length);
    expect(page.past).toHaveLength(0);
  });

  it("splits live rows into upcoming/past around now (ends_at boundary)", async () => {
    const futureEvent = row({ starts_at: "2026-09-01T18:00:00Z", ends_at: "2026-09-01T20:00:00Z" });
    const pastEvent = row({ starts_at: "2026-03-01T18:00:00Z", ends_at: "2026-03-01T20:00:00Z" });
    mockCreateClient.mockResolvedValue(fakeClient({ listData: [pastEvent, futureEvent] }));

    const page = await listEvents(new Date("2026-06-22T00:00:00Z"));
    expect(page.notConfigured).toBe(false);
    expect(page.upcoming.map((e) => e.id)).toEqual([futureEvent.id]);
    expect(page.past.map((e) => e.id)).toEqual([pastEvent.id]);
  });

  it("keeps an event upcoming until its end time has passed", async () => {
    // Started an hour ago, ends in an hour — still upcoming.
    const midRun = row({ starts_at: "2026-06-22T11:00:00Z", ends_at: "2026-06-22T13:00:00Z" });
    mockCreateClient.mockResolvedValue(fakeClient({ listData: [midRun] }));

    const page = await listEvents(new Date("2026-06-22T12:00:00Z"));
    expect(page.upcoming).toHaveLength(1);
    expect(page.past).toHaveLength(0);
  });
});

describe("getEventBySlug", () => {
  it("resolves the fallback by slug when Supabase is unset", async () => {
    mockCreateClient.mockResolvedValue(null);
    const found = await getEventBySlug(FALLBACK_EVENTS[0]?.slug ?? "");
    expect(found?.slug).toBe(FALLBACK_EVENTS[0]?.slug);
  });

  it("returns null for an unknown slug when Supabase is unset", async () => {
    mockCreateClient.mockResolvedValue(null);
    expect(await getEventBySlug("does-not-exist")).toBeNull();
  });

  it("returns the row from Supabase when configured", async () => {
    const e = row({ slug: "real-event" });
    mockCreateClient.mockResolvedValue(fakeClient({ single: e }));
    const found = await getEventBySlug("real-event");
    expect(found?.id).toBe(e.id);
  });
});
