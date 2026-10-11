import Box from "@mui/material/Box";
import PickerOptionButton from "../molecules/PickerOptionButton.jsx";
import { LAYOUTS } from "../../lib/constants.js";
import {
  layoutGridSampleStyles,
  layoutPickerStyles,
  layoutSampleBoxStyles,
  layoutSampleFillStyles,
  layoutSampleTileStyles,
  SAMPLE_STYLES,
} from "../../theme/styles/layoutPicker.js";

/**
 * LayoutOption — a single layout tile whose preview is a miniature outline of
 * the arrangement: one wide bar, one tall bar, or four 2x2 tiles. The grid
 * sample draws four gradient tiles; the single samples are gradient bars.
 */
function LayoutOption({ layoutKey, label, selected, onSelect, compact }) {
  return (
    <PickerOptionButton
      selected={selected}
      onClick={() => onSelect(layoutKey)}
      ariaLabel={label}
      label={label}
      compact={compact}
      previewSx={{ ...layoutSampleBoxStyles(compact), ...layoutPickerStyles.previewBox }}
    >
      {layoutKey === "grid-2x2" ? (
        <Box sx={{ ...SAMPLE_STYLES[layoutKey], ...layoutGridSampleStyles(selected) }}>
          {[0, 1, 2, 3].map((slot) => (
            <Box key={slot} sx={layoutSampleTileStyles} />
          ))}
        </Box>
      ) : (
        <Box sx={{ ...SAMPLE_STYLES[layoutKey], ...layoutSampleFillStyles(layoutKey, selected) }} />
      )}
    </PickerOptionButton>
  );
}

/**
 * LayoutPicker — the host's layout chooser (single horizontal / single
 * vertical / 2x2 grid), identical to FramePicker's shell via
 * PickerOptionButton.
 *
 * @param {object} props
 * @param {string} props.layout - Currently selected layout key.
 * @param {(key: string) => void} props.setLayout - Selects a layout.
 * @param {boolean} [props.compact] - Smaller tiles for the preview dialog.
 */
export default function LayoutPicker({ layout, setLayout, compact = false }) {
  return (
    <Box component="fieldset" sx={layoutPickerStyles.fieldset}>
      <Box component="legend">Pick a photo layout</Box>
      <Box
        sx={{
          ...layoutPickerStyles.options,
          ...(compact ? layoutPickerStyles.compactOptions : {}),
        }}
      >
        {LAYOUTS.map(({ key, label }) => (
          <LayoutOption
            key={key}
            layoutKey={key}
            label={label}
            selected={layout === key}
            onSelect={setLayout}
            compact={compact}
          />
        ))}
      </Box>
    </Box>
  );
}