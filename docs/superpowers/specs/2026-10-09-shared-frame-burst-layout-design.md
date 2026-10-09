# Shared Frame for Four-Shot Burst Design

## Intent and success criteria

The host captures four distinct group shots in sequence. Only after all four
shots have been captured does the host customize the keepsake. The final image
uses all four shots in one selected layout and has one selected frame around
the complete composition. The host must not choose a single shot from the
burst.

The change is successful when:

- Frame and layout customization remain unavailable until all four captures
  complete.
- Horizontal, vertical, and 2×2 grid layouts each contain all four distinct
  shots.
- Exactly one selected frame template wraps the complete four-shot layout.
- Preview, guest broadcast, gallery save, and download use the same finished
  composite.
- A capture or render error does not expose an incomplete composite as a
  successful keepsake.
- Existing gallery entries and photo-transfer metadata remain compatible.

## Current behavior

`usePhotoCapture` captures a camera-group snapshot repeatedly, but renders each
snapshot independently and keeps the final shot as the editable preview.
`PhotoPreview` also offers a single-shot chooser. The renderer's layout code
places one already-framed image into a layout; its 2×2 mode repeats that same
image rather than using four different captures. Frame templates accept camera
participants and render their own complete frame and photo area.

The current worktree also contains the previously added layout, gallery, and
transfer changes. They must be preserved and integrated; the implementation
must not revert unrelated or pre-existing changes.

## Rendering architecture

### Capture snapshots

The capture hook stores four arrays of participant snapshots in memory. Each
array is a separate moment from the same group of cameras. Snapshot canvases
remain available while the host edits the preview so frame and layout changes
can be rendered again without retaking the burst.

No frame or layout is applied during individual capture. Once all four arrays
are present, the rendering pipeline:

1. Renders each participant array as an unframed group-shot canvas.
2. Places those four group-shot canvases in the selected horizontal, vertical,
   or 2×2 layout.
3. Passes that single layout canvas to the selected frame template.
4. Exports the one completed keepsake image.

### Frame-template contract

Each frame template receives one completed layout canvas, not four independent
framed photos or live participants. It renders its decorative frame and draws
the full layout canvas once within the template's photo area. This preserves
the distinct appearance of the Classic, Arcade, Polaroid, and Film templates
while ensuring each appears once around all four shots. The None template
returns the layout without decorative frame treatment.

The shared renderer owns burst validation, the three layout arrangements, and
the final export. Frame-specific decoration and content-area dimensions remain
owned by each template. Any renderer-interface changes are internal to the
photobooth rendering module.

### Layout semantics

- **Horizontal:** four group shots in capture order on one horizontal strip.
- **Vertical:** four group shots in capture order on one vertical strip.
- **2×2 grid:** shots one and two on the first row, shots three and four on the
  second row.

Each shot is distinct; layouts must never repeat one shot to fill multiple
cells. The frame wraps the selected arrangement once.

## Capture lifecycle and data flow

Customization unlocks only after the fourth snapshot is successfully captured
and the complete composition renders. During capture, the preview remains
pending. The capture sequence's timeout is tracked and cleared during hook
cleanup.

If a camera becomes unavailable, a snapshot cannot be created, or rendering
fails, the burst does not expose an incomplete preview. Pending state is
cleared and the existing call-status surface reports the failure so the host
can retry.

While editing, frame or layout changes re-render from all four in-memory
snapshots. The resulting finished data URL continues through the existing
preview, broadcast, gallery, and download paths. Existing transfer fields
(`dataUrl`, `frame`, and `layout`) and gallery entry shape do not change. The
four raw snapshots are not sent to guests or stored in the gallery.

## Components and responsibilities

- `usePhotoCapture` owns the four-shot lifecycle, snapshot retention, retryable
  error state, and re-rendering after frame or layout changes.
- `PhotoRenderer` renders unframed group shots, composes all four according to
  the selected layout, invokes one frame template, and exports the result.
- Each module in `rendering/frames/` draws one shared frame around the supplied
  layout canvas.
- `PhotoPreview` displays the composed image and retains frame/layout editing;
  it no longer displays controls for selecting one burst shot.
- Existing transfer and gallery modules continue to carry only the finished
  image and its frame/layout metadata.

## Error handling and compatibility

The renderer rejects an incomplete burst rather than producing a
success-shaped partial image. Capture and rendering failures keep
customization locked, clear pending state, and report through the existing
call-status/error handling. In-memory snapshots are released when the preview
is saved or dismissed.

The persisted gallery and peer-transfer formats remain unchanged. Previously
saved photos continue to render as before in the gallery. This work does not
change room creation, peer connections, participant count, countdown timing,
or gallery storage.

## Tests and validation

Focused tests will verify:

- The capture hook performs four snapshots before customization unlocks and
  supplies all four participant-snapshot sets to rendering.
- Each supported layout uses four distinct group-shot canvases in the
  expected capture order.
- Each framed template draws the single completed layout canvas once and
  retains its distinct frame treatment; None emits the layout without a frame.
- Frame and layout edits use all four retained captures.
- Preview, broadcast, and gallery save share the same completed composite.
- Incomplete capture and render-error paths do not enable customization.
- The preview contains no single-shot burst selector.

After the focused tests pass, run the complete test suite and production
build.

## Scope and non-goals

This change is limited to the existing four-shot capture, composition, and
customization flow. It does not add a variable shot count, new frame designs,
new layout types, burst-image persistence, a new photo protocol, or changes to
room and camera setup.
