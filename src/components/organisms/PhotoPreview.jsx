import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import ActionButton from "../atoms/ActionButton.jsx";
import FramePicker from "./FramePicker.jsx";
import LayoutPicker from "./LayoutPicker.jsx";
import { downloadDataUrl, littleMomentsFilename } from "../../lib/download.js";
import {
  photoPreviewActionsStyles,
  photoPreviewCaptionStyles,
  photoPreviewContentStyles,
  photoPreviewDialogStyles,
  photoPreviewEditorStyles,
  photoPreviewEventFieldStyles,
  photoPreviewImageStyles,
  photoPreviewTitleStyles,
} from "../../theme/styles/photoPreview.js";

/**
 * PhotoPreview — the finished-photo dialog shown after a burst captures.
 *
 * The host sees live customization (frame, layout, optional event name) with a
 * save action; guests see the composed photo with download/take-another. The
 * dialog is deliberately transparent so the image floats over the blurred
 * backdrop.
 *
 * @param {object} props
 * @param {React.Ref} props.canvasRef - Offscreen render canvas updated by the
 *   capture hook; the host edits re-render through it.
 * @param {string} [props.imageData] - The composed photo data URL.
 * @param {boolean} props.visible - Dialog open state.
 * @param {boolean} props.canCustomize - Host-only: show the pickers.
 * @param {boolean} props.photoPending - True while a capture is in progress.
 * @param {string} props.frame - Currently selected frame key.
 * @param {(key: string) => void} props.setFrame - Selects a frame.
 * @param {string} [props.layout] - Currently selected layout key.
 * @param {(key: string) => void} [props.setLayout] - Selects a layout.
 * @param {string} [props.eventName] - Optional event name on the frame.
 * @param {(value: string) => void} [props.setEventName] - Updates the name.
 * @param {() => void} props.savePhoto - Saves the composed photo.
 * @param {() => void} props.hidePreview - Closes the dialog.
 */
export default function PhotoPreview({
  canvasRef,
  imageData,
  visible,
  canCustomize,
  photoPending,
  frame,
  setFrame,
  layout = "single-horizontal",
  setLayout = () => {},
  eventName = "",
  setEventName = () => {},
  savePhoto,
  hidePreview,
}) {
  const download = () => {
    if (!imageData || photoPending) return;
    downloadDataUrl(imageData, littleMomentsFilename(Date.now()));
  };

  return (
    <>
      <canvas ref={canvasRef} hidden />
      <Dialog
        open={visible}
        onClose={hidePreview}
        maxWidth={false}
        scroll="paper"
        sx={photoPreviewDialogStyles}
      >
        <DialogTitle sx={photoPreviewTitleStyles}>Latest group photo</DialogTitle>
        <DialogContent sx={photoPreviewContentStyles}>
          <Box sx={photoPreviewEditorStyles}>
            <Box
              component="img"
              src={imageData}
              alt="Your latest group photobooth picture"
              sx={photoPreviewImageStyles}
            />
            {canCustomize && (
              <>
                <FramePicker compact frame={frame} setFrame={setFrame} />
                <LayoutPicker compact layout={layout} setLayout={setLayout} />
                <TextField
                  type="text"
                  size="small"
                  label="Event name (optional)"
                  placeholder="e.g. Emma's birthday"
                  value={eventName}
                  onChange={(event) => setEventName(event.target.value)}
                  inputProps={{ maxLength: 40 }}
                  sx={photoPreviewEventFieldStyles}
                />
              </>
            )}
            <Box sx={photoPreviewActionsStyles}>
              {canCustomize && (
                <ActionButton onClick={savePhoto} variant="primary">
                  Save and share photo
                </ActionButton>
              )}
              {!photoPending && (
                <ActionButton onClick={download} variant={canCustomize ? "secondary" : "primary"}>
                  Download photo
                </ActionButton>
              )}
              {!photoPending && (
                <ActionButton onClick={hidePreview} variant="secondary">
                  Take another
                </ActionButton>
              )}
            </Box>
            <Typography sx={photoPreviewCaptionStyles}>
              {canCustomize
                ? "Choose the frame and layout, then save your finished photo to the snapshots."
                : photoPending
                  ? "The host is taking four shots, then choosing the frame and layout. The finished photo will appear in your snapshots."
                  : "Saved to your snapshots"}
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}