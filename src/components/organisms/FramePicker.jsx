import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import PickerOptionButton from "../molecules/PickerOptionButton.jsx";
import { FRAMES, FRAME_GROUPS } from "../../lib/constants.js";
import { getFrameThumbnail } from "../../rendering/frameThumbnail.js";
import {
  frameGroupTabsStyles,
  framePickerStyles,
  framePreviewBoxStyles,
  frameThumbnailImageStyles,
  frameThumbnailStyles,
} from "../../theme/styles/framePicker.js";

/**
 * FrameOption — a single frame tile: the live thumbnail (rendered with real
 * empty photo slots) inside a PickerOptionButton.
 */
function FrameOption({ frameKey, label, selected, onSelect, compact }) {
  const [thumbnail, setThumbnail] = useState("");

  useEffect(() => {
    let active = true;
    getFrameThumbnail(frameKey).then((dataUrl) => {
      if (active) setThumbnail(dataUrl);
    });
    return () => {
      active = false;
    };
  }, [frameKey]);

  return (
    <PickerOptionButton
      selected={selected}
      onClick={() => onSelect(frameKey)}
      ariaLabel={label}
      label={label}
      compact={compact}
      previewSx={{ ...frameThumbnailStyles(compact), ...framePreviewBoxStyles }}
    >
      {thumbnail ? (
        <Box component="img" src={thumbnail} alt="" sx={frameThumbnailImageStyles} />
      ) : null}
    </PickerOptionButton>
  );
}

/**
 * FramePicker — the host's frame chooser: a theme-group toggle (Classic /
 * Colour / Vintage) above a scrollable grid of frame thumbnails.
 *
 * @param {object} props
 * @param {string} props.frame - Currently selected frame key.
 * @param {(key: string) => void} props.setFrame - Selects a frame.
 * @param {boolean} [props.compact] - Smaller tiles for the preview dialog.
 */
export default function FramePicker({ frame, setFrame, compact = false }) {
  const [activeGroup, setActiveGroup] = useState(
    () => FRAMES.find(({ key }) => key === frame)?.group || FRAME_GROUPS[0].key,
  );

  const frames = FRAMES.filter(({ group }) => group === activeGroup);

  return (
    <Box component="fieldset" sx={framePickerStyles.fieldset}>
      <Box component="legend">Pick a photo frame</Box>
      <ToggleButtonGroup
        exclusive
        size="small"
        value={activeGroup}
        onChange={(event, next) => {
          if (next) setActiveGroup(next);
        }}
        aria-label="Frame theme group"
        sx={frameGroupTabsStyles}
      >
        {FRAME_GROUPS.map(({ key, label }) => (
          <ToggleButton key={key} type="button" value={key} aria-label={label}>
            {label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      <Box sx={framePickerStyles.optionsGrid}>
        {frames.map(({ key, label }) => (
          <FrameOption
            key={key}
            frameKey={key}
            label={label}
            selected={frame === key}
            onSelect={setFrame}
            compact={compact}
          />
        ))}
      </Box>
      <Typography component="p" sx={framePickerStyles.note}>
        Thumbnails show the real frame with empty photo slots.
      </Typography>
    </Box>
  );
}