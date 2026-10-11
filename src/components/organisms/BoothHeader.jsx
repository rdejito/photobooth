import Box from "@mui/material/Box";
import BrandMark from "../atoms/BrandMark.jsx";
import ConnectionPill from "../molecules/ConnectionPill.jsx";
import { boothHeaderStyles } from "../../theme/styles/boothHeader.js";

/**
 * BoothHeader — the booth screen's top bar: the brand lockup on the left and
 * the participant count pill on the right.
 *
 * @param {object} props
 * @param {boolean} props.connected - Whether the session is connected.
 * @param {number} props.participantCount - People currently in the room.
 */
export default function BoothHeader({ connected, participantCount }) {
  return (
    <Box component="header" sx={boothHeaderStyles.header}>
      <BrandMark
        wrapperSx={boothHeaderStyles.brand}
        markSx={boothHeaderStyles.brandMark}
      />
      <ConnectionPill connected={connected} count={participantCount} />
    </Box>
  );
}