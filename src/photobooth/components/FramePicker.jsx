import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { FRAMES } from "../constants.js";

const FRAME_STYLES = {
  classic: ["#fff0d2", "#e84c75", "#f9dce4"],
  arcade: ["#10132d", "#53f6e4", "#29204b"],
  polaroid: ["#fffdf8", "#c07c61", "#dfd2c5"],
  film: ["#24221f", "#f7edda", "#625145"],
  none: ["#f4f5f7", "#77849a", "#cdd7e3"],
};

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

const compactOptionsStyles = {
  gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
  "@media (max-width: 380px)": {
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  },
};

export default function FramePicker({ frame, setFrame, compact = false }) {
  return (
    <Box component="fieldset" sx={pickerStyles}>
      <Box component="legend">Pick a photo frame</Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 1.125,
          ...(compact ? compactOptionsStyles : {}),
        }}
      >
        {FRAMES.map(({ key, label }) => {
          const [paper, accent, background] = FRAME_STYLES[key];
          const selected = frame === key;
          const railBackground = key === "classic"
            ? "#b66f75"
            : key === "polaroid"
              ? "#ad806a"
              : "#53f6e4";
          return (
            <Button
              key={key}
              type="button"
              aria-pressed={selected}
              onClick={() => setFrame(key)}
              sx={{
                display: "flex",
                minWidth: 0,
                flexDirection: "column",
                alignItems: "center",
                gap: "7px",
                p: compact ? "7px 5px 6px" : "10px 8px 8px",
                border: `1px solid ${selected ? "#e9a77f" : "rgba(255,255,255,0.12)"}`,
                borderRadius: "11px",
                backgroundColor: selected
                  ? "rgba(233,167,127,0.11)"
                  : "rgba(255,255,255,0.035)",
                boxShadow: selected ? "0 0 0 1px rgba(233,167,127,0.12)" : "none",
                color: "#fffaf7",
                fontSize: 10,
                textAlign: "center",
                transition: "border-color 160ms ease, background 160ms ease, transform 160ms ease",
                "&:hover": {
                  borderColor: "rgba(233,167,127,0.52)",
                  backgroundColor: selected
                    ? "rgba(233,167,127,0.16)"
                    : "rgba(255,255,255,0.075)",
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
                  height: compact ? 42 : 52,
                  placeItems: "center",
                  overflow: "hidden",
                  border: `1px solid ${accent}`,
                  borderRadius: "7px",
                  backgroundColor: background,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    width: compact ? "min(64px, 92%)" : "min(76px, 92%)",
                    height: compact ? 30 : 38,
                    gap: "3px",
                    p: "4px",
                    border: "2px solid rgba(0,0,0,0.12)",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                    backgroundColor: paper,
                  }}
                >
                  {key !== "none" && (
                    <Box
                      sx={{
                        width: 4,
                        flex: "0 0 4px",
                        backgroundColor: railBackground,
                      }}
                    />
                  )}
                  {[0, 1, 2, 3].map((tile) => (
                    <Box
                      key={tile}
                      sx={{
                        minWidth: 0,
                        flex: 1,
                        borderRadius: "2px",
                        backgroundColor: accent,
                        opacity: 0.42 + tile * 0.12,
                      }}
                    />
                  ))}
                  {key !== "none" && (
                    <Box
                      sx={{
                        width: 4,
                        flex: "0 0 4px",
                        backgroundColor: railBackground,
                      }}
                    />
                  )}
                </Box>
                {selected && (
                  <Box
                    component="span"
                    sx={{
                      position: "absolute",
                      top: 4,
                      right: 6,
                      color: "#fffaf7",
                      fontSize: 12,
                    }}
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
        })}
      </Box>
    </Box>
  );
}
