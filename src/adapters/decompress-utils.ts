import {
  CloseZipReaderResult,
  CreateEpubResourceMapResult,
  CreateZipReaderResult,
  EpubResourcesMap,
} from "@/types";
import { BlobReader, BlobWriter, Entry, ZipReader } from "@zip.js/zip.js";

export const createZipReader = (epub: Blob): CreateZipReaderResult => {
  try {
    const blobReader = new BlobReader(epub);
    const zipReader = new ZipReader(blobReader);
    return { success: true, zipReader: zipReader };
  } catch (error) {
    return {
      success: false,
      errorMessage: "Failed to create ZIP Reader",
      error: error as Error,
    };
  }
};

export const closeZipReader = async (
  zipReader: ZipReader<Blob>,
): Promise<CloseZipReaderResult> => {
  try {
    await zipReader.close();
    return { success: true };
  } catch (error) {
    return {
      success: false,
      errorMessage: "Error closing Zip Reader",
      error: error as Error,
    };
  }
};

export const createEpubResourcesMap = async (
  zipReader: ZipReader<Blob>,
): Promise<CreateEpubResourceMapResult> => {
  try {
    const epubResourcesMap: EpubResourcesMap = new Map<string, Blob>();
    const entries: Entry[] = await zipReader.getEntries();
    for (const entry of entries) {
      if (!entry.directory) {
        const blob: Blob = await entry.getData!(new BlobWriter());
        epubResourcesMap.set(entry.filename, blob);
      }
    }
    return { success: true, epubResourcesMap };
  } catch (error) {
    return {
      success: false,
      errorMessage: "Failed to create Epub Resources Map",
      error: error as Error,
    };
  }
};
