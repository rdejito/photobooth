import Dialog from "@mui/material/Dialog";
import GalleryPanel from "../organisms/GalleryPanel.jsx";
import { galleryDialogStyles } from "../../theme/styles/galleryDialog.js";

/**
 * GalleryDialog — the snapshots dialog chrome. Owning the Dialog here (instead
 * of inside GalleryPanel) keeps the panel a pure section that tests and other
 * hosts can reuse, while the dialog owns the blurred backdrop and paper.
 *
 * @param {object} props
 * @param {boolean} props.open - Whether the dialog is showing.
 * @param {() => void} props.onClose - Dismisses the dialog.
 * @param {Array} props.gallery - The saved snapshot list.
 * @param {(id: string) => void} props.deletePhoto - Removes a snapshot.
 * @param {(photo: object) => void} props.downloadPhoto - Downloads a snapshot.
 */
export default function GalleryDialog({
  open,
  onClose,
  gallery,
  deletePhoto,
  downloadPhoto,
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="snapshots-title"
      maxWidth={false}
      scroll="paper"
      sx={galleryDialogStyles}
    >
      <GalleryPanel
        gallery={gallery}
        deletePhoto={deletePhoto}
        downloadPhoto={downloadPhoto}
        onClose={onClose}
      />
    </Dialog>
  );
}