import { useEffect, useState } from "react";
import { createGalleryEntry } from "../utils.js";

const STORAGE_KEY = "photobooth-gallery";

function loadGallery() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch (error) {
    console.warn("Could not load gallery from localStorage:", error);
    return [];
  }
}

export function usePhotoGallery() {
  const [gallery, setGallery] = useState(loadGallery);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(gallery));
    } catch (error) {
      console.warn("Could not save gallery to localStorage:", error);
    }
  }, [gallery]);

  const addPhoto = (dataUrl, frame) => {
    const photo = createGalleryEntry(dataUrl, frame);
    setGallery((photos) => [photo, ...photos]);
    return photo;
  };

  const deletePhoto = (id) => {
    setGallery((photos) => photos.filter((photo) => photo.id !== id));
  };

  return { gallery, addPhoto, deletePhoto };
}
