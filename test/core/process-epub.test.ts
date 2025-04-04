import { processResources } from "@/core/process-resources";
import { describe, expect, it } from "vitest";

import fs from "node:fs";
import decompressEpubAdapter from "@/adapters";
import {
  parseTextFile,
  processContainer,
} from "@/core/process-resources-utils";
import {
  DecompressEpub,
  DecompressEpubResult,
  EpubResourcesMap,
} from "@/types";

describe("processEpub", () => {
  const createContainerDocument = async (fileText: string) => {
    const blob = new Blob([fileText], { type: "text/xml" });
    const result = await parseTextFile(
      blob,
      blob.type as DOMParserSupportedType,
    );

    if (result.success) return result.document;
    return;
  };

  const epubResourcesMapFail: EpubResourcesMap = new Map<string, Blob>();
  epubResourcesMapFail.set(
    "META-INF/container.xml",
    new Blob(["container><rootfiles></rootfiles></container>"], {
      type: "text/xml",
    }),
  );
  epubResourcesMapFail.set(
    "mimetype",
    new Blob(["application/epub+zip"], { type: "text/xml" }),
  );

  const decompressEpubSuccessFail: DecompressEpub = {
    decompressEpub: async (): Promise<DecompressEpubResult> => {
      return {
        success: true,
        epubResourcesMap: epubResourcesMapFail,
      };
    },
  };

  const epubResourcesMap: EpubResourcesMap = new Map<string, Blob>();
  epubResourcesMap.set(
    "META-INF/container.xml",
    new Blob(["<container><rootfiles></rootfiles></container>"], {
      type: "text/xml",
    }),
  );
  epubResourcesMap.set(
    "mimetype",
    new Blob(["application/epub+zip"], { type: "text/xml" }),
  );

  const decompressEpubSuccess: DecompressEpub = {
    decompressEpub: async (): Promise<DecompressEpubResult> => {
      return {
        success: true,
        epubResourcesMap: epubResourcesMap,
      };
    },
  };

  const decompressEpubError: DecompressEpub = {
    decompressEpub: async (): Promise<DecompressEpubResult> => {
      return {
        success: false,
        errorMessage: "Failed to create EpubResourcesMap",
        error: new Error(`Error`),
      };
    },
  };

  describe("processResources", () => {
    it("should process the epubResourcesMap", async () => {
      const epubFilePath = "./test/fixtures/epub-test.epub";

      const epubBuffer = fs.readFileSync(epubFilePath);
      const epubBlob = new Blob([epubBuffer], { type: "application/epub+zip" });

      const result = await processResources(epubBlob, decompressEpubAdapter);
      const { success } = result;
      expect(success).toBe(true);
    });
    it("should return a error message if decompressEpub fails", async () => {
      const epubBlob = new Blob(["blob"]);

      const result = await processResources(epubBlob, decompressEpubError);
      const { success } = result;
      expect(success).toBe(false);
      if (!success) {
        const { errorMessage } = result;
        expect(errorMessage).toBe("Failed to create EpubResourcesMap");
      }
    });
    it("should return a error message if parseTextFile fails", async () => {
      const result = await processResources(
        new Blob(["mockBlob"], { type: "application/epub+zip" }),
        decompressEpubSuccessFail,
      );
      const { success } = result;
      expect(success).toBe(false);
      if (!success) {
        const { errorMessage } = result;
        expect(errorMessage).toBe("Failed to parser the text File");
      }
    });
    it("should return a error message if processContainer fails", async () => {
      const result = await processResources(
        new Blob(["mockBlob"], { type: "application/epub+zip" }),
        decompressEpubSuccess,
      );
      const { success } = result;
      expect(success).toBe(false);
      if (!success) {
        const { errorMessage } = result;
        expect(errorMessage).toBe(
          "Missing required < rootfile > element in META-INF/container.xml",
        );
      }
    });
  });
  describe("parseTextFile", () => {
    it("should succesfully parse a string and return a document", async () => {
      const fileText = "<container><rootfiles></rootfiles></container>";
      const blob = new Blob([fileText], { type: "text/xml" });
      const result = await parseTextFile(
        blob,
        blob.type as DOMParserSupportedType,
      );

      const { success } = result;
      expect(success).toBe(true);
      if (success) {
        const { document } = result;
        expect(document).toBeInstanceOf(XMLDocument);
      }
    });
    it("should return a error message if parser XML failed", async () => {
      const fileText = "container><rootfiles></rootfiles></container>";
      const blob = new Blob([fileText], { type: "text/xml" });
      const result = await parseTextFile(
        blob,
        blob.type as DOMParserSupportedType,
      );

      const { success } = result;
      expect(success).toBe(false);
      if (!success) {
        const { errorMessage } = result;
        expect(errorMessage).toBe("Failed to parser the text File");
      }
    });
  });
  describe("processContainer", () => {
    it("should successfully return an valid ContentInfo", async () => {
      const container = await createContainerDocument(
        `<container><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml" ></rootfile></rootfiles></container>`,
      );
      const processContainerResult = processContainer(container as Document);
      expect(processContainerResult.success).toBe(true);
      if (processContainerResult.success) {
        expect(processContainerResult.content.fullPath).toBe(
          "OEBPS/content.opf",
        );
        expect(processContainerResult.content.mediaType).toBe(
          "application/oebps-package+xml",
        );
      }
    });
    it("should return error message if container.xml not have container element", async () => {
      const container = await createContainerDocument("<invalid></invalid>");
      const processContainerResult = processContainer(container as Document);
      expect(processContainerResult.success).toBe(false);
      if (!processContainerResult.success) {
        expect(processContainerResult.errorMessage).toBe(
          "Missing root <container> element in META-INF/container.xml",
        );
      }
    });
    it("should return error message if container element not have rootfiles element", async () => {
      const container = await createContainerDocument(
        `<container><invalid></invalid></container>`,
      );
      const processContainerResult = processContainer(container as Document);
      expect(processContainerResult.success).toBe(false);
      if (!processContainerResult.success) {
        expect(processContainerResult.errorMessage).toBe(
          "Missing <rootfiles> element in META-INF/container.xml",
        );
      }
    });
    it("should return error message if container element not have rootfile element", async () => {
      const container = await createContainerDocument(
        `<container><rootfiles></rootfiles></container>`,
      );
      const processContainerResult = processContainer(container as Document);
      expect(processContainerResult.success).toBe(false);
      if (!processContainerResult.success) {
        expect(processContainerResult.errorMessage).toBe(
          "Missing required < rootfile > element in META-INF/container.xml",
        );
      }
    });
    it("should return error message if container element have mutiples rootfiles elements", async () => {
      const container = await createContainerDocument(
        `<container><rootfiles><rootfile></rootfile><rootfile></rootfile></rootfiles></container>`,
      );
      const processContainerResult = processContainer(container as Document);
      expect(processContainerResult.success).toBe(false);
      if (!processContainerResult.success) {
        expect(processContainerResult.errorMessage).toBe(
          "Multiples rootfile found - only one supported",
        );
      }
    });
    it("should return error message if rootfile element dont have full-path attribute", async () => {
      const container = await createContainerDocument(
        `<container><rootfiles><rootfile media-type="application/oebps-package+xml" ></rootfile></rootfiles></container>`,
      );
      const processContainerResult = processContainer(container as Document);
      expect(processContainerResult.success).toBe(false);
      if (!processContainerResult.success) {
        expect(processContainerResult.errorMessage).toBe(
          "rootfile missing required full-path attribute",
        );
      }
    });
    it("should return error message if rootfile element dont have media-type attribute", async () => {
      const container = await createContainerDocument(
        `<container><rootfiles><rootfile full-path="OEBPS/content.opf"></rootfile></rootfiles></container>`,
      );
      const processContainerResult = processContainer(container as Document);
      expect(processContainerResult.success).toBe(false);
      if (!processContainerResult.success) {
        expect(processContainerResult.errorMessage).toBe(
          "rootfile missing required media-type attribute",
        );
      }
    });
  });
});
