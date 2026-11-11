# deploy-agentcore — page code as published

Code blocks from https://docs.copilotkit.ai/strands-typescript/deploy-agentcore,
taken on 2026-11-11 from the page's rendered RSC payload (`data-raw-code`
attributes; the runner file from its `T` row). Byte-for-byte, except that the
`// [!code highlight]` marker on the first line of `page.tsx` is stripped, as
the rendered page strips it.

These files are **not imported, compiled or run** (`backend/tsconfig.json`
excludes `docs_verbatim/`). Deploying needs an AWS account (CDK bootstrap,
Cognito, an AgentCore Runtime). The `/deploy-agentcore` route shows them.

- "Start from scratch" (Strands variant of the CLI toggle): `create-strands.sh`,
  `config.yaml`, `deploy-strands.sh`, `local-docker.sh`, `destroy.sh`.
- "I already have an agent": `install-existing-agent.sh`, `route.ts`
  (`app/api/copilotkit/[[...slug]]/route.ts`), `agent-core-runner.ts`
  (`app/api/copilotkit/agent-core-runner.ts`), `providers.tsx`, `layout.tsx`,
  `page.tsx`, `env.local` (`.env.local`), `dev.sh`.
- Troubleshooting: `401-error.txt`.

The page's CLI toggle also prints `npx copilotkit@latest create -f
agentcore-langgraph` and `./deploy-langgraph.sh`; those are LangGraph and are
not kept here.
