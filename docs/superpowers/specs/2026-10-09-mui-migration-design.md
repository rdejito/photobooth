# Flowbite-to-MUI Migration Design

## Intent and success criteria

Replace Flowbite and Tailwind with MUI because the current Flowbite-based UI
does not meet the desired styling direction. Preserve the existing Little
Moments visual identity, page layouts, accessible controls, and photobooth
behavior while expressing application styling primarily through MUI.

The migration is successful when:

- No Flowbite or Tailwind runtime, build, or configuration dependencies remain.
- MUI is the shared component and styling system, with a customized theme that
  carries forward the current rose/primary palette and visual hierarchy.
- Existing home, room, camera, frame-selection, photo-preview, and gallery
  flows continue to work and remain visually recognizable.
- Project-authored CSS is eliminated where practical. Any retained CSS is
  limited to cases where MUI styling would make specialized responsive or
  media behavior materially harder to preserve.
- Existing functionality and accessibility are covered by tests and the
  production build.

## Current state

The application is React 18 with Vite. Flowbite React is used in `ActionButton`
and `JoinRoomPanel`; the booth and home page also contain utility classes.
Tailwind is configured through `tailwind.config.js`, `postcss.config.js`, and
the global stylesheet. The home and room views additionally depend on bespoke
CSS split across multiple files, including responsive camera-stage, frame,
gallery, and home artwork rules.

The current working tree contains independent styling, test, and stylesheet
organization edits. The implementation must preserve and integrate those
changes rather than revert or overwrite them. In particular, the changed rose
palette should inform the MUI theme, and useful stylesheet organization or
responsive behavior should be retained when moved into MUI styles.

## Architecture

### MUI application theme

Add a shared MUI theme and install it at the React application root with
`ThemeProvider` and `CssBaseline`. Define the primary palette from the current
rose/primary values and establish typography, shape, surfaces, and component
defaults centrally. Keep the theme in a focused module so it can be consumed
by the app and tested without coupling tests to Tailwind configuration.

Use MUI components for standard controls and surfaces: `Button`, `TextField`,
`Paper` or `Card`, and `Dialog` where appropriate. Use `Box`, `Stack`, and
`Typography` with the theme's `sx` API or `styled` for general layout and
responsive styling. Preserve semantic HTML, accessible names, field
associations, live status announcements, pressed/disabled states, and the
existing keyboard-operable interactions.

### Styling migration

Move reusable colors, typography, spacing, surfaces, and control variants into
the MUI theme. Replace remaining Tailwind utility classes with MUI `sx` or
theme-backed styled components. Keep bespoke rules close to the component that
owns them when this improves clarity; use a small shared stylesheet only when
necessary for specialized responsive/media behavior that does not translate
cleanly.

Migrate the home hero and decorative photobooth art, room shell and responsive
video stage, frame picker, photo preview, and gallery without changing their
content or interactions. Use MUI breakpoints to preserve existing responsive
layouts. The target is to remove project-authored CSS files if practical, not
to force a brittle conversion: document and retain only narrowly justified
CSS exceptions if converting a rule would risk camera, video, or responsive
behavior.

### Dependency and build configuration

Add `@mui/material`, `@emotion/react`, and `@emotion/styled`. Continue using the
existing `CameraIcon`; an icon package is not needed for this migration.
Remove Flowbite packages, Tailwind, its PostCSS integration and configuration,
and Flowbite CSS imports once their use is gone. Remove PostCSS-only
dependencies/configuration if no longer required by the build. Update the lock
file through the package manager and revise developer documentation to describe
the MUI styling stack.

### Tests and behavior

Replace Flowbite- and Tailwind-specific test assertions with tests of rendered
MUI controls, accessible labels and roles, variant/disabled/pressed states,
form submission, and the existing booth control and frame-picker behavior.
Add focused theme assertions for the carried-forward palette and component
defaults. Retain existing application behavior; do not change room creation,
joining, capture, gallery, or photo sharing logic as part of the styling
migration.

## Scope and non-goals

This is a presentation-layer migration. It does not alter PeerJS/WebRTC,
photograph rendering, storage, room protocols, or user-facing feature scope.
It does not require a broad visual redesign: MUI is customized to reproduce the
current design rather than adopting unmodified Material defaults.

## Validation

Run the focused UI tests for the home/join and booth controls, then run the
complete existing test suite and production build after all Flowbite/Tailwind
references are removed. Verify that the production output builds cleanly and
that responsive layouts, accessible interactions, and existing photo/room
flows are preserved. Inspect any remaining CSS exception against the
best-effort CSS-removal goal.
