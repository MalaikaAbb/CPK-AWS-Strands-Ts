# Doc drift changelog

What the CopilotKit docs changed under this repo, written by the sync on
`/doc-sync`. Only pages that actually moved are recorded — a sync that finds
everything unchanged writes nothing here at all.

Holds the 3 most recent dated entries. When a change lands on a fourth
date, the oldest entry is dropped. Entries are counted, not aged, so a gap of
weeks between changes does not expire anything.

## 2026-08-17

### 12:33 UTC — 1 page, highest severity low

**Low — Voice** · _local snapshot edit, not an upstream change_

`/strands-typescript/voice` · route `/voice` · under “Driving the demo without a mic”

2 prose lines changed.

````diff
+ For Playwright runs, screenshots, or any flow where prompting for mic permissions is awkward, ship a button that emits a canned sample phrase through an `onTranscribed` callback, bypassing the transcription endpoint entirely:
+ 
````
