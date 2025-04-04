/* v8 ignore start */
import { ZipReader } from "@zip.js/zip.js";

export interface DecompressEpub {
  decompressEpub(epub: Blob): Promise<DecompressEpubResult>;
}

export type ContentInfo = { fullPath: string; mediaType: string };

export type EpubResourcesMap = Map<string, Blob>;

export type ValidationEpubResult =
  | { isValid: true }
  | { isValid: false; errorMessage: string };

export type OperationFailure = {
  success: false;
  errorMessage: string;
  error: Error;
};

export type DecompressEpubResult =
  | { success: true; epubResourcesMap: EpubResourcesMap }
  | OperationFailure;

export type CreateZipReaderResult =
  | { success: true; zipReader: ZipReader<Blob> }
  | OperationFailure;

export type CloseZipReaderResult = { success: true } | OperationFailure;

export type CreateEpubResourceMapResult =
  | { success: true; epubResourcesMap: EpubResourcesMap }
  | OperationFailure;

export type ParserTextFileResult =
  | { success: true; document: Document }
  | OperationFailure;

export type ProcessContainerResult =
  | { success: true; content: ContentInfo }
  | { success: false; errorMessage: string };
