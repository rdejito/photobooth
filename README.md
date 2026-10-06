# Little Moments - Live Photobooth

A browser-based group photobooth built with React, Vite, and WebRTC via
[PeerJS](https://peerjs.com/). Create a room, invite up to three guests, choose a
frame, and capture a group photo.

## For users

Open the photobooth website in a modern browser and allow camera access. To use
it with remote guests, use a publicly reachable HTTPS deployment.

1. One person selects **Create a room** and shares the displayed room code.
2. Up to three guests open the same website, enter that code, and select
   **Join with code**.
3. When everyone's camera is ready, the room creator chooses a frame and takes
   the photo. Guests see the countdown and captured photo.
4. Download the photo or find it in **Photos**. The gallery is stored in that
   browser's local storage; it is not shared between guests or synced to a
   server.

Available frames: Classic, Arcade, Polaroid, Film Strip, and None.

## For developers

### Requirements

- Node.js and npm

### Run locally

```bash
npm install
npm run dev
```

Open the URL printed by Vite, usually `http://localhost:5173`. The development
server listens on the local network, so other devices on the same Wi-Fi can open
it using your computer's local IP address.

### Build and preview

```bash
npm run build
npm run preview
```

The production build is written to `dist/`. Deploy that directory to a static
host such as Vercel or Netlify. Camera access on deployed sites requires HTTPS;
localhost is allowed for local development.

### Connection notes

- PeerJS's public broker is used to coordinate connections. No application
  backend is required; video streams are sent directly between browsers.
- The app does not configure a TURN relay. Some restrictive networks may prevent
  browsers from connecting.
- For remote guests, deploy the site to a publicly reachable HTTPS host. A local
  development server is only reachable by devices on the same network unless you
  use a secure tunnel.
