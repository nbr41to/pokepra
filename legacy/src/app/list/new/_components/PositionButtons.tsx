import { PositionBadge } from "@/components/PositionBadge";

type Props = {
  position: string;
  onClick: (position: string) => void;
};

export const PositionButtons = ({ position, onClick }: Props) => {
  return (
    <div className="flex justify-end gap-2">
      <PositionBadge
        position={position.startsWith("utg") ? position : "utg-0"}
        active={position.startsWith("utg")}
        onClick={() => onClick("utg-0")}
      />
      <PositionBadge
        position="lj"
        active={position === "lj"}
        onClick={() => onClick("lj")}
      />
      <PositionBadge
        position="hj"
        active={position === "hj"}
        onClick={() => onClick("hj")}
      />
      <PositionBadge
        position="co"
        active={position === "co"}
        onClick={() => onClick("co")}
      />
      <PositionBadge
        position="btn"
        active={position === "btn"}
        onClick={() => onClick("btn")}
      />
      <PositionBadge
        position="sb"
        active={position === "sb"}
        onClick={() => onClick("sb")}
      />
      <PositionBadge
        position="bb"
        active={position === "bb"}
        onClick={() => onClick("bb")}
      />
    </div>
  );
};
