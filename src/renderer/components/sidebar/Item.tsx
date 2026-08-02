/** @format */

export type ItemProps = { icon: React.ReactNode; label: string; onClick: () => void; highlighted?: boolean };

export const Item = ({ icon, label, onClick, highlighted = false }: ItemProps) => {
  return (
    <div
      key={label}
      onClick={onClick}
      className={
        "group relative flex w-full shrink-0 cursor-pointer flex-row items-center gap-3 overflow-hidden rounded-sm p-1 transition-all duration-100 active:scale-96 " +
        (highlighted ? "" : "hover:bg-(--hover-color)/25")
      }
    >
      {highlighted && <div className="absolute inset-0 h-full w-full bg-(--accent-color) opacity-10 backdrop-blur-md" />}
      <div className={"z-1 h-full w-1 rounded-sm " + (highlighted ? "bg-(--accent-color)" : "group-hover:bg-(--accent-color)")} />
      <div className={"z-1 text-base " + (highlighted ? "" : "group-hover:text-(--accent-color)")} children={icon} />
      <div className="z-1 p-1 text-[13px]" children={label} />
    </div>
  );
};
