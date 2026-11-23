/** @format */

import { memo } from "react";
import { Modal } from "../utils/Modal";
import { LuInfo } from "react-icons/lu";
import { MdWarning } from "react-icons/md";
import { flattenedTreeStore } from "../../stores";

export const ReIndexModal = memo(({ showReIndexModal, setShowReIndexModal }: { showReIndexModal: boolean; setShowReIndexModal: React.Dispatch<React.SetStateAction<boolean>> }) => {
  const [flat] = flattenedTreeStore.use();

  return (
    <Modal open={showReIndexModal} setOpen={setShowReIndexModal} className="z-100 max-h-fit w-fit border-2 border-(--border-color)/20 bg-(--hover-color)/45 text-(--text-color)">
      <div className="flex flex-col">
        <div className="mb-3 text-xl">Are you sure about that ?</div>

        <div className="flex flex-row items-center gap-1.5 py-2 text-xs">
          <LuInfo className="text-(--accent-color)" />
          <div className="opacity-70">Indexes include metadata, thumbnails, lyrics, etc.</div>
        </div>
        <div className="flex flex-row items-center gap-1.5 text-xs">
          <LuInfo className="text-(--accent-color)" />
          <div className="opacity-70">Re-indexing will delete all indexes and rebuild them from scratch.</div>
        </div>

        <div className="w-md pt-3 align-middle text-xs">
          <MdWarning className="mr-1 mb-1 inline text-sm text-red-500" />
          <div className="inline opacity-70">Doing this will take quite a while and is not recommended if you have a large library unless you really know what you're doing or you really need to.</div>
        </div>

        <div className="mt-5 flex flex-row gap-4 text-xs font-semibold">
          <button
            onClick={async () => {
              await window.api.deleteMeta(flat.map(({ id }) => id));
              await window.api.deleteTree("mediaFolder");
              window.navigation.reload();
            }}
            className="w-full cursor-pointer rounded-md border-2 border-[#ff1116] bg-[#ff111622] pt-1 pb-1.5 text-[#ff3333] transition-all duration-150 active:scale-98"
          >
            Rebuild / Re-index library
          </button>
          <button
            onClick={() => setShowReIndexModal(false)}
            className="w-full cursor-pointer rounded-md border-2 border-[#31aa16] bg-[#31aa1622] pt-1 pb-1.5 text-[#31ee16] transition-all duration-150 active:scale-98"
          >
            Cancel operation
          </button>
        </div>
      </div>
    </Modal>
  );
});
