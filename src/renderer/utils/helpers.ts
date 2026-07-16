/** @format */

export function generateIndex(tracks: { title: string }[]) {
  return [
    { label: "#", status: true, index: 0 },
    ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((e) => {
      const index = tracks.findIndex((t) => t.title.toLowerCase().startsWith(e.toLowerCase()));
      return { label: e, status: index !== -1, index };
    }),
    { label: "...", status: true, index: tracks.findLastIndex((t) => t.title.toLowerCase().startsWith("z")) },
  ];
}
