import { ValidationEpubResult } from "@/types";

export const epubBlobIsValid = (epub: Blob): ValidationEpubResult => {
  if (!epub) {
    return { isValid: false, errorMessage: "No EPUB file provided" };
  }
  if (!(epub instanceof Blob)) {
    return {
      isValid: false,
      errorMessage: "Invalid input - must be a blob object",
    };
  }
  if (!(epub.type === "application/epub+zip")) {
    return {
      isValid: false,
      errorMessage: "Invalid input - must be a EPUB file",
    };
  }
  if (epub.size < 1) {
    return {
      isValid: false,
      errorMessage: "Invalid input - EPUB file is empty",
    };
  }
  return { isValid: true };
};
