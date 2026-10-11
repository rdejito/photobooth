import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { roomCodeCardStyles } from "../../theme/styles/boothIntro.js";

/**
 * RoomCodeCard — the booth intro's shareable code card with its copy button.
 * The code is selectable (`user-select: all`) so guests can grab it manually
 * if clipboard copying fails.
 *
 * @param {object} props
 * @param {string} props.roomCode - The room code, or "" before a room exists.
 * @param {string} props.copyStatus - "Copied", an error string, or "".
 * @param {() => void} props.onCopy - Copies the code via the clipboard API.
 */
export default function RoomCodeCard({ roomCode, copyStatus, onCopy }) {
  return (
    <Box sx={roomCodeCardStyles}>
      <Typography component="span">PHOTOBOOTH CODE</Typography>
      <Typography component="strong">{roomCode || "------"}</Typography>
      <Typography component="small">Invite up to three guests</Typography>
      <Button variant="outlined" onClick={onCopy} disabled={!roomCode}>
        {copyStatus || "Copy code"}
      </Button>
    </Box>
  );
}