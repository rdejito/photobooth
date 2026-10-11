import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import ActionButton from "./ActionButton.jsx";
import FramePicker from "./FramePicker.jsx";
import LayoutPicker from "./LayoutPicker.jsx";

const previewEditorStyles = {
  display: "grid",
  width: "min(720px, 100%)",
  justifyItems: "center",
  gap: 1.25,
};

const previewImageStyles = {
  display: "block",
  maxWidth: "100%",
  maxHeight: "min(36dvh, 390px)",
  width: "auto",
  height: "auto",
  mx: "auto",
  border: "5px solid #fffaf7",
  borderRadius: "13px",
  boxShadow: "0 22px 60px rgba(0,0,0,0.35)",
};

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
    const link = document.createElement("a");
    link.href = imageData;
    link.download = `little-moments-${Date.now()}.png`;
    link.click();
  };

  return (
    <>
      <canvas ref={canvasRef} hidden />
      <Dialog
        open={visible}
        onClose={hidePreview}
        maxWidth={false}
        scroll="paper"
        sx={{
          "& .MuiBackdrop-root": {
            backgroundColor: "rgba(16,14,23,0.93)",
            backdropFilter: "blur(12px)",
          },
          "& .MuiDialog-paper": {
            display: "grid",
            width: "min(720px, calc(100% - 40px))",
            maxWidth: 720,
            maxHeight: "calc(100% - 40px)",
            alignContent: "center",
            justifyItems: "center",
            m: "20px",
            overflow: "auto",
            backgroundColor: "transparent",
            boxShadow: "none",
          },
        }}
      >
        <DialogTitle
          sx={{
            position: "absolute",
            width: "1px",
            height: "1px",
            m: "-1px",
            p: 0,
            overflow: "hidden",
            clip: "rect(0, 0, 0, 0)",
            whiteSpace: "nowrap",
          }}
        >
          Latest group photo
        </DialogTitle>
        <DialogContent sx={{ display: "grid", justifyItems: "center", p: 0, overflow: "visible" }}>
          <Box sx={previewEditorStyles}>
            <Box
              component="img"
              src={imageData}
              alt="Your latest group photobooth picture"
              sx={previewImageStyles}
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
                  sx={{
                    width: "min(320px, 100%)",
                    "& .MuiInputBase-root": {
                      borderRadius: "11px",
                      backgroundColor: "rgba(255,255,255,0.05)",
                      color: "#fffaf7",
                      fontSize: 12,
                    },
                    "& .MuiInputLabel-root": {
                      color: "rgba(255,250,247,0.6)",
                      fontSize: 12,
                    },
                    "& .MuiInputLabel-root.Mui-focused": { color: "#e9b69a" },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(255,255,255,0.14)",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(233,167,127,0.45)",
                    },
                    "& .MuiInputBase-input::placeholder": {
                      color: "rgba(255,250,247,0.35)",
                      opacity: 1,
                    },
                  }}
                />
              </>
            )}
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: 1,
                mt: 0.25,
              }}
            >
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
            <Typography
              sx={{
                mt: -0.5,
                color: "rgba(255,250,247,0.58)",
                fontSize: 10,
                lineHeight: 1.5,
                textAlign: "center",
              }}
            >
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
