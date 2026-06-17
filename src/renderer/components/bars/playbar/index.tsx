/** @format */

export function Playbar() {
  return (
    <div className="flex h-20 w-full shrink-0 border-t-2 border-white/10 bg-linear-to-b from-black/40 to-black/20 backdrop-blur-md">
      <div className="flex aspect-square h-full shrink-0 p-2">
        <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-md bg-white/40">
          <img src="./logo.png" className="h-full w-full object-cover" />
        </div>
      </div>
    </div>
  );
}
