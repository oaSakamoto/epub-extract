import { DecompressEpub } from "@/types";
import { parseTextFile, processContainer } from "./process-resources-utils";

export const processResources = async (
  epub: Blob,
  decompressEpub: DecompressEpub,
) => {
  const result = await decompressEpub.decompressEpub(epub);
  if (!result.success) {
    const { errorMessage, error, success } = result;
    return { success: success, errorMessage: errorMessage, error: error };
  }
  const { epubResourcesMap } = result;
  const parseResult = await parseTextFile(
    epubResourcesMap.get("META-INF/container.xml") as Blob,
    "text/xml",
  );
  if (!parseResult.success) {
    const { errorMessage, error } = parseResult;
    return { success: false, errorMessage: errorMessage, error: error };
  }
  const { document: containerParsed } = parseResult;

  const processContainerResult = processContainer(containerParsed);
  if (!processContainerResult.success) {
    const { errorMessage } = processContainerResult;
    return { success: false, errorMessage };
  }
  return { success: true };
};
