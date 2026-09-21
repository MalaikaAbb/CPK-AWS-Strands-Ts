import { DemoFrame } from "@/components/demo-frame";

import { Providers } from "../providers";

/**
 * The Quickstart's `app/layout.tsx`, as far as a nested layout can carry it.
 *
 * The published file is a root layout: it renders `<html>` and `<body>`,
 * imports `globals.css` and the CopilotKit stylesheet, and wraps `children` in
 * `<Providers>`. Only the root layout may render the document shell, and this
 * app's root layout already imports both stylesheets, so what is reproduced
 * here is the part the doc highlights — a server component importing the
 * client `Providers` file and rendering it around the page.
 *
 * `Providers` is `../providers.tsx`, the doc's file verbatim. It mounts its own
 * `<CopilotKit>` with `agent="strands_agent"`, nested inside the app-wide
 * provider, so the `<CopilotSidebar />` in `page.tsx` is bound by the provider
 * exactly as the doc does it — no `agentId` on the component.
 * `lib/inspector.ts` lists this route so the root inspector stands down.
 *
 * `DemoFrame` is the harness's chrome, not the doc's.
 */
export default function QuickstartDemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DemoFrame parentPath="/quickstart" subtitle="agent: strands_agent (set on the provider)">
      <Providers>{children}</Providers>
    </DemoFrame>
  );
}
