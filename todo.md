# UltraClean — TODO

## Critical (ship blockers)

- [ ] **MP4 export via ffmpeg.wasm** — Current export is WebM via MediaRecorder. Most lecture software (PowerPoint, Keynote) and CME submission portals expect MP4/H.264. Bundle ffmpeg.wasm (~25MB, cacheable by service worker) and use it for encoding. This is the single most important upgrade.
- [ ] **Frame-seeking accuracy** — `video.currentTime` seeking is keyframe-based in most browsers, which means the export can drop or duplicate frames. Use the WebCodecs `VideoDecoder` API where supported (Chrome, Edge) for exact frame extraction, with canvas-seek fallback for Safari/Firefox.
- [ ] **Export progress freezes UI on long clips** — Move the entire render pipeline to a Web Worker + OffscreenCanvas so the main thread stays responsive during export. Right now a 2-minute clip will lock the tab.
- [ ] **Test on actual ultrasound clips** — Verify crop/cover coordinate math against real GE, Fuji Sonosite, Mindray, Philips, and Samsung output files. Different machines use different resolutions, aspect ratios, and overlay layouts.

## High priority

- [ ] **Audio handling** — Wire up AudioContext to capture the original audio track and mix it into the export stream when the user explicitly opts to keep audio. Currently audio is always stripped (which is the safe default, but some users will want Doppler audio preserved).
- [ ] **ffmpeg metadata nuke** — When ffmpeg.wasm is added, run `-map_metadata -1 -fflags +bitexact` to guarantee zero residual metadata in the output. The current canvas-based export inherently strips metadata, but ffmpeg makes it explicit and verifiable.
- [ ] **Preset management UI** — The current preset system works but is bare-bones. Add: rename, delete confirmation, reorder, export/import presets as JSON (so a department can share a preset pack).
- [ ] **Undo/redo stack** — Global undo/redo (Cmd+Z / Cmd+Shift+Z) across crop and cover operations. Currently only cover has single-undo.
- [ ] **Crop handle dragging** — After setting a crop, the user should be able to adjust it by dragging the edges/corners of the existing rectangle. Currently they have to redraw from scratch.
- [ ] **Keyboard shortcuts** — Space for play/pause, arrow keys for frame-step, Escape to reset, Delete to remove selected cover, number keys to jump between steps.
- [ ] **Mobile touch improvements** — Pinch-to-zoom on crop/cover canvas, two-finger drag to pan. Current touch support is functional but basic.

## Medium priority

- [ ] **Batch processing with shared template** — When multiple files are imported, let the user set crop + covers on the first clip, then apply the same template to all remaining clips with a single click. Show a thumbnail review grid before bulk export.
- [ ] **Still image support** — Accept .jpg, .png, .bmp in addition to video. Same crop/cover/metadata/export pipeline but outputting a cleaned image file. Useful for ultrasound stills saved from PACS.
- [ ] **DICOM import** — Parse DICOM (.dcm) files using a JS DICOM parser (cornerstone.js or dwv). Extract the pixel data, strip all DICOM header tags (which are full of PHI), and feed into the same pipeline.
- [ ] **Clip trimming** — Add a start/end trim control so users can cut a 30-second clip down to the 5-second segment they actually want. Should happen before crop to avoid processing unnecessary frames.
- [ ] **Custom watermark overlay** — Let the user drop a PNG (e.g., their institution’s logo or a “For educational use” badge) and position it on the output. Useful for CME lectures. This is the inverse of the current cover tool — adding branding instead of removing it.
- [ ] **Smart crop suggestion** — Analyze the first frame with canvas pixel analysis to detect high-contrast text regions (the PHI banners are almost always white/green text on black). Suggest a crop rectangle that excludes them. Always require user confirmation — never auto-crop silently.
- [ ] **Export format options** — Offer WebM, MP4, and GIF as export formats. GIF is surprisingly useful for embedding in slide decks and emails (short loops, no codec issues).
- [ ] **Dark/light theme toggle** — Currently dark-only. Some users project in bright rooms and may want a light UI. Store preference in localStorage.

## Low priority / nice to have

- [ ] **Drag-and-drop reorder for batch queue** — Let users reorder the file list before processing.
- [ ] **Side-by-side before/after** — Split-screen view on the review step showing original vs. cleaned clip synced together.
- [ ] **Frame-level cover positioning** — Allow different cover positions on different frames (for cases where a logo moves or appears intermittently). Current implementation applies covers to all frames uniformly, which is correct for 99% of cases.
- [ ] **Zoom and pan on canvas** — Let users zoom into a specific area of the ultrasound wedge to precisely place small covers over tiny text.
- [ ] **Export history log** — Keep a local log (IndexedDB) of exported filenames, timestamps, and which presets were used. Purely local, no PHI stored. Useful for tracking what’s been cleaned.
- [ ] **Shareable preset packs** — Export presets as a .json file that can be emailed to colleagues. “Here’s the preset for our ED’s GE Venue Go — import this and you’re set.”
- [ ] **Onboarding walkthrough** — First-run tooltip tour explaining each step. Most users will figure it out, but a 30-second walkthrough reduces friction.
- [ ] **Accessibility audit** — Add proper ARIA labels, keyboard navigation for all controls, screen reader support for the checklist and progress indicators. Focus management between steps.
- [ ] **Localization** — At minimum, Spanish. Many US ultrasound departments have bilingual staff.
- [ ] **PWA update notification** — When a new version of the service worker is available, show a non-intrusive “Update available — refresh to get the latest version” banner.

## Technical debt

- [ ] **Replace localStorage with IndexedDB for presets** — localStorage has a 5MB limit and is synchronous. IndexedDB is async and has no practical size limit. Matters when users accumulate many presets.
- [ ] **Error handling on file load** — Currently no user-facing error if a corrupted or unsupported file is dropped. Add try/catch around video load with a clear error message.
- [ ] **Canvas memory management** — Large videos + multiple canvases can eat RAM. Explicitly release canvas contexts and revoke object URLs when switching between steps.
- [ ] **Automated testing** — Set up Playwright tests that import a sample clip, apply crop/cover, export, and verify the output file has no metadata (via ffprobe in CI).
- [ ] **CSP headers** — When deployed, add Content-Security-Policy headers that block all outbound connections except the app’s own origin and the Google Fonts CDN. Verifiable proof that no data leaves the device.
- [ ] **Bundle size tracking** — Once ffmpeg.wasm is added, track total payload size. Target: under 30MB for the full app including WASM, all cacheable after first load.

## Known bugs

- [ ] Crop rectangle can be drawn outside video bounds if the mouse exits the canvas mid-drag — needs coordinate clamping.
- [ ] Scrubber doesn’t update in real time during crop playback on Safari due to `onseeked` timing differences.
- [ ] Cover preview (ghost shape following cursor) doesn’t render on touch devices since there’s no `mousemove` equivalent before tap.
- [ ] Export filename field allows spaces and special characters — sanitization exists but isn’t enforced on every keystroke, only on export.
