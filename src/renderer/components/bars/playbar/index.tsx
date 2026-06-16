/** @format */

export function Playbar() {
  return (
    <div className="flex h-20 w-full shrink-0 border-t">
      <div className="flex aspect-square h-full shrink-0 p-1">
        <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-md border">
          <img src="./logo.png" className="h-full w-full object-cover" />
        </div>
      </div>
    </div>
  );
}
