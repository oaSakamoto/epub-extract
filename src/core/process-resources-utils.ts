import { ParserTextFileResult, ProcessContainerResult } from "@/types";

export const parseTextFile = async (
  blob: Blob,
  mimetype: DOMParserSupportedType,
): Promise<ParserTextFileResult> => {
  try {
    const textFile = await blob.text();
    const parser = new DOMParser();

    const doc = parser.parseFromString(textFile, mimetype);
    const parserErrorElement = doc.querySelector("parsererror");
    if (parserErrorElement) {
      throw new Error(
        `Malformed XML: ${parserErrorElement.textContent?.slice(0, 100)}`,
      );
    }
    return { success: true, document: doc };
  } catch (error) {
    return {
      success: false,
      errorMessage: "Failed to parser the text File",
      error: error as Error,
    };
  }
};

export const processContainer = (
  containerParsed: Document,
): ProcessContainerResult => {
  const containerElement = containerParsed.documentElement;

  if (!containerElement || containerElement.nodeName !== "container") {
    return {
      success: false,
      errorMessage:
        "Missing root <container> element in META-INF/container.xml",
    };
  }

  const rootFilesElement = containerElement.querySelector("rootfiles");
  if (!rootFilesElement) {
    return {
      success: false,
      errorMessage: "Missing <rootfiles> element in META-INF/container.xml",
    };
  }
  const rootFileElements = rootFilesElement.children;

  if (rootFileElements.length === 0) {
    return {
      success: false,
      errorMessage:
        "Missing required < rootfile > element in META-INF/container.xml",
    };
  }

  if (rootFileElements.length > 1) {
    return {
      success: false,
      errorMessage: "Multiples rootfile found - only one supported",
    };
  }
  const rootFile = rootFileElements[0];
  const fullPath = rootFile.getAttribute("full-path");
  const mediaType = rootFile.getAttribute("media-type");

  if (!fullPath) {
    return {
      success: false,
      errorMessage: "rootfile missing required full-path attribute",
    };
  }
  if (!mediaType) {
    return {
      success: false,
      errorMessage: "rootfile missing required media-type attribute",
    };
  }

  return {
    success: true,
    content: { fullPath: fullPath, mediaType: mediaType },
  };
};
