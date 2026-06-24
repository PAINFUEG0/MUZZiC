/** @format */

import { Track } from "./src/shared/types/sourcePlugin";
import { DirNode, File } from "./src/shared/types/utils";

export {};

declare global {
  const MAIN_WINDOW_VITE_NAME: string;
  const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;

  interface Window {
    api: {
      close: () => Promise<void>;
      minimize: () => Promise<void>;
      fullscreen: () => Promise<void>;

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

      scan: (dir: string) => Promise<DirNode>;

      getTree: (K: string) => Promise<DirNode | null>;
      setTree: (K: string, V: DirNode) => Promise<DirNode>;

      extractMetadata: (flat: File[]) => Promise<{ key: string; value: Track }[]>;

      deleteMeta: <T extends string | string[], R extends boolean>(K: T) => Promise<T extends string ? R : R[]>;
      getMeta: <T extends string | string[], R extends Track | null>(K: T) => Promise<T extends string ? R : R[]>;
      setMeta: <T extends [string, Track] | [{ key: string; value: Track }[]], R extends ReturnType<(typeof meta)["set"]>>(
        ...args: T
      ) => Promise<T extends [string, Track] ? R : R[]>;
    };
  }
}
