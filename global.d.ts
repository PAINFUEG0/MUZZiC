import { DirNode } from "./src/shared/types/utils";
import { Track } from "./src/shared/types/sourcePlugin";
import { extractMetadata, deleteMeta } from "./src/main/helpers/local";

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

      scan: (dir: string) => Promise<DirNode<true>>;

      getTree: (K: string) => Promise<DirNode<true> | null>;
      setTree: (K: string, V: DirNode<true>) => Promise<void>;

      extractMetadata: typeof extractMetadata;

      setMeta: <T extends string | { key: string; value: Track<true> }[]>(
        K: T,
        V?: T extends string ? Track<true> : never,
      ) => Promise<T extends string ? Track<true> : T>;
      deleteMeta: typeof deleteMeta;
      getMeta: <T extends string | string[]>(K: T) => Promise<T extends string ? Track<true> | null : (Track<true> | null)[]>;
    };
  }
}
