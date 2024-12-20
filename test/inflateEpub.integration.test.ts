import { describe, expect, it } from "vitest";
import { inflateEpub } from "../src/utils/inflateEpub";

// samples/test_mimetype.epub
const epub =
  "data:application/epub+zip;base64,UEsDBBQAAAAAACWTklkAAAAAAAAAAAAAAAAOACAAdGVzdF9taW1ldHlwZS91eAsAAQToAwAABOgDAABVVA0AB7c9Y2fZPWNn2D1jZ1BLAwQUAAgACAA4aZBZAAAAAAAAAAAAAAAAFgAgAHRlc3RfbWltZXR5cGUvbWltZXR5cGV1eAsAAQToAwAABOgDAABVVA0AB81QYGexPWNnsT1jZ0ssKMjJTE4syczP008tKE3Srsos4AIAUEsHCDvR9u8XAAAAFQAAAFBLAQIUAxQAAAAAACWTklkAAAAAAAAAAAAAAAAOABgAAAAAAAAAAADtQQAAAAB0ZXN0X21pbWV0eXBlL3V4CwABBOgDAAAE6AMAAFVUBQABtz1jZ1BLAQIUAxQACAAIADhpkFk70fbvFwAAABUAAAAWABgAAAAAAAAAAACkgUwAAAB0ZXN0X21pbWV0eXBlL21pbWV0eXBldXgLAAEE6AMAAAToAwAAVVQFAAHNUGBnUEsFBgAAAAACAAIAsAAAAMcAAAAAAA==";

describe("inflateEpub", () => {
  it("should return a entry with the correct filename", async () => {
    const data = await fetch(epub);
    const blob = await data.blob();

    const entries = await inflateEpub(blob);
    const entry = entries[1];
    expect(entry["filename"]).toEqual("test_mimetype/mimetype");
  });

  it("should throw a errro if call with wrong parameter", async () => {
    expect(inflateEpub(null as unknown as Blob)).rejects.toThrow();
  });
});
