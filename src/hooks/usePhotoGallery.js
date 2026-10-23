import { useEffect, useState } from "react";
import { createGalleryEntry } from "../lib/utils.js";

const STORAGE_KEY = "photobooth-gallery";

function loadGallery() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(stored) ? stored : [];
  } catch (error) {
    console.warn("Could not load gallery from localStorage:", error);
    return [];
  }
}

export function usePhotoGallery() {
  const [gallery, setGallery] = useState(loadGallery);
  const [storageStatus, setStorageStatus] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(gallery));
      setStorageStatus("");
    } catch (error) {
      console.warn("Could not save gallery to localStorage:", error);
      setStorageStatus(
        "Browser storage is full — this photo won't survive a reload. Delete a snapshot to free space.",
      );
    }
  }, [gallery]);

  const addPhoto = (dataUrl, frame, layout = "single-horizontal") => {
    const photo = createGalleryEntry(dataUrl, frame, layout);
    setGallery((photos) => [photo, ...photos]);
    return photo;
  };

  const deletePhoto = (id) => {
    setGallery((photos) => photos.filter((photo) => photo.id !== id));
  };

  return { gallery, addPhoto, deletePhoto, storageStatus };
}
