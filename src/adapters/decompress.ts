import { DecompressEpub, DecompressEpubResult } from "@/types";
import {
  closeZipReader,
  createEpubResourcesMap,
  createZipReader,
} from "@/adapters/decompress-utils";

export const decompressEpubAdapter: DecompressEpub = {
  async decompressEpub(epub: Blob): Promise<DecompressEpubResult> {
    const createZipReaderResult = createZipReader(epub);
    if (!createZipReaderResult.success) {
      const { error, errorMessage } = createZipReaderResult;
      return { success: false, errorMessage: errorMessage, error: error };
    }
    const { zipReader } = createZipReaderResult;

    const createEpubResourcesMapResult =
      await createEpubResourcesMap(zipReader);

    if (!createEpubResourcesMapResult.success) {
      const { error, errorMessage } = createEpubResourcesMapResult;
      return { success: false, errorMessage: errorMessage, error: error };
    }

    const closeZipReaderResult = await closeZipReader(
      createZipReaderResult.zipReader,
    );
    if (!closeZipReaderResult.success) {
      const { error, errorMessage } = closeZipReaderResult;
      return { success: false, errorMessage: errorMessage, error: error };
    }
    return {
      success: true,
      epubResourcesMap: createEpubResourcesMapResult.epubResourcesMap,
    };
  },
};
