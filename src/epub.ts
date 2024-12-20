import { ZipReader, BlobReader, Entry, BlobWriter } from "@zip.js/zip.js";

export class Epub {
  //mimetype: Blob | null = null
  private _entriesPromise: Promise<Entry[]>;
  private _entries: Entry[] | null = null;

  constructor(blob: Blob) {
    this._entriesPromise = this._inflateEpub(blob);

    this._entriesPromise.catch((error) => {
      console.error("Erro ao inicializar Epub:", error);
    });
  }
  public async getEntries() {
    try {
      if (!this._entries) {
        this._entries = await this._entriesPromise;
      }
      return this._entries;
    } catch (error) {
      console.error("Falhou ao recuperar entries");
      throw error;
    }
  }
  public async getEntryUrl(entry: Entry): Promise<string | undefined> {
    if (!entry.getData) {
      throw new Error("O entry não possui o método getData");
    }
    const data = await entry.getData(new BlobWriter());
    return URL.createObjectURL(data);
  }
  private async _inflateEpub(blob: Blob): Promise<Entry[]> {
    const zipReader = new ZipReader(new BlobReader(blob));
    //const entries = await zipReader.getEntries()
    console.log(zipReader.getEntries());
    return await zipReader.getEntries();
  }
}
