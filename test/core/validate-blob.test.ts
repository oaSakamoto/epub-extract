import { epubBlobIsValid } from "@/core/validate-blob";
import { describe, expect, it } from "vitest";

describe("epubBlobIsValid", () => {
  it("should return ValidationEpubResult with isValid true if the epub blob is valid", () => {
    const result = epubBlobIsValid(
      new Blob(["valid epub blob"], { type: "application/epub+zip" }),
    );
    const { isValid } = result;
    expect(isValid).toBe(true);
  });

  it("should return a error message if a EPUB file is not provided", () => {
    const result = epubBlobIsValid(null as unknown as Blob);
    const { isValid } = result;
    expect(isValid).toBe(false);
    if (!isValid) {
      const { errorMessage } = result;
      expect(errorMessage).toBe("No EPUB file provided");
    }
  });

  it("should return a error message if a EPUB file is not a blob", () => {
    const result = epubBlobIsValid("is not a blob" as unknown as Blob);
    const { isValid } = result;
    expect(isValid).toBe(false);
    if (!isValid) {
      const { errorMessage } = result;
      expect(errorMessage).toBe("Invalid input - must be a blob object");
    }
  });
  it("should return a error message if the type is not application/epub+zip", () => {
    const result = epubBlobIsValid(
      new Blob(["blob with incorrect type"], { type: "text/plain" }),
    );
    const { isValid } = result;
    expect(isValid).toBe(false);
    if (!isValid) {
      const { errorMessage } = result;
      expect(errorMessage).toBe("Invalid input - must be a EPUB file");
    }
  });
  it("should return an error message if the size is less than 1", () => {
    const result = epubBlobIsValid(
      new Blob([""], { type: "application/epub+zip" }),
    );
    const { isValid } = result;
    expect(isValid).toBe(false);
    if (!isValid) {
      const { errorMessage } = result;
      expect(errorMessage).toBe("Invalid input - EPUB file is empty");
    }
  });
});
