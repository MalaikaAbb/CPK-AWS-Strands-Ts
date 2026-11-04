/**
 * Repo-authored — NOT from the docs. The headless page imports
 * `generateFallbackSlots` and `TimeSlot` from `../_shared/interrupt-fallback-slots`,
 * which no page publishes. Same module as the useInterrupt route's.
 */
export {
  generateFallbackSlots,
  type TimeSlot,
} from "../../../useInterrupt/_demo/_shared/interrupt-fallback-slots";
