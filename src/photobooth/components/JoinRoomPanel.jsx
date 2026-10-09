import { Button, Card, Label, TextInput } from "flowbite-react";
import CameraIcon from "./CameraIcon.jsx";

export default function JoinRoomPanel({
  roomInput,
  setRoomInput,
  joinStatus,
  setJoinStatus,
  createRoom,
  joinRoom,
}) {
  const submitRoom = (event) => {
    event.preventDefault();
    joinRoom(roomInput);
  };

  return (
    <Card className="w-full max-w-md border border-rose-100 bg-white/90 shadow-[0_24px_80px_rgba(76,29,149,0.12)] backdrop-blur-sm">
      <div className="mb-4 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-rose-500">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-100 text-rose-600">
          <CameraIcon className="h-4 w-4" />
        </span>
        <span>Your photobooth is ready</span>
      </div>
      <h2 id="room-card-title" className="mb-2 text-2xl font-bold tracking-tight text-slate-900">
        Join or create a room
      </h2>
      <p className="mb-6 text-sm text-slate-600">
        Start a room and share the code, or enter one you&apos;ve been given.
      </p>

      <form onSubmit={submitRoom} className="space-y-4">
        <div>
          <Label htmlFor="room-code" className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
            Your room code
          </Label>
          <TextInput
            id="room-code"
            name="room-code"
            value={roomInput}
            onChange={(event) => {
              setRoomInput(event.target.value.toUpperCase());
              if (joinStatus === "Enter a room code first.") setJoinStatus("");
            }}
            placeholder="e.g. GEMS22"
            maxLength={10}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck="false"
            aria-describedby="room-help room-status"
            className="border-rose-200 bg-white text-base text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:ring-primary-200"
          />
        </div>
        <p id="room-help" className="text-sm text-slate-500">
          Create a code to share, or enter an existing one.
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <Button type="button" onClick={createRoom} className="bg-primary-700 text-white hover:bg-primary-800 focus:ring-primary-300">
            <span className="inline-flex items-center gap-2">
              <CameraIcon className="h-4 w-4" />
              Create a room
            </span>
          </Button>
          <Button type="submit" className="border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 focus:ring-primary-200">
            Join with code <span aria-hidden="true">→</span>
          </Button>
        </div>
      </form>
      <div
        id="room-status"
        className="mt-4 min-h-[24px] rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700"
        aria-live="polite"
        data-visible={Boolean(joinStatus)}
      >
        {joinStatus || " "}
      </div>
      <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
        <span aria-hidden="true">⌑</span>
        <span>Your photos are saved only on this device</span>
      </div>
    </Card>
  );
}
