import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import RoomCodeCard from "../molecules/RoomCodeCard.jsx";
import { boothIntroStyles } from "../../theme/styles/boothIntro.js";

/**
 * BoothIntro — the intro band under the booth header: the status headline on
 * the left and the shareable room-code card on the right. The copy switches
 * between "guests are in frame" and "booth is open" states.
 *
 * @param {object} props
 * @param {boolean} props.connected - Whether the session is connected.
 * @param {Array} props.participants - Room participants (used for copy only).
 * @param {string} props.roomCode - The room code to display/share.
 * @param {string} props.copyStatus - Clipboard copy result text.
 * @param {() => void} props.onCopy - Copies the room code.
 */
export default function BoothIntro({ connected, roomCode, copyStatus, onCopy }) {
  return (
    <Box sx={boothIntroStyles.intro}>
      <Box>
        <Typography component="p" sx={boothIntroStyles.kicker}>
          ONLINE PHOTOBOOTH
        </Typography>
        <Typography component="h1" sx={boothIntroStyles.title}>
          {connected ? "Everyone in frame." : "Your booth is open."}
        </Typography>
        <Typography component="p" sx={boothIntroStyles.description}>
          {connected
            ? "Get everyone ready, then take four shots — each one counts down from three before the flash."
            : "Share the code. Up to three guests can join, and they will appear here as they arrive."}
        </Typography>
      </Box>
      <RoomCodeCard roomCode={roomCode} copyStatus={copyStatus} onCopy={onCopy} />
    </Box>
  );
}