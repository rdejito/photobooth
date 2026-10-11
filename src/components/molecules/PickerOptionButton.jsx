import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import {
  optionButtonStyles,
  optionCaptionStyles,
  optionCheckStyles,
  optionPreviewBoxStyles,
} from "../../theme/styles/pickerOptionButton.js";

/**
 * PickerOptionButton — the selectable tile shared by the frame and layout
 * pickers: a preview box (whose contents/surfaces callers supply), a ✓ badge
 * when selected and a caption underneath.
 *
 * All the selection affordances (border, background, hover) live here so both
 * pickers behave identically by construction.
 *
 * @param {object} props
 * @param {boolean} props.selected - Drives the accent treatment and the ✓ badge.
 * @param {() => void} props.onClick - Selects this option.
 * @param {string} props.ariaLabel - Accessible name (the option label).
 * @param {string} props.label - Visible caption under the preview.
 * @param {boolean} [props.compact] - Smaller paddings/preview for the dialog.
 * @param {object} [props.previewSx] - Extra styles for the preview box.
 * @param {React.ReactNode} props.children - The preview illustration.
 */
export default function PickerOptionButton({
  selected,
  onClick,
  ariaLabel,
  label,
  compact = false,
  previewSx,
  children,
}) {
  return (
    <Button
      type="button"
      aria-pressed={selected}
      aria-label={ariaLabel}
      onClick={onClick}
      sx={optionButtonStyles(selected, compact)}
    >
      <Box aria-hidden="true" sx={{ ...optionPreviewBoxStyles(compact), ...previewSx }}>
        {children}
        {selected && (
          <Box component="span" sx={optionCheckStyles}>
            ✓
          </Box>
        )}
      </Box>
      <Box component="span" sx={optionCaptionStyles}>
        {label}
      </Box>
    </Button>
  );
}