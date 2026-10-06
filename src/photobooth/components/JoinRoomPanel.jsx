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
    <section className="room-card" aria-labelledby="room-card-title">
      <div className="room-card-topline">
        <span className="room-card-icon"><CameraIcon /></span>
        <span>YOUR PHOTOBOOTH IS READY</span>
      </div>
      <h2 id="room-card-title">Join or create a room</h2>
      <p className="room-card-description">
        Start a room and share the code, or enter one you&apos;ve been given.
      </p>

      <form onSubmit={submitRoom}>
        <label htmlFor="room-code">Your room code</label>
        <div className="room-input-wrap">
          <span className="input-icon" aria-hidden="true">⌕</span>
          <input
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
          />
        </div>
        <span id="room-help" className="room-help">
          Create a code to share, or enter an existing one.
        </span>

        <div className="room-actions">
          <button className="room-button room-button-primary" type="button" onClick={createRoom}>
            <CameraIcon /> Create a room
          </button>
          <button className="room-button room-button-secondary" type="submit">
            Join with code <span aria-hidden="true">→</span>
          </button>
        </div>
      </form>
      <div
        id="room-status"
        className="room-status"
        aria-live="polite"
        data-visible={Boolean(joinStatus)}
      >
        {joinStatus || " "}
      </div>
      <div className="privacy-note">
        <span aria-hidden="true">⌑</span>
        Your photos are saved only on this device
      </div>
    </section>
  );
}
