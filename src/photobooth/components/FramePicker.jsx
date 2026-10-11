import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import { FRAMES, FRAME_GROUPS } from "../constants.js";
import { getFrameThumbnail } from "./frameThumbnail.js";

const pickerStyles = {
  width: "100%",
  minWidth: 0,
  m: 0,
  p: 0,
  border: 0,
  "& legend": {
    mb: 1.25,
    px: 0.125,
    color: "rgba(255,250,247,0.86)",
    fontSize: 13,
    fontWeight: 600,
  },
};

const optionsGridStyles = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))",
  gap: 1.125,
  maxHeight: 260,
  overflowY: "auto",
  overscrollBehavior: "contain",
  p: 0.125,
  "@media (max-width: 640px)": {
    gridTemplateColumns: "repeat(auto-fill, minmax(84px, 1fr))",
    maxHeight: 220,
  },
};

function FrameOption({ frameKey, label, selected, onSelect, compact }) {
  const [thumbnail, setThumbnail] = useState("");

  useEffect(() => {
    setThumbnail(getFrameThumbnail(frameKey));
  }, [frameKey]);

  return (
    <Button
      type="button"
      aria-pressed={selected}
      aria-label={label}
      onClick={() => onSelect(frameKey)}
      sx={{
        display: "flex",
        minWidth: 0,
        flexDirection: "column",
        alignItems: "center",
        gap: "7px",
        p: compact ? "7px 5px 6px" : "10px 8px 8px",
        border: `1px solid ${selected ? "#e9a77f" : "rgba(255,255,255,0.12)"}`,
        borderRadius: "11px",
        backgroundColor: selected ? "rgba(233,167,127,0.11)" : "rgba(255,255,255,0.035)",
        boxShadow: selected ? "0 0 0 1px rgba(233,167,127,0.12)" : "none",
        color: "#fffaf7",
        fontSize: 10,
        textAlign: "center",
        transition: "border-color 160ms ease, background 160ms ease, transform 160ms ease",
        "&:hover": {
          borderColor: "rgba(233,167,127,0.52)",
          backgroundColor: selected ? "rgba(233,167,127,0.16)" : "rgba(255,255,255,0.075)",
          transform: "translateY(-1px)",
        },
      }}
    >
      <Box
        aria-hidden="true"
        sx={{
          position: "relative",
          display: "grid",
          width: "100%",
          height: compact ? 52 : 62,
          placeItems: "center",
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.14)",
          borderRadius: "7px",
          backgroundColor: "rgba(0,0,0,0.35)",
        }}
      >
        {thumbnail ? (
          <Box
            component="img"
            src={thumbnail}
            alt=""
            sx={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
          />
        ) : null}
        {selected && (
          <Box
            component="span"
            sx={{ position: "absolute", top: 4, right: 6, color: "#fffaf7", fontSize: 12 }}
          >
            ✓
          </Box>
        )}
      </Box>
      <Box
        component="span"
        sx={{
          overflow: "hidden",
          width: "100%",
          fontSize: 10,
          fontWeight: 600,
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </Box>
    </Button>
  );
}

export default function FramePicker({ frame, setFrame, compact = false }) {
  const [activeGroup, setActiveGroup] = useState(
    () => FRAMES.find(({ key }) => key === frame)?.group || FRAME_GROUPS[0].key,
  );

  const frames = FRAMES.filter(({ group }) => group === activeGroup);

  return (
    <Box component="fieldset" sx={pickerStyles}>
      <Box component="legend">Pick a photo frame</Box>
      <ToggleButtonGroup
        exclusive
        size="small"
        value={activeGroup}
        onChange={(event, next) => {
          if (next) setActiveGroup(next);
        }}
        aria-label="Frame theme group"
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 0.5,
          mb: 1.25,
          "& .MuiToggleButton-root": {
            minWidth: 0,
            px: 1.25,
            py: 0.5,
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "99px !important",
            color: "rgba(255,250,247,0.72)",
            fontSize: 10,
            fontWeight: 600,
            textTransform: "none",
            "&.Mui-selected": {
              borderColor: "#e9a77f",
              backgroundColor: "rgba(233,167,127,0.16)",
              color: "#fffaf7",
            },
          },
        }}
      >
        {FRAME_GROUPS.map(({ key, label }) => (
          <ToggleButton key={key} type="button" value={key} aria-label={label}>
            {label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      <Box sx={optionsGridStyles}>
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
      <Typography
        component="p"
        sx={{ mt: 1, mb: 0, color: "rgba(255,250,247,0.48)", fontSize: 10 }}
      >
        Thumbnails show the real frame with empty photo slots.
      </Typography>
    </Box>
  );
}
