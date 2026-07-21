# Live Photobooth

A two-location live video photobooth built with React + WebRTC (via PeerJS).

## Run it

```bash
npm install
npm run dev
```

Open the printed local URL (usually `http://localhost:5173`).

## How to use it with someone else

1. Deploy this somewhere both of you can reach (Vercel, Netlify, etc.) — `npm run dev`
   on your own laptop only works for people on your same wifi network, since it's not
   publicly reachable. For a quick one-off test with someone remote, you can also run
   `npm run dev` and share your screen/tunnel it with something like `ngrok`.
2. One person clicks **Create Room** and shares the room code.
3. The other person enters that code and clicks **Join Room**.
4. Once connected, pick a frame and click **Take Photo** — it does a countdown, then
   stitches both video feeds into one image you can download.

## Notes

- Uses [PeerJS](https://peerjs.com/)'s free public broker server to set up the
  connection — no backend server needed. Video/audio then flows directly
  peer-to-peer between the two browsers.
- Works well on most home/mobile networks. Very locked-down corporate or school
  networks may block the direct peer connection since there's no TURN relay server
  configured.
- Camera/mic permissions are required in both browsers.
