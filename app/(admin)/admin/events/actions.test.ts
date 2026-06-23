import { beforeEach, describe, expect, it, vi } from "vitest";

// Control the Supabase server client + auth state per test.
const { mockCreateClient } = vi.hoisted(() => ({
  mockCreateClient: vi.fn<() => Promise<unknown>>(),
}));

vi.mock("@/lib/supabase/server", () => ({ createClient: mockCreateClient }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { createEvent, deleteEvent, updateEvent } from "./actions";

// A valid draft the schema accepts. Times are full ISO (what the client
// form sends after toIso()).
function validDraft(overrides: Record<string, unknown> = {}) {
  return {
    slug: "test-event",
    title: "Test Event",
    event_type: "sharing",
    starts_at: "2026-06-20T23:00:00.000Z",
    ends_at: "2026-06-21T01:00:00.000Z",
    timezone: "America/New_York",
    summary: "A test event summary.",
    is_online: false,
    is_published: false,
    is_cancelled: false,
    ...overrides,
  };
}

// Fake supabase: configurable auth user + insert/update/delete results.
function fakeClient(opts: {
  user?: { id: string } | null;
  insertResult?: { data: unknown; error: { message: string } | null };
  updateResult?: { data: unknown; error: { message: string } | null };
  deleteError?: { message: string } | null;
}) {
  const insert = () => ({
    select: () => ({ single: async () => opts.insertResult ?? { data: null, error: null } }),
  });
  const update = () => ({
    eq: () => ({
      select: () => ({ single: async () => opts.updateResult ?? { data: null, error: null } }),
    }),
  });
  const del = () => ({ eq: async () => ({ error: opts.deleteError ?? null }) });
  return {
    auth: { getUser: async () => ({ data: { user: opts.user ?? null } }) },
    from: () => ({ insert, update, delete: del }),
  };
}

beforeEach(() => {
  mockCreateClient.mockReset();
});

describe("createEvent", () => {
  it("returns invalid_input when the draft fails validation", async () => {
    mockCreateClient.mockResolvedValue(fakeClient({ user: { id: "u1" } }));
    const result = await createEvent(validDraft({ title: "" }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("invalid_input");
  });

  it("returns invalid_input when end is before start", async () => {
    mockCreateClient.mockResolvedValue(fakeClient({ user: { id: "u1" } }));
    const result = await createEvent(
      validDraft({ starts_at: "2026-06-20T23:00:00.000Z", ends_at: "2026-06-20T22:00:00.000Z" }),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("invalid_input");
  });

  it("returns dependency_unavailable when Supabase is not configured", async () => {
    mockCreateClient.mockResolvedValue(null);
    const result = await createEvent(validDraft());
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("dependency_unavailable");
  });

  it("returns unauthorized when there is no signed-in user", async () => {
    mockCreateClient.mockResolvedValue(fakeClient({ user: null }));
    const result = await createEvent(validDraft());
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("unauthorized");
  });

  it("returns server_error when the insert fails", async () => {
    mockCreateClient.mockResolvedValue(
      fakeClient({ user: { id: "u1" }, insertResult: { data: null, error: { message: "boom" } } }),
    );
    const result = await createEvent(validDraft());
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("server_error");
  });

  it("returns ok with the new id + slug on success", async () => {
    mockCreateClient.mockResolvedValue(
      fakeClient({
        user: { id: "u1" },
        insertResult: { data: { id: "ev-1", slug: "test-event" }, error: null },
      }),
    );
    const result = await createEvent(validDraft());
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.id).toBe("ev-1");
      expect(result.value.slug).toBe("test-event");
    }
  });
});

describe("updateEvent", () => {
  it("returns invalid_input for a non-uuid id", async () => {
    mockCreateClient.mockResolvedValue(fakeClient({ user: { id: "u1" } }));
    const result = await updateEvent("not-a-uuid", validDraft());
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("invalid_input");
  });

  it("updates and returns ok on success", async () => {
    mockCreateClient.mockResolvedValue(
      fakeClient({
        user: { id: "u1" },
        updateResult: {
          data: { id: "11111111-1111-4111-8111-111111111111", slug: "x" },
          error: null,
        },
      }),
    );
    const result = await updateEvent("11111111-1111-4111-8111-111111111111", validDraft());
    expect(result.ok).toBe(true);
  });
});

describe("deleteEvent", () => {
  it("returns invalid_input for a non-uuid id", async () => {
    mockCreateClient.mockResolvedValue(fakeClient({ user: { id: "u1" } }));
    const result = await deleteEvent("nope");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("invalid_input");
  });

  it("returns ok when the delete succeeds", async () => {
    mockCreateClient.mockResolvedValue(fakeClient({ user: { id: "u1" }, deleteError: null }));
    const result = await deleteEvent("11111111-1111-4111-8111-111111111111");
    expect(result.ok).toBe(true);
  });
});
