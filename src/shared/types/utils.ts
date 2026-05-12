export type Prettify<T> = { [K in keyof T]: T[K] } & {};

export type File = { path: string; name: string; id: string };

export type DirNode = { name: string; path: string; files: File[]; dirs: DirNode[] };
