import { DecompressEpub, DecompressEpubResult } from "@/types";
import {
  closeZipReader,
  createEpubResourcesMap,
  createZipReader,
} from "@/adapters/decompress-utils";

export const decompressEpubAdapter: DecompressEpub = {
  async decompressEpub(epub: Blob): Promise<DecompressEpubResult> {
    const createZipReaderResult = createZipReader(epub);
    if (!createZipReaderResult.sucess) {
      const { error, errorMessage } = createZipReaderResult;
      return { sucess: false, errorMessage: errorMessage, error: error };
    }
    const { zipReader } = createZipReaderResult;

    const createEpubResourcesMapResult =
      await createEpubResourcesMap(zipReader);

    if (!createEpubResourcesMapResult.sucess) {
      const { error, errorMessage } = createEpubResourcesMapResult;
      return { sucess: false, errorMessage: errorMessage, error: error };
    }

    const closeZipReaderResult = await closeZipReader(
      createZipReaderResult.zipReader,
    );
    if (!closeZipReaderResult.sucess) {
      const { error, errorMessage } = closeZipReaderResult;
      return { sucess: false, errorMessage: errorMessage, error: error };
    }
    return {
      sucess: true,
      epubResourcesMap: createEpubResourcesMapResult.epubResourcesMap,
    };
  },
};
