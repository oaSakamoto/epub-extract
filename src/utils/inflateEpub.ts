import { BlobReader, ZipReader } from "@zip.js/zip.js";

export const inflateEpub = async (blob: Blob) => {
  try {
    const zipReader = new ZipReader(new BlobReader(blob));
    const entries = await zipReader.getEntries();

    await zipReader.close();

    return entries;
  } catch (error) {
    console.error("Error on inflate the epub file:", error);
    throw error;
  }
};
