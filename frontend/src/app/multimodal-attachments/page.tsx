import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

const MODALITIES: [string, string, string][] = [
  ["Image", "image/*", "Converted to a Strands ImageBlock — png, jpeg, gif, webp."],
  [
    "Document",
    "everything else",
    "Converted to a DocumentBlock — pdf, csv, doc, docx, xls, xlsx, html, txt, md.",
  ],
  [
    "Video",
    "video/*",
    "Converted to a VideoBlock — flv, mkv, mov, mpeg, mpg, mp4, 3gp, webm, wmv.",
  ],
  [
    "Audio",
    "audio/*",
    "Dropped. The adapter skips AudioInputContent outright; nothing reaches the model.",
  ],
];

export default function Page() {
  return (
    <>
      <RouteHeader path="/multimodal-attachments" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          One prop — <code>attachments={"{{ enabled: true }}"}</code> — turns
          the composer into a drop target. CopilotKit reads each file (base64 by
          default, or through your <code>onUpload</code>), builds an{" "}
          <code>InputContent</code> array of text plus one part per attachment,
          and sends it over AG-UI. This route also wires the two error hooks the
          page documents: <code>onUploadFailed</code> for rejections before
          send, <code>onError</code> for failures after.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Drop a PNG in, then ask: what is in this image?",
              "Drop a PDF in, then ask: summarise this document.",
            ]}
            expect="The attachment chips render with previews, and the reply describes the file's actual contents."
            fail="A 15MB file should be rejected before send with a file-too-large line in the amber bar. If it uploads, maxSize did not apply."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/multimodal-attachments/demo-chat/page.tsx" />
      </Panel>

      <Panel
        title="What each modality actually does on Strands"
        description="From @ag-ui/aws-strands' own convertAguiContentToStrands, not from the doc page."
      >
        <dl className="space-y-3 text-sm">
          {MODALITIES.map(([name, mime, what]) => (
            <div key={name} className="flex flex-col gap-0.5">
              <dt className="font-medium text-slate-900 dark:text-slate-100">
                {name}{" "}
                <span className="font-mono text-xs text-slate-500">{mime}</span>
              </dt>
              <dd className="text-slate-600 dark:text-slate-400">{what}</dd>
            </div>
          ))}
        </dl>
      </Panel>

      <Callout tone="warn" title="Audio uploads, previews, and never arrives">
        <p>
          The page&apos;s supported-file-types table lists Audio with an
          audio-player preview and &quot;Model-dependent&quot; AI support, and
          its configuration example leads with{" "}
          <code>accept: &quot;image/*,audio/*,…&quot;</code>. The adapter
          disagrees:{" "}
          <code>convertAguiContentToStrands</code> in{" "}
          <code>@ag-ui/aws-strands</code> documents{" "}
          <code>AudioInputContent</code> as &quot;skipped (Strands has no audio
          support)&quot;. Attach an MP3 and it will upload, preview, send, and
          be discarded server-side with no error. This route keeps the
          page&apos;s <code>accept</code> string unchanged so you can watch it
          happen.
        </p>
      </Callout>

      <Callout tone="info" title="Two undefined globals in the published snippets">
        <p>
          <code>onUploadFailed</code>&apos;s body is{" "}
          <code>toast.error(error.message)</code> and the metadata example calls{" "}
          <code>uploadToStorage(file)</code> and reads{" "}
          <code>currentUser.id</code>. None of the three is imported, defined,
          or attributed to a package. They are placeholders written as if they
          were real.
        </p>
      </Callout>
    </>
  );
}
