# Little Moments - Live Photobooth

A browser-based group photobooth built with React, Vite, and MUI, powered by
WebRTC via [PeerJS](https://peerjs.com/). Create a room, invite up to three
guests, choose a frame, and capture a group photo.

The app is a front-end only single-page application: there is no application
server. Rooms are peer-to-peer, and photos are composed on a `<canvas>` in the
browser.

## For users

Open the photobooth website in a modern browser and allow camera access. To use
it with remote guests, use a publicly reachable HTTPS deployment.

1. One person selects **Create a room** and shares the displayed room code.
2. Up to three guests open the same website, enter that code, and select
   **Join with code**.
3. Use **Turn camera off** or **Turn camera on** in the booth controls whenever
   you want to pause or resume your video.
4. When everyone's camera is ready, the room creator takes the photo. Choose a
   frame in the preview, then select **Save and share photo** to send it to
   guests and add it to **Photos**.
5. Download the finished photo or find it in **Photos**. The gallery is stored
   in that browser's local storage; it is not shared between guests or synced
   to a server.

Available frames are grouped in the picker: **Original set** (Classic, Arcade,
Polaroid, Film, None), **Pop family** (Pop, Blush, Noir, Mint) and
**Dark & Fantasy** (Scrapbook, Victorian, Steampunk, Cyberpunk). Every frame has
a real thumbnail rendered from its own renderer, and the picker shows one theme
group at a time so it stays usable on a phone. A photo can also be laid out
horizontally, vertically, or as a 2×2 grid. The capture is four posed shots —
each one counts down from three before the flash, and the host can pause to
re-pose between shots. The
host picks a frame, layout and optional event name in the preview, and the
finished photo is shared with guests and saved to **Photos** in the local
gallery. The event name is optional: leave it empty and the frame omits the
label cleanly.

## For developers

### Requirements

- Node.js and npm
- MUI and Emotion are installed from the project dependencies

### Run locally

```bash
npm install
npm run dev
```

Open the URL printed by Vite, usually `http://localhost:5173`. The development
server listens on the local network, so other devices on the same Wi-Fi can open
it using your computer's local IP address.

### Styling stack

This app uses:

- React + Vite for the app shell and build pipeline
- MUI for interface components, layout primitives, theme defaults, and
  responsive styling
- Emotion as MUI's styling engine; component-specific styles use MUI's `sx`
  prop and the shared theme in `src/photobooth/muiTheme.js`
- No authored CSS stylesheets are required; specialized camera and photo layouts
  are implemented with responsive MUI styles

### Tests

```bash
npm run test
```

Vitest with jsdom and Testing Library. Tests live in `__tests__` folders next to
the code they cover.

### Project structure

```
index.html                     Vite entry document (mounts #root)
vite.config.js                 Vite + React plugin, dev server host, test config
vitest.config.js               Vitest config (jsdom, setup file)
scripts/run-vitest.js          Wrapper used by `npm test`
public/icon.svg                Favicon
src/
  main.jsx                     Boots React, applies ThemeProvider + CssBaseline
  LivePhotobooth.jsx           Root component: wires the hooks and renders the
                               join screen or the booth
  setupTests.js                Testing Library / jest-dom setup
  photobooth/
    constants.js               FRAMES and LAYOUTS option lists
    utils.js                   Room-code to peer-id mapping, label helpers,
                               gallery entry factory
    muiTheme.js                Shared MUI theme
    PhotoTransfer.js           Chunked, size-limited photo transfer over a
                               PeerJS data connection
    PeerRoomMessaging.js       Room protocol: join/leave, roster, camera state,
                               countdown, photo relay, room-full/closed handling
    PeerRoomSession.js         Owns the Peer, the mesh of calls and data
                               connections, and participant state
    hooks/
      usePeerRoom.js           Camera access + room lifecycle (create/join/leave,
                               toggle camera, connection status)
      usePhotoCapture.js       Per-shot countdown + flash, four posed shots,
                               canvas rendering, preview customization,
                               save/broadcast
      usePhotoGallery.js       Persists the local photo gallery in localStorage
      useCameraTileSizing.js   Sizes camera tiles to fit the grid
    components/
      HomePage.jsx             Landing page (hero art + join card)
      JoinRoomPanel.jsx        Create/join room form and status message
      VideoCallPanel.jsx       Booth layout: header, code card, video stage,
                               controls, preview dialog, gallery dialog
      VideoPreview.jsx         Single participant camera tile
      PhotoControls.jsx        Camera toggle, take photo, photos, leave
      PhotoPreview.jsx         Preview dialog with frame/layout pickers, the
                               optional event-name field and save/download
      FramePicker.jsx          Frame selection: grouped, scrollable, thumbnails
      frameThumbnail.js        Renders real no-photo frame thumbnails (cached)
      LayoutPicker.jsx         Layout selection
      GalleryPanel.jsx         Saved snapshots: download and remove
      FlashOverlay.jsx         Capture flash animation
      ActionButton.jsx         Shared styled button
      CameraIcon.jsx           Shared camera glyph
    rendering/
      PhotoRenderer.js         Top-level render: picks a frame renderer and
                               applies the single or burst-shot layout
      canvas.js                Canvas primitive (group-shot composition),
                               mirroring helper, rounded rects
      frameFonts.js            Self-hosted @fontsource imports + loadFrameFonts
      frames/                  One renderer per frame: classic, arcade, polaroid,
                               film, none, pop (pop/blush/noir/mint), scrapbook,
                               darkVictorian, steampunk, cyberpunk
        units.js               Design-unit sizes, slot geometry, scaling helper
        shared.js              Labels, fonts, cached backgrounds, slot photos
```

### Frames

Every frame — including the Original set and Film — is authored in fixed design
units (horizontal 1280×360, vertical 340×1090, grid 720×696) and scaled to the
output canvas, so one template serves every layout and resolution. Frames draw
background and decoration first, then photos clipped to their slots, then only
the foreground items that sit on frame edges — nothing decorative covers a
photo. Frames encode as JPEG (the output would otherwise exceed PhotoTransfer's
4 MB limit and the localStorage gallery budget).

See `docs/` for design specs and the UX report.

### How it works

1. `usePeerRoom` asks for camera access and creates a `PeerRoomSession`.
2. The host claims a deterministic peer id derived from the room code
   (`roomToPeerId`); guests connect to that id.
3. The host keeps the participant roster and broadcasts it, plus camera state
   and countdown ticks, over data connections. Every pair of peers also
   establishes a direct media call for video.
4. When the host takes a photo, `usePhotoCapture` repeats a 3 → 2 → 1 countdown
   with a flash for each of the four shots, grabbing one snapshot per
   participant on every flash, then renders the chosen frame and layout to a
   canvas via `PhotoRenderer`.
5. The preview is broadcast as it is customized; saving sends the final image
   to the room through `PhotoTransfer` and stores it locally via
   `usePhotoGallery`.

### Build and preview

```bash
npm run build
npm run preview
```

The production build is written to `dist/`. Deploy that directory to a static
host such as Vercel or Netlify. Camera access on deployed sites requires HTTPS;
localhost is allowed for local development.

### Connection notes

- Seats are capped at four participants (host plus three guests), enforced by
  the host in `PeerRoomMessaging.js`.
- PeerJS's public broker is used to coordinate connections. No application
  backend is required; video streams are sent directly between browsers.
- The app does not configure a TURN relay. Some restrictive networks may prevent
  browsers from connecting.
- If joining cannot complete, the app returns to the room form with a diagnostic
  message. Confirm the host is still in the booth and try another network if
  WebRTC connections are blocked.
- For remote guests, deploy the site to a publicly reachable HTTPS host. A local
  development server is only reachable by devices on the same network unless you
  use a secure tunnel.
  