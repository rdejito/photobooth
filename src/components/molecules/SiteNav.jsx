import Box from "@mui/material/Box";
import BrandMark from "../atoms/BrandMark.jsx";
import StatusDot from "../atoms/StatusDot.jsx";
import { siteNavStyles } from "../../theme/styles/siteNav.js";

/**
 * SiteNav — the home screen's top navigation: the brand lockup on the left and
 * the "your people" note with the live dot on the right.
 */
export default function SiteNav() {
  return (
    <Box component="nav" aria-label="Main navigation" sx={siteNavStyles.nav}>
      <BrandMark
        as="a"
        href="/"
        ariaLabel="Little Moments home"
        wrapperSx={siteNavStyles.brand}
        markSx={siteNavStyles.brandIcon}
      />
      <Box component="span" sx={siteNavStyles.navNote}>
        <StatusDot size={7} color="#c9dfb2" glowColor="rgba(201,223,178,0.6)" />
        A little booth for your people
      </Box>
    </Box>
  );
}