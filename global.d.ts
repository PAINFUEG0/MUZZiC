import { DirNode } from "./src/shared/types/utils";

export {};

declare global {
  interface Window {
    api: {
      getPort: () => Promise<string>;

      checkDLP: () => Promise<boolean>;
      downloadDLP: () => Promise<void>;

      checkFFMPEG: () => Promise<boolean>;
      downloadFFMPEG: () => Promise<void>;

      checkFFPROBE: () => Promise<boolean>;
      downloadFFPROBE: () => Promise<void>;

      getMediaFolder: () => Promise<string | null>;
      setMediaFolder: (dir: string) => Promise<void>;

      openFolderDialog: () => Promise<string | null>;

      list: () => Promise<DirNode<true>>;
    };
  }
}
