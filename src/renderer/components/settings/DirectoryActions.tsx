/** @format */

import { memo } from "react";
import { LuLibrary } from "react-icons/lu";

export const DirectoryActions = memo(
  ({
    mediaFolder,
    setMediaFolder,
    setShowReIndexModal,
  }: {
    mediaFolder: string;
    setMediaFolder: React.Dispatch<React.SetStateAction<string>>;
    setShowReIndexModal: React.Dispatch<React.SetStateAction<boolean>>;
  }) => {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex flex-row items-center gap-1">
          <LuLibrary className="text-(--accent-color)" />
          <div className="text-sm font-medium">Directory and Indexing</div>
          <div className="text-xs opacity-70">( Changes will take effect after restarting the app )</div>
        </div>

        <div className="mb-1 flex scrollbar-none flex-row items-baseline gap-1 overflow-hidden text-sm text-nowrap">
          <div className="text-xs opacity-70">Currently using</div>
          <div className="min-w-0 truncate text-xs font-medium text-(--accent-color)">{mediaFolder}</div>
          <div className="text-xs opacity-70">as media folder.</div>
        </div>

        <div className="flex flex-row items-center gap-2">
          {[
            { label: "Change media folder", onClick: async () => setMediaFolder((await window.api.openFolderDialog()) || mediaFolder) },
            { label: "Refresh library ( index changes )", onClick: () => window.navigation.reload() },
            { label: "Rebuild library ( re-index everything )", onClick: () => setShowReIndexModal(true) },
          ].map(({ label, onClick }) => (
            <button
              key={label}
              children={label}
              onClick={onClick}
              className="flex h-fit w-fit cursor-pointer flex-row items-center justify-center gap-1 rounded-sm border-2 border-(--border-color)/15 bg-(--border-color)/10 px-2 pt-0.5 pb-1 text-xs text-nowrap backdrop-blur-2xl transition-all duration-100 hover:scale-105 active:scale-95"
            />
          ))}
        </div>
      </div>
    );
  },
);
