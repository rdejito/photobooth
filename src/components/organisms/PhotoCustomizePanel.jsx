import Box from "@mui/material/Box";
import FramePicker from "./FramePicker.jsx";
import LayoutPicker from "./LayoutPicker.jsx";
import { photoCustomizeStyles } from "../../theme/styles/boothTemplate.js";

/**
 * PhotoCustomizePanel — the host-only frame + layout pickers shown under the
 * control bar while a captured photo is waiting to be styled.
 *
 * @param {object} props
 * @param {string} props.frame - Selected frame key.
 * @param {(key: string) => void} props.setFrame - Selects a frame.
 * @param {string} props.layout - Selected layout key.
 * @param {(key: string) => void} props.setLayout - Selects a layout.
 */
export default function PhotoCustomizePanel({ frame, setFrame, layout, setLayout }) {
  return (
    <Box sx={photoCustomizeStyles}>
      <FramePicker frame={frame} setFrame={setFrame} />
      <LayoutPicker layout={layout} setLayout={setLayout} />
    </Box>
  );
}