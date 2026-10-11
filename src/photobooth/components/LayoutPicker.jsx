import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { LAYOUTS } from "../constants.js";

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
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  "@media (max-width: 380px)": {
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  },
};

const SAMPLE_STYLES = {
  "single-horizontal": {
    width: "92%",
    height: 26,
    borderRadius: 8,
  },
  "single-vertical": {
    width: 18,
    height: 40,
    borderRadius: 8,
  },
  "grid-2x2": {
    width: "92%",
    height: 38,
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 2,
    padding: 0,
  },
};

export default function LayoutPicker({ layout, setLayout, compact = false }) {
  return (
    <Box component="fieldset" sx={pickerStyles}>
      <Box component="legend">Pick a photo layout</Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 1.125,
          ...(compact ? compactOptionsStyles : {}),
        }}
      >
        {LAYOUTS.map(({ key, label }) => {
          const selected = layout === key;
          return (
            <Button
              key={key}
              type="button"
              aria-pressed={selected}
              onClick={() => setLayout(key)}
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
                  placeItems: "center",
                  width: "100%",
                  height: compact ? 42 : 52,
                  border: "1px solid rgba(255,255,255,0.14)",
                  borderRadius: "7px",
                  backgroundColor: "rgba(255,255,255,0.07)",
                }}
              >
                {key === "grid-2x2" ? (
                  <Box sx={{ ...SAMPLE_STYLES[key], ...(selected ? { boxShadow: "0 0 0 1px rgba(233,167,127,0.45)" } : {}) }}>
                    {[0, 1, 2, 3].map((slot) => (
                      <Box
                        key={slot}
                        sx={{
                          minWidth: 0,
                          background: "linear-gradient(145deg, rgba(233,167,127,0.8), rgba(230,216,202,0.72))",
                          borderRadius: "4px",
                          opacity: 0.9,
                        }}
                      />
                    ))}
                  </Box>
                ) : (
                  <Box
                    sx={{
                      ...SAMPLE_STYLES[key],
                      background: key === "single-vertical"
                        ? "linear-gradient(180deg, rgba(233,167,127,0.9), rgba(196,150,228,0.72))"
                        : "linear-gradient(90deg, rgba(233,167,127,0.95), rgba(196,150,228,0.72))",
                      borderRadius: 8,
                      boxShadow: selected ? "0 0 0 1px rgba(233,167,127,0.45)" : "none",
                    }}
                  />
                )}
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
