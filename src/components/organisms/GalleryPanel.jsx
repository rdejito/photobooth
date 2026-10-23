import Box from "@mui/material/Box";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import GalleryCard from "../molecules/GalleryCard.jsx";
import { galleryPanelStyles } from "../../theme/styles/galleryPanel.js";

/**
 * GalleryPanel — the saved-snapshots section inside the gallery dialog: a
 * header with the count, an empty state, and a responsive grid of GalleryCards.
 *
 * @param {object} props
 * @param {Array} props.gallery - Saved photo entries.
 * @param {(photo: object) => void} props.downloadPhoto - Downloads a photo.
 * @param {(id: string) => void} props.deletePhoto - Deletes a photo.
 * @param {() => void} props.onClose - Closes the parent dialog.
 */
export default function GalleryPanel({ gallery, downloadPhoto, deletePhoto, onClose }) {
  return (
    <Box sx={galleryPanelStyles.wrapper}>
      {/* MUI copies the dialog's aria-labelledby onto DialogTitle, so give the
          header a distinct id; the h2 below is the dialog's accessible name. */}
      <DialogTitle
        component="header"
        id="snapshots-header"
        sx={galleryPanelStyles.header}
      >
        <Box>
          <Typography component="p" sx={galleryPanelStyles.kicker}>
            LITTLE MOMENTS, KEPT
          </Typography>
          <Typography component="h2" sx={galleryPanelStyles.title} id="snapshots-title">
            Your snapshots
          </Typography>
        </Box>
        <Box sx={galleryPanelStyles.headerActions}>
          <Typography component="span" sx={galleryPanelStyles.countPill}>
            {gallery.length} {gallery.length === 1 ? "photo" : "photos"}
          </Typography>
          <IconButton
            type="button"
            onClick={onClose}
            aria-label="Close snapshots"
            sx={galleryPanelStyles.closeButton}
          >
            ×
          </IconButton>
        </Box>
      </DialogTitle>
      {gallery.length === 0 ? (
        <Box sx={galleryPanelStyles.empty}>
          <Box component="span" aria-hidden="true" sx={galleryPanelStyles.emptyGlyph}>
            ✧
          </Box>
          <Typography component="strong" sx={galleryPanelStyles.emptyTitle}>
            Your gallery is waiting for its first memory.
          </Typography>
          <Typography component="small" sx={galleryPanelStyles.emptyDetail}>
            Take a photo together and it will appear here.
          </Typography>
        </Box>
      ) : (
        <Box sx={galleryPanelStyles.grid}>
          {gallery.map((photo) => (
            <GalleryCard
              key={photo.id}
              photo={photo}
              onDownload={downloadPhoto}
              onDelete={deletePhoto}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}