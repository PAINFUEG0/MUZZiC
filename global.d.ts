import * as bin from "./src/main/helpers/binaries";
import * as local from "./src/main/helpers/local";
import * as settings from "./src/main/helpers/settings";

export {};

declare global {
  interface Window {
    api: {
      getPort: () => Promise<string>;

      checkDLP: typeof bin.checkDLP;
      downloadDLP: typeof bin.downloadDLP;

      checkFFMPEG: typeof bin.checkFFMPEG;
      downloadFFMPEG: typeof bin.downloadFFMPEG;

      checkFFPROBE: typeof bin.checkFFPROBE;
      downloadFFPROBE: typeof bin.downloadFFPROBE;

      getMediaFolder: typeof settings.getMediaFolder;
      setMediaFolder: typeof settings.setMediaFolder;

      openFolderDialog: () => Promise<string | null>;

      scan: typeof local.scan;

      getTree: typeof local.getTree;
      setTree: typeof local.setTree;

      extractMetadata: typeof local.extractMetadata;

      getMeta: typeof local.getMeta;
      setMeta: typeof local.setMeta;
      deleteMeta: typeof local.deleteMeta;
    };
  }
}
