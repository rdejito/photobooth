# AGENTS.md

Conventions and traps for agents working in this repo. `README.md` is the
product and architecture document — start there for how the app works and how
the source is laid out. This file carries what the code does not spell out.

## Hard rules

- **250-line ceiling** on every `.js`/`.jsx` under `src/`. `npm run check:size`
  fails otherwise. Split on a responsibility boundary, or add a justified entry
  to `EXEMPTIONS` in `scripts/check-file-length.js`.
- **No linter or formatter is configured.** Match the surrounding file:
  two-space indent, double quotes, semicolons, trailing commas.
- **Front-end only.** No application server — rooms are peer-to-peer over
  PeerJS and photos are composed on a browser canvas. There is nowhere to put
  server-side state.

## Layout conventions

### Atomic Design

`src/components/atoms` → `molecules` → `organisms` → `src/templates` →
`src/pages`. Screens compose bottom-up into a template; a page is a thin shell
over one template. Put a new UI element in the lowest layer that can hold it.

### Styles

All styling goes through MUI `sx`. Long style objects live in
`src/theme/styles/<name>.js` — one module per component, or per group of
related components. Each module exports one or more named objects ending in
`Styles`. An export is either a flat MUI style object used directly
(`sx={photoPreviewDialogStyles}`) or a map of named slots accessed by key
(`sx={cameraStageStyles.stage}`). Colour values are written literally in these
modules rather than pulled from a shared token file (see Known drift).

### JSDoc

Every component carries a JSDoc block describing each prop by name, type and
role. All 31 source components under `src/components`, `src/templates` and
`src/pages` do this — keep the block in step with the signature.

### Frames

A frame is authored once in fixed design units per layout and scaled to the
output canvas by a single context transform, so one template serves every
resolution. Draw order is fixed: background and decoration first, photos
clipped into their slots next, then only the foreground pieces that sit on
frame edges. Frames encode as JPEG to stay inside the transfer limit.

`src/rendering/frames/units.js` is the barrel every frame renderer imports
from; the implementation lives in `src/rendering/frames/units/`.

Adding a frame means three coordinated edits: `FRAMES` + `FRAME_GROUPS` in
`src/lib/constants.js`, a renderer in `src/rendering/frames/`, and an entry in
the `FRAME_RENDERERS` registry in `src/rendering/PhotoRenderer.js` —
`src/rendering/__tests__/frameRegistry.test.js` enforces the registry in both
directions. The picker thumbnail is derived from the renderer itself
(`getFrameThumbnail` calls `renderPhoto`), so it needs no separate edit.

## Traps

- **`style-regression.test.jsx` reaches outside the styles.** It asserts on the
  raw objects in `src/theme/styles/` and greps `README.md` for its
  MUI/Emotion/npm-run instructions. Changing a breakpoint value or rewriting
  the README's developer section fails a test whose name gives no hint.
- **Vitest reads `vitest.config.js`, not the `test` block in `vite.config.js`.**
  `vitest.config.js` also excludes `.worktrees/**` and `worktrees/**`; without
  that exclusion a worktree's copy of the suite runs twice.
- **Photos are capped at 4 MB.** `PhotoTransfer` rejects any data URL over
  `MAX_PHOTO_SIZE` and chunks at 12 000 characters. Check the cap before
  adding a payload field.
- **Peers are trusted more than they should be.**
  `docs/plans/reports/CODE-REVIEW.md` (2026-10-20) lists open bugs and risks
  with file:line references, several security-relevant around
  `PeerRoomMessaging`, `PhotoTransfer` and `PeerRoomLifecycle`. Read it before
  touching the room protocol.
- **The dev server is LAN-exposed.** `vite.config.js` sets
  `server.host: true`, so `npm run dev` is reachable from other devices on the
  network.

## Known drift

- `src/theme/tokens.js` is orphaned — nothing imports it, and the style
  modules inline literal colours. The README's "For developers" section and
  the file's own docstring both describe a convention the code does not follow.
- The README's project-structure tree predates `src/lib/rejoin.js`,
  `src/services/PeerRoomLifecycle.js`, `src/rendering/cropGuide.js`,
  `src/components/atoms/CropGuide.jsx`,
  `src/components/organisms/PhotoCustomizePanel.jsx` and
  `src/rendering/frames/units/`.

## Where to look

- `docs/plans/user-stories/` — behaviour specs behind the recent work:
  rejoin, mixed-device layouts, the crop guide, guest live preview.
- `docs/plans/reports/UX-REPORT.md` — UX findings.
- `docs/plans/reports/CODE-REVIEW.md` — open defects, dated.

## Commits

Conventional prefixes: `feat:`, `fix:`, `refactor:`, `chore:`, with an
optional `(#N)` PR reference. Default branch `main`; remote
`github.com/rdejito/photobooth`.
