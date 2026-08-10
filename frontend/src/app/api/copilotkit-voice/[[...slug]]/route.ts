/**
 * The Voice page's runtime route, reproduced as published.
 *
 * This is one of the few backend files the Strands TypeScript docs print in
 * full, `@ts-ignore` and all. Two departures, both forced:
 *
 *  1. `voiceDemoAgent` points at `${AGENT_URL}/voice-demo/` rather than the
 *     published `${AGENT_URL}/voice/`. The published URL and the published
 *     agent id (`voice-demo`) do not match each other; this harness mounts
 *     every agent at its own id, so the path follows the id.
 *  2. The published comment above that line explains the choice in terms of
 *     "aimock" returning a direct text response — an internal test harness
 *     that ships in no public package. Kept verbatim anyway; it is the doc's
 *     own reasoning, not this repo's.
 *
 * Everything else — the `GuardedOpenAITranscriptionService` subclass, the
 * cached handler, the four HTTP verbs — is the page's code unchanged.
 */

import type { NextRequest } from "next/server";
import {
  CopilotRuntime,
  TranscriptionService,
  createCopilotRuntimeHandler,
} from "@copilotkit/runtime/v2";
import type { TranscribeFileOptions } from "@copilotkit/runtime/v2";
import { HttpAgent } from "@ag-ui/client";
import { TranscriptionServiceOpenAI } from "@copilotkit/voice";
import OpenAI from "openai";

const AGENT_URL = process.env.AGENT_URL || "http://localhost:8000";

// Point at the tool-free /voice endpoint so aimock returns a direct text
// response instead of a tool call that the agent can't summarize.
const voiceDemoAgent = new HttpAgent({ url: `${AGENT_URL}/voice-demo/` });

class GuardedOpenAITranscriptionService extends TranscriptionService {
  private delegate: TranscriptionServiceOpenAI | null;

  constructor() {
    super();
    const apiKey = process.env.OPENAI_API_KEY;
    this.delegate = apiKey
      ? new TranscriptionServiceOpenAI({ openai: new OpenAI({ apiKey }) })
      : null;
  }

  async transcribeFile(options: TranscribeFileOptions): Promise<string> {
    if (!this.delegate) {
      throw new Error(
        "OPENAI_API_KEY not configured for this deployment (api key missing). " +
          "Set OPENAI_API_KEY to enable voice transcription.",
      );
    }
    return this.delegate.transcribeFile(options);
  }
}

let cachedHandler: ((req: Request) => Promise<Response>) | null = null;
function getHandler(): (req: Request) => Promise<Response> {
  if (cachedHandler) return cachedHandler;

  const runtime = new CopilotRuntime({
    // The published code uses `@ts-ignore`, which this repo's lint config
    // rejects in favour of `@ts-expect-error`. Kept as published and the rule
    // disabled for this line, so the artefact stays diffable against the doc.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore -- Published CopilotRuntime agents type wraps Record in
    // MaybePromise<NonEmptyRecord<...>> which rejects plain Records; fixed in
    // source, pending release.
    agents: {
      "voice-demo": voiceDemoAgent,
      default: voiceDemoAgent,
    },
    transcriptionService: new GuardedOpenAITranscriptionService(),
  });

  cachedHandler = createCopilotRuntimeHandler({
    runtime,
    basePath: "/api/copilotkit-voice",
  });
  return cachedHandler;
}

export const POST = (req: NextRequest) => getHandler()(req);
export const GET = (req: NextRequest) => getHandler()(req);
export const PUT = (req: NextRequest) => getHandler()(req);
export const DELETE = (req: NextRequest) => getHandler()(req);
