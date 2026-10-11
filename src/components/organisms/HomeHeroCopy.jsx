import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {
  homeHeroCopyStyles,
  homePointStyles,
} from "../../theme/styles/homeHeroCopy.js";

/** One numbered "how it works" point with its gold badge. */
function Point({ number, title, detail }) {
  return (
    <Box sx={homePointStyles.point}>
      <Box component="span" sx={homePointStyles.pointIcon}>
        {number}
      </Box>
      <Box>
        <Typography component="strong" sx={homePointStyles.pointTitle}>
          {title}
        </Typography>
        <Typography component="small" sx={homePointStyles.pointDescription}>
          {detail}
        </Typography>
      </Box>
    </Box>
  );
}

/**
 * HomeHeroCopy — the market-y left column of the home hero: eyebrow, serif
 * headline, description and the two numbered "how it works" points. Purely
 * presentational; the join card lives beside it in the template.
 */
export default function HomeHeroCopy() {
  return (
    <Box sx={homeHeroCopyStyles.copy}>
      <Typography component="div" sx={homeHeroCopyStyles.eyebrow}>
        <span>✦</span> YOUR ONLINE PHOTOBOOTH
      </Typography>
      <Typography component="h1" sx={homeHeroCopyStyles.title}>
        Get together.
        <br />
        <Box component="span">Make a moment.</Box>
      </Typography>
      <Typography component="p" sx={homeHeroCopyStyles.description}>
        Invite your favorite people, take a photo together, then choose a
        frame. Save every little moment to your snapshots.
      </Typography>
      <Box sx={homeHeroCopyStyles.points}>
        <Point
          number="01"
          title="Start or join a room"
          detail="Share a room code to connect"
        />
        <Point
          number="02"
          title="Take and save photos"
          detail="Choose a frame after each photo"
        />
      </Box>
    </Box>
  );
}