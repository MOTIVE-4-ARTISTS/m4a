"use client";

import { useEffect, useState } from "react";

// One source of truth for the "saved opportunities" set on the client.
//
// Why one module: both <SaveButton> (per-card toggle) and <ExportButtons>
// (bulk copy-link + ICS download) need to read and write the same set.
// Without a shared store these two components would each parse the URL
// hash independently and drift on race conditions.
//
// Persistence layers (per docs/adr/0006):
//   1. URL hash — shareable, the canonical "session truth."
//   2. localStorage — same-device persistence across browser sessions.
//   3. (Phase 4+) optional account sync — not in v1.
//
// On every change we write to both layers. On boot we read from URL
// hash first (the link the artist clicked is canonical for this
// session); fall back to localStorage when the hash is empty.

const STORAGE_KEY = "m4a:opps:saved";
const HASH_PREFIX = "saved=";

function readHash(): Set<string> {
  if (typeof window === "undefined") return new Set();
  const hash = window.location.hash.replace(/^#/, "");
  if (!hash.startsWith(HASH_PREFIX)) return new Set();
  return new Set(
    hash
      .slice(HASH_PREFIX.length)
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0),
  );
}

function readLocalStorage(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id): id is string => typeof id === "string"));
  } catch {
    return new Set();
  }
}

function writeBoth(ids: Set<string>): void {
  if (typeof window === "undefined") return;

  const list = Array.from(ids);

  // localStorage — best-effort. Failure (private mode, full quota) is
  // not fatal because the URL hash is still the canonical source of
  // truth for this session.
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }

  // URL hash — replaceState so this never adds a back-button entry.
  // Filter chips already use router.replace; saving a card should not
  // hijack the browser history either.
  const url = new URL(window.location.href);
  url.hash = list.length > 0 ? `${HASH_PREFIX}${list.join(",")}` : "";
  window.history.replaceState(window.history.state, "", url.toString());

  // Broadcast to other hooks listening in the same tab. The browser
  // doesn't fire `storage` events in the writer tab, so we synthesize
  // a custom event sibling components can subscribe to.
  window.dispatchEvent(new CustomEvent("m4a:saved-changed"));
}

// React hook surfacing the saved set + a toggle helper. Components that
// need read-only access (counts) get the same set as the toggle.
export function useSaved(): {
  saved: Set<string>;
  isSaved: (id: string) => boolean;
  toggle: (id: string) => void;
  ids: string[];
} {
  const [saved, setSaved] = useState<Set<string>>(new Set());

  // Hydration: URL hash wins; fall back to localStorage. After hydrating,
  // mirror back to whichever side was empty so "Copy link" works
  // immediately on a return visit.
  useEffect(() => {
    const fromHash = readHash();
    const initial = fromHash.size > 0 ? fromHash : readLocalStorage();
    setSaved(initial);
    if (fromHash.size === 0 && initial.size > 0) writeBoth(initial);
  }, []);

  // Cross-component sync: react to changes from sibling islands and
  // cross-tab storage updates.
  useEffect(() => {
    function refresh(): void {
      setSaved(readHash());
    }
    window.addEventListener("m4a:saved-changed", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("m4a:saved-changed", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  function toggle(id: string): void {
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      writeBoth(next);
      return next;
    });
  }

  return {
    saved,
    isSaved: (id) => saved.has(id),
    toggle,
    ids: Array.from(saved),
  };
}
