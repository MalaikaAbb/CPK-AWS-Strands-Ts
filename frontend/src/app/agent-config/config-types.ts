/**
 * The `AgentConfig` type the page annotates and never declares.
 *
 * `ConfigContextRelay({ config }: { config: AgentConfig })` is the published
 * signature, and the body reads exactly three fields off it:
 * `config.tone`, `config.expertise`, `config.responseLength`.
 *
 * The page's "When to use this" section then lists candidate values for each
 * in prose — "playful", "formal", "casual"; "beginner", "intermediate",
 * "expert"; short / medium / long — and its LangGraph backend sample supplies
 * the defaults (`"professional"`, `"intermediate"`, `"concise"`). The unions
 * below are those two lists reconciled; the type itself is not published.
 */

export const TONES = ["professional", "playful", "formal", "casual"] as const;
export const EXPERTISE = ["beginner", "intermediate", "expert"] as const;
export const RESPONSE_LENGTHS = ["concise", "medium", "detailed"] as const;

export type Tone = (typeof TONES)[number];
export type Expertise = (typeof EXPERTISE)[number];
export type ResponseLength = (typeof RESPONSE_LENGTHS)[number];

export interface AgentConfig {
  tone: Tone;
  expertise: Expertise;
  responseLength: ResponseLength;
}

/** Matches the defaults the page's backend sample falls back to. */
export const DEFAULT_CONFIG: AgentConfig = {
  tone: "professional",
  expertise: "intermediate",
  responseLength: "concise",
};
