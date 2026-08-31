import "server-only";

import {
  CopilotKitIntelligence,
  CopilotRuntime,
  type CopilotRuntimeOptions,
} from "@copilotkit/runtime/v2";

/**
 * CopilotKit Intelligence, wired once for every runtime in the harness.
 *
 * The Quickstart's runtime block hands `CopilotRuntime` two options together:
 *
 *     intelligence: new CopilotKitIntelligence({
 *       apiKey: process.env.INTELLIGENCE_API_KEY!,
 *     }),
 *     // Threads are per-user. Without this, every visitor shares one history.
 *     identifyUser: (request) => ({
 *       id: request.headers.get("x-user-id") ?? "anonymous",
 *       name: request.headers.get("x-user-name") ?? "Anonymous",
 *     }),
 *
 * Both are reproduced below, `identifyUser` including its published comment.
 *
 * The conditional around them is the page's own instruction, not an invention.
 * Its callout says: "Drop the `intelligence` and `identifyUser` options and the
 * runtime falls back to SSE mode with an in-memory runner. Chat still works,
 * but Threads and the Inspector stay locked and the key is never read." Since
 * this harness has to run for anyone who clones it, with or without a licence,
 * `intelligenceOptions()` returns the pair when a key is present and an empty
 * object when it is not — which is exactly the documented drop.
 *
 * Note the `!` in the published snippet: `apiKey: process.env.INTELLIGENCE_API_KEY!`
 * asserts the key is set. Follow that literally with no key in the environment
 * and you construct `CopilotKitIntelligence` with `undefined`, which is the
 * state the callout tells you to avoid rather than the fallback it describes.
 * Spreading the whole block is what makes the drop actually happen.
 */

/** Set in `.env.local`. Absent on a clone with no licence, which is fine. */
export const INTELLIGENCE_API_KEY = process.env.INTELLIGENCE_API_KEY;

export const INTELLIGENCE_ENABLED = Boolean(INTELLIGENCE_API_KEY);

/**
 * Build a `CopilotRuntime` with Intelligence attached, or without it.
 *
 * Two `new CopilotRuntime(...)` calls rather than one call with a spread,
 * because the constructor is overloaded and one arm requires `intelligence` to
 * be present and non-optional. Spreading `{ intelligence?: ... }` widens it to
 * `CopilotKitIntelligence | undefined`, which matches no overload — so the
 * branch has to happen around the constructor, not inside its argument.
 */
export function createRuntime<T extends CopilotRuntimeOptions>(
  base: T,
): CopilotRuntime {
  if (!INTELLIGENCE_API_KEY) {
    return new CopilotRuntime(base);
  }

  return new CopilotRuntime({
    ...base,
    intelligence: new CopilotKitIntelligence({
      apiKey: INTELLIGENCE_API_KEY,
    }),
    // Threads are per-user. Without this, every visitor shares one history.
    identifyUser: (request: Request) => ({
      id: request.headers.get("x-user-id") ?? "anonymous",
      name: request.headers.get("x-user-name") ?? "Anonymous",
    }),
  });
}
