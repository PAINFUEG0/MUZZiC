/** @format */

import { memo } from "react";
import { Track } from "../../shared/types";

export const TrackInfo = memo(({ track }: { track: Track }) => {
  return <div className="flex h-full w-full flex-col overflow-hidden">{track.name}</div>;
});
