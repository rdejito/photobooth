import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { getFrameLabel } from "../utils.js";

const galleryButtonStyles = {
  minHeight: 30,
  px: 1.125,
  borderRadius: "7px",
  fontSize: 9,
  fontWeight: 600,
  transition: "background 150ms ease",
  "&:focus-visible": { outline: "2px solid #f4c66d", outlineOffset: 3 },
};

export default function GalleryPanel({ gallery, deletePhoto, downloadPhoto, onClose }) {
  return (
    <Box sx={{ width: "100%", maxHeight: "100%", p: { xs: 1.75, sm: 2.625 } }}>
      <DialogTitle
        component="header"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1.5,
          mb: 2,
          p: 0,
        }}
      >
        <Box>
          <Typography
            component="p"
            sx={{
              mb: 0.5,
              color: "#e9b69a",
              fontSize: 8,
              fontWeight: 700,
              letterSpacing: "1.5px",
            }}
          >
            LITTLE MOMENTS, KEPT
          </Typography>
          <Typography
            component="h2"
            sx={{
              m: 0,
              color: "#fffaf7",
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontSize: 23,
              fontWeight: 400,
            }}
          >
            Your snapshots
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography
            component="span"
            sx={{
              px: 1.25,
              py: 0.875,
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "99px",
              color: "rgba(255,250,247,0.6)",
              fontSize: 9,
            }}
          >
            {gallery.length} {gallery.length === 1 ? "photo" : "photos"}
          </Typography>
          <IconButton
            type="button"
            onClick={onClose}
            aria-label="Close snapshots"
            sx={{
              width: 32,
              height: 32,
              border: "1px solid rgba(255,255,255,0.14)",
              backgroundColor: "rgba(255,255,255,0.06)",
              color: "#fffaf7",
              fontSize: 20,
              "&:hover": { backgroundColor: "rgba(255,255,255,0.12)" },
            }}
          >
            ×
          </IconButton>
        </Box>
      </DialogTitle>
      {gallery.length === 0 ? (
        <Box
          sx={{
            display: "flex",
            minHeight: 140,
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 0.875,
            border: "1px dashed rgba(255,255,255,0.15)",
            borderRadius: "11px",
            color: "rgba(255,250,247,0.58)",
            textAlign: "center",
          }}
        >
          <Box component="span" aria-hidden="true" sx={{ color: "#e9b69a", fontSize: 25 }}>
            ✧
          </Box>
          <Typography component="strong" sx={{ color: "rgba(255,250,247,0.83)", fontSize: 11, fontWeight: 600 }}>
            Your gallery is waiting for its first memory.
          </Typography>
          <Typography component="small" sx={{ color: "rgba(255,250,247,0.46)", fontSize: 10 }}>
            Take a photo together and it will appear here.
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(185px, 1fr))",
            gap: 1.625,
            "@media (max-width: 640px)": {
              gridTemplateColumns: "repeat(auto-fill, minmax(145px, 1fr))",
            },
          }}
        >
          {gallery.map((photo) => (
            <Box
              component="article"
              key={photo.id}
              sx={{
                minWidth: 0,
                p: 1,
                border: "1px solid rgba(255,255,255,0.09)",
                borderRadius: "11px",
                backgroundColor: "rgba(10,9,16,0.24)",
              }}
            >
              <Box
                component="img"
                src={photo.dataUrl}
                alt={`Snapshot from ${photo.takenAt}`}
                sx={{
                  display: "block",
                  width: "100%",
                  aspectRatio: "4 / 3",
                  objectFit: "cover",
                  border: "1px solid rgba(255,255,255,0.16)",
                  borderRadius: "7px",
                }}
              />
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, px: 0.25, py: 1.125 }}>
                <Typography component="strong" sx={{ color: "rgba(255,250,247,0.86)", fontSize: 10, fontWeight: 600 }}>
                  {getFrameLabel(photo.frame)}
                </Typography>
                <Typography component="time" sx={{ color: "rgba(255,250,247,0.48)", fontSize: 9 }}>
                  {photo.takenAt}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", gap: 0.75 }}>
                <Button
                  type="button"
                  onClick={() => downloadPhoto(photo)}
                  aria-label={`Download photo from ${photo.takenAt}`}
                  variant="contained"
                  sx={{
                    ...galleryButtonStyles,
                    backgroundColor: "rgba(233,167,127,0.16)",
                    color: "#f2c2a3",
                    "&:hover": { backgroundColor: "rgba(233,167,127,0.27)" },
                  }}
                >
                  Download
                </Button>
                <Button
                  type="button"
                  onClick={() => deletePhoto(photo.id)}
                  aria-label={`Delete photo from ${photo.takenAt}`}
                  variant="text"
                  sx={{
                    ...galleryButtonStyles,
                    color: "rgba(255,250,247,0.62)",
                    "&:hover": { backgroundColor: "rgba(255,255,255,0.08)" },
                  }}
                >
                  Remove
                </Button>
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
