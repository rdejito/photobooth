import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { getFrameLabel, getLayoutLabel } from "../../lib/utils.js";
import { galleryButtonStyles } from "../../theme/styles/galleryPanel.js";
import { galleryCardStyles } from "../../theme/styles/galleryCard.js";

/**
 * GalleryCard — a single saved snapshot: the image, its frame/layout/time meta
 * and the Download / Remove actions.
 *
 * @param {object} props
 * @param {object} props.photo - A gallery entry (`dataUrl`, `takenAt`, ...).
 * @param {(photo: object) => void} props.onDownload - Download handler.
 * @param {(id: string) => void} props.onDelete - Delete handler.
 */
export default function GalleryCard({ photo, onDownload, onDelete }) {
  return (
    <Box component="article" sx={galleryCardStyles.card}>
      <Box
        component="img"
        src={photo.dataUrl}
        alt={`Snapshot from ${photo.takenAt}`}
        sx={galleryCardStyles.image}
      />
      <Box sx={galleryCardStyles.meta}>
        <Typography component="strong" sx={galleryCardStyles.frameLabel}>
          {getFrameLabel(photo.frame)}
        </Typography>
        <Typography component="small" sx={galleryCardStyles.layoutLabel}>
          {getLayoutLabel(photo.layout || "single-horizontal")}
        </Typography>
        <Typography component="time" sx={galleryCardStyles.timeLabel}>
          {photo.takenAt}
        </Typography>
      </Box>
      <Box sx={galleryCardStyles.actions}>
        <Button
          type="button"
          onClick={() => onDownload(photo)}
          aria-label={`Download photo from ${photo.takenAt}`}
          variant="contained"
          sx={{ ...galleryButtonStyles, ...galleryCardStyles.downloadButton }}
        >
          Download
        </Button>
        <Button
          type="button"
          onClick={() => onDelete(photo.id)}
          aria-label={`Delete photo from ${photo.takenAt}`}
          variant="text"
          sx={{ ...galleryButtonStyles, ...galleryCardStyles.removeButton }}
        >
          Remove
        </Button>
      </Box>
    </Box>
  );
}