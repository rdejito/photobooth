import Box from "@mui/material/Box";
import SiteNav from "../components/molecules/SiteNav.jsx";
import JoinRoomPanel from "../components/molecules/JoinRoomPanel.jsx";
import HomeHeroCopy from "../components/organisms/HomeHeroCopy.jsx";
import PhotoArtwork from "../components/organisms/PhotoArtwork.jsx";
import { photoArtworkStyles } from "../theme/styles/photoArtwork.js";
import {
  homeFooterStyles,
  homeHeroStyles,
  homeShellStyles,
} from "../theme/styles/homeTemplate.js";

/**
 * HomeTemplate — the complete layout of the landing screen: navigation, the
 * two-column hero (marketing copy + join card beside the photo collage) and
 * the footer. Composes molecules/organisms; the page simply forwards the join
 * form props through to JoinRoomPanel.
 *
 * @param {object} props - Join-form props for JoinRoomPanel (roomInput,
 *   setRoomInput, joinStatus, setJoinStatus, createRoom, joinRoom).
 */
export default function HomeTemplate(props) {
  return (
    <Box sx={homeShellStyles}>
      <SiteNav />

      <Box component="section" sx={homeHeroStyles}>
        <HomeHeroCopy />
        <Box sx={photoArtworkStyles.side}>
          <Box aria-hidden="true">
            <PhotoArtwork />
          </Box>
          <JoinRoomPanel {...props} />
        </Box>
      </Box>

      <Box component="footer" sx={homeFooterStyles}>
        <span>Photos are saved in this browser</span>
        <Box component="span" sx={{ color: "#df987f" }}>
          ·
        </Box>
        <span>© 2026 Little Moments. All rights reserved.</span>
      </Box>
    </Box>
  );
}