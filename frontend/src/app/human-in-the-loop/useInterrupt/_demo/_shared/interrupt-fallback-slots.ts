/**
 * Repo-authored — NOT from the docs. Both interrupt demos import
 * `generateFallbackSlots` from `../_shared/interrupt-fallback-slots`, and no
 * page publishes it. The published agent's interrupt reason carries only
 * `topic` and `attendee`, never slots, so the pages always fall back to this.
 *
 * The four slots are the ones this repo's `/human-in-the-loop` route offers.
 * The folder starts with `_`, so Next builds no route for it.
 */
import type { TimeSlot } from "../gen-ui-interrupt/_components/time-picker-card";

export type { TimeSlot };

export function generateFallbackSlots(): TimeSlot[] {
  return [
    { label: "Tomorrow 10:00 AM", iso: "2026-04-19T10:00:00-07:00" },
    { label: "Tomorrow 2:00 PM", iso: "2026-04-19T14:00:00-07:00" },
    { label: "Monday 9:00 AM", iso: "2026-04-21T09:00:00-07:00" },
    { label: "Monday 3:30 PM", iso: "2026-04-21T15:30:00-07:00" },
  ];
}
