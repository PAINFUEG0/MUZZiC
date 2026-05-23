export type Message = { op: "status"; data: string };

export type Prettify<T> = { [K in keyof T]: T[K] } & {};

export type File<T extends boolean = false> = { path: string; name: string } & (T extends true ? { id: string } : {});

export type DirNode<T extends boolean = false> = { name: string; path: string; files: File<T>[]; dirs: DirNode<T>[] };
