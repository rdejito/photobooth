import Box from "@mui/material/Box";
import StatusDot from "../atoms/StatusDot.jsx";
import { connectionPillStyles } from "../../theme/styles/boothHeader.js";

/**
 * ConnectionPill — the booth header's guest count / share hint.
 *
 * The pill's `data-connected` attribute drives the dot colour through a parent
 * selector in `connectionPillStyles`, so the green "live" state is a pure CSS
 * swap once everyone is in frame.
 *
 * @param {object} props
 * @param {boolean} props.connected - Whether the booth session is connected.
 * @param {number} props.count - Number of participants in the room.
 */
export default function ConnectionPill({ connected, count }) {
  return (
    <Box className="connection-pill" data-connected={connected} sx={connectionPillStyles}>
      <StatusDot
        className="connection-dot"
        size={7}
        color="#e9b69a"
        glowColor="rgba(233,182,154,0.5)"
      />
      {connected ? `${count} of 4 in the booth` : "Waiting for guests — share your code"}
    </Box>
  );
}