import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import CameraIcon from "../atoms/CameraIcon.jsx";
import {
  joinActionsGridStyles,
  joinBadgeStyles,
  joinCreateButtonStyles,
  joinEyebrowStyles,
  joinFieldStyles,
  joinHelpStyles,
  joinIntroStyles,
  joinLabelStyles,
  joinPanelStyles,
  joinStatusStyles,
  joinSubmitButtonStyles,
  joinTitleStyles,
} from "../../theme/styles/joinRoomPanel.js";

/**
 * JoinRoomPanel — the light paper card for joining or creating a room. The one
 * light surface on the dark home screen: white paper, rose accents.
 *
 * Offers both paths: "Create a room" (new code) and submitting a typed code.
 * Typed codes are uppercased on input and any "enter a code" validation status
 * clears as soon as the user edits the field again.
 *
 * @param {object} props
 * @param {string} props.roomInput - Current room-code field value.
 * @param {(value: string) => void} props.setRoomInput - Updates the field.
 * @param {string} props.joinStatus - Validation/error line, or "".
 * @param {(value: string) => void} props.setJoinStatus - Clears/updates status.
 * @param {() => void} props.createRoom - Creates a room from `roomInput`.
 * @param {(code: string) => void} props.joinRoom - Joins the typed room.
 */
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
    <Paper component="section" elevation={0} sx={joinPanelStyles}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <Box component="span" sx={joinBadgeStyles}>
          <CameraIcon />
        </Box>
        <Typography component="span" sx={joinEyebrowStyles}>
          Your photobooth is ready
        </Typography>
      </Stack>
      <Typography
        id="room-card-title"
        component="h2"
        variant="h5"
        sx={joinTitleStyles}
      >
        Join or create a room
      </Typography>
      <Typography sx={joinIntroStyles}>
        Start a room and share the code, or enter one you&apos;ve been given.
      </Typography>

      <Box component="form" onSubmit={submitRoom} sx={{ display: "grid", gap: 2 }}>
        <Box>
          <Typography component="label" htmlFor="room-code" sx={joinLabelStyles}>
            Your room code
          </Typography>
          <TextField
            id="room-code"
            name="room-code"
            value={roomInput}
            onChange={(event) => {
              setRoomInput(event.target.value.toUpperCase());
              if (joinStatus === "Enter a room code first.") setJoinStatus("");
            }}
            placeholder="e.g. GEMS22"
            fullWidth
            inputProps={{
              maxLength: 10,
              autoComplete: "off",
              autoCapitalize: "characters",
              spellCheck: "false",
              "aria-describedby": "room-help room-status",
            }}
            sx={joinFieldStyles}
          />
        </Box>
        <Typography id="room-help" sx={joinHelpStyles}>
          Create a code to share, or enter an existing one.
        </Typography>

        <Box sx={joinActionsGridStyles}>
          <Button
            type="button"
            variant="contained"
            onClick={createRoom}
            startIcon={
              <Box component="span" sx={{ display: "inline-flex", "& svg": { width: 16, height: 16 } }}>
                <CameraIcon />
              </Box>
            }
            sx={joinCreateButtonStyles}
          >
            Create a room
          </Button>
          <Button type="submit" variant="outlined" sx={joinSubmitButtonStyles}>
            Join with code <Box component="span" aria-hidden="true" sx={{ ml: 0.5 }}>→</Box>
          </Button>
        </Box>
      </Box>
      <Box
        id="room-status"
        sx={joinStatusStyles}
        aria-live="polite"
        data-visible={Boolean(joinStatus)}
      >
        {joinStatus || " "}
      </Box>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 2, color: "#64748b", fontSize: "0.875rem" }}>
        <Box component="span" aria-hidden="true">⌑</Box>
        <Typography component="span" sx={{ fontSize: "inherit" }}>
          Your photos are saved only on this device
        </Typography>
      </Stack>
    </Paper>
  );
}