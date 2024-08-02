"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PositionBadge } from "./PositionBadge";
import Image from "next/image";

const EXISTING_RANGE_IMAGE_POSITIONS = ["utg", "co", "btn", "sb"];
type Props = {
  position: string;
};
export const PositionRangeButton = ({ position }: Props) => {
  return (
    <>
      <Dialog>
        <DialogTrigger
          disabled={
            !EXISTING_RANGE_IMAGE_POSITIONS.includes(position.split("-")[0])
          }
        >
          <PositionBadge position={position} />
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Range</DialogTitle>
          <div>
            <Image
              src={`/range-${position.split("-")[0]}.webp`}
              width={500}
              height={400}
              alt={`range-${position}`}
              unoptimized
            />
          </div>
          <DialogDescription>Case: 6 players / 100BB</DialogDescription>
        </DialogContent>
      </Dialog>
    </>
  );
};
