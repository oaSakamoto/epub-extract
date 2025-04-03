import { ZipReader } from "@zip.js/zip.js";

export interface DecompressEpub {
  decompressEpub(epub: Blob): Promise<DecompressEpubResult>;
}

export type EpubResourcesMap = Map<string, Blob>;

export type ValidationEpubResult =
  | { isValid: true }
  | { isValid: false; errorMessage: string };

export type OperationFailure = {
  sucess: false;
  errorMessage: string;
  error: Error;
};

export type DecompressEpubResult =
  | { sucess: true; epubResourcesMap: EpubResourcesMap }
  | OperationFailure;

export type CreateZipReaderResult =
  | { sucess: true; zipReader: ZipReader<Blob> }
  | OperationFailure;

export type CloseZipReaderResult = { sucess: true } | OperationFailure;

export type CreateEpubResourceMapResult =
  | { sucess: true; epubResourcesMap: EpubResourcesMap }
  | OperationFailure;
