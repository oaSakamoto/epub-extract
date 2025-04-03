import { beforeEach, describe, expect, it, vi } from "vitest";
import { BlobWriter, Entry, ZipReader } from "@zip.js/zip.js";
import fs from "node:fs";

describe("decompressAdapter", async () => {
  describe("createZipReader", async () => {
    const { createZipReader } = await import("@/adapters/decompress-utils");
    const mockBlob = new Blob(["dummy content"], {
      type: "application/epub+zip",
    });
    it("should successfully creates a ZipReader instance", () => {
      const createZipReaderResult = createZipReader(mockBlob);
      expect(createZipReaderResult.success).toBe(true);
      if (createZipReaderResult.success) {
        expect(createZipReaderResult.zipReader).toBeInstanceOf(ZipReader);
      }
    });
    it("should return a OperationFailure if fails to create a ZipReader instance ", () => {
      const createZipReaderResult = createZipReader(null as unknown as Blob);
      const { success } = createZipReaderResult;
      expect(success).toBe(false);
      if (!success) {
        const { errorMessage } = createZipReaderResult;
        expect(errorMessage).toBe("Failed to create ZIP Reader");
      }
    });
  });
  describe("closeZipReader", async () => {
    const { createZipReader, closeZipReader } = await import(
      "@/adapters/decompress-utils"
    );
    const mockBlob = new Blob(["dummy content"], {
      type: "application/epub+zip",
    });
    it("should successfully closes a ZipReader instance", async () => {
      const createZipReaderResult = createZipReader(mockBlob);
      let zipReader: null | ZipReader<Blob> = null;
      if (createZipReaderResult.success) {
        zipReader = createZipReaderResult.zipReader;
      }
      const closeZipReaderResult = await closeZipReader(
        zipReader as ZipReader<Blob>,
      );
      expect(closeZipReaderResult.success).toBe(true);
    });
    it("should return a OperationFailure if fails to close a ZipReader instance ", async () => {
      const zipReader = {
        close: () => {
          throw Error("Failed to close ZipReader Instance");
        },
      };

      const closeZipReaderResult = await closeZipReader(
        zipReader as unknown as ZipReader<Blob>,
      );
      const { success } = closeZipReaderResult;
      expect(success).toBe(false);
      if (!success) {
        const { errorMessage } = closeZipReaderResult;
        expect(errorMessage).toBe("Error closing Zip Reader");
      }
    });
  });
  describe("createEpubResourceMap", async () => {
    const { createEpubResourcesMap } = await import(
      "@/adapters/decompress-utils"
    );
    it("should successfully creates a EpubResourceMap instance", async () => {
      const mockEntryGenerator = (
        directory: boolean,
        filename: string,
        blob: Blob,
      ) => {
        return {
          directory: directory,
          filename: filename,
          getData: async (blobWriter: BlobWriter) => {
            if (blobWriter) return blob;
            return blob;
          },
        };
      };
      const expectedResult = new Map<string, Blob>();
      expectedResult.set("mimetype", new Blob(["application/epub+zip"]));
      expectedResult.set("META-INF/container.xml", new Blob(["container.xml"]));

      const zipReader = {
        getEntries: () => {
          return [
            mockEntryGenerator(true, "META-INF/", new Blob([""])) as Entry,
            mockEntryGenerator(
              false,
              "mimetype",
              new Blob(["application/epub+zip"]),
            ) as Entry,
            mockEntryGenerator(
              false,
              "META-INF/container.xml",
              new Blob(["container.xml"]),
            ) as Entry,
          ];
        },
      };
      const createEpubResourcesMapResult = await createEpubResourcesMap(
        zipReader as unknown as ZipReader<Blob>,
      );
      const { success } = createEpubResourcesMapResult;
      if (success) {
        const { epubResourcesMap } = createEpubResourcesMapResult;
        expect(epubResourcesMap).toEqual(expectedResult);
      }
    });
    it("should return a OperationFailure if fails to create a EpubResourcesMap", async () => {
      const createEpubResourcesMapResult = await createEpubResourcesMap(
        null as unknown as ZipReader<Blob>,
      );
      const { success } = createEpubResourcesMapResult;
      expect(success).toBe(false);
      if (!success) {
        const { errorMessage } = createEpubResourcesMapResult;
        expect(errorMessage).toBe("Failed to create Epub Resources Map");
      }
    });
  });
  describe("decompressEpub", () => {
    beforeEach(async () => {
      vi.unmock("@/adapters/decompress-utils");
      vi.unmock("@/adapters/decompress");
      vi.resetModules();
    });
    it("should return a EpubResourcesMap successfully", async () => {
      const epubFilePath = "./test/fixtures/epub-test.epub";

      const epubBuffer = fs.readFileSync(epubFilePath);
      const epubBlob = new Blob([epubBuffer], { type: "application/epub+zip" });

      const { decompressEpubAdapter } = await import("@/adapters/decompress");
      const decompressEpubResult =
        await decompressEpubAdapter.decompressEpub(epubBlob);
      const { success } = decompressEpubResult;
      expect(success).toBe(true);
      if (success) {
        const { epubResourcesMap } = decompressEpubResult;
        expect(epubResourcesMap.has("META-INF/container.xml")).toBe(true);
        expect(epubResourcesMap.has("mimetype")).toBe(true);
        expect(await epubResourcesMap.get("mimetype")?.text()).toBe(
          "application/epub+zip",
        );
      }
    });

    it("should return a OperationFail if createZipReader Fails", async () => {
      vi.doMock("@/adapters/decompress-utils", async () => {
        const actual = await vi.importActual("@/adapters/decompress-utils");
        return {
          ...actual,
          createZipReader: vi.fn(() => {
            return {
              sucess: false,
              errorMessage: "Failed to create ZIP Reader",
              error: new Error("error"),
            };
          }),
        };
      });

      const { createZipReader } = await import("@/adapters/decompress-utils");
      const { decompressEpubAdapter } = await import("@/adapters/decompress");

      const decompressEpubResult = await decompressEpubAdapter.decompressEpub(
        new Blob([""]),
      );
      expect(createZipReader).toHaveBeenCalled();
      const { success } = decompressEpubResult;
      expect(success).toBe(false);
      if (!success) {
        const { errorMessage } = decompressEpubResult;
        expect(errorMessage).toBe("Failed to create ZIP Reader");
      }
    });

    it("should return a OperationFail if closeZipReader fails", async () => {
      vi.doMock("@/adapters/decompress-utils", async () => {
        const actual = await vi.importActual("@/adapters/decompress-utils");
        return {
          ...actual,
          closeZipReader: vi.fn(() => {
            return {
              sucess: false,
              errorMessage: "Error closing Zip Reader",
              error: new Error("error"),
            };
          }),
        };
      });
      const epubFilePath = "./test/fixtures/epub-test.epub";

      const epubBuffer = fs.readFileSync(epubFilePath);
      const epubBlob = new Blob([epubBuffer], { type: "application/epub+zip" });

      const { closeZipReader } = await import("@/adapters/decompress-utils");

      const { decompressEpubAdapter } = await import("@/adapters/decompress");

      const decompressEpubResult =
        await decompressEpubAdapter.decompressEpub(epubBlob);
      expect(closeZipReader).toHaveBeenCalled();
      const { success } = decompressEpubResult;
      expect(success).toBe(false);
      if (!success) {
        const { errorMessage } = decompressEpubResult;
        expect(errorMessage).toBe("Error closing Zip Reader");
      }
    });

    it("should return a OperationFail if createEpubResoucersMap fails", async () => {
      vi.doMock("@/adapters/decompress-utils", async () => {
        const actual = await vi.importActual("@/adapters/decompress-utils");
        return {
          ...actual,
          createEpubResourcesMap: vi.fn(() => {
            return {
              sucess: false,
              errorMessage: "Failed to create Epub Resources Map",
              error: new Error("error"),
            };
          }),
        };
      });

      const { createEpubResourcesMap } = await import(
        "@/adapters/decompress-utils"
      );
      const { decompressEpubAdapter } = await import("@/adapters/decompress");

      const decompressEpubResult = await decompressEpubAdapter.decompressEpub(
        new Blob([""]),
      );
      expect(createEpubResourcesMap).toHaveBeenCalled();
      const { success } = decompressEpubResult;
      expect(success).toBe(false);
      if (!success) {
        const { errorMessage } = decompressEpubResult;
        expect(errorMessage).toBe("Failed to create Epub Resources Map");
      }
    });
  });
});
