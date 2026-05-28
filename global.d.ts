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

      list: () => Promise<DirNode<true>>;
    };
  }
}
