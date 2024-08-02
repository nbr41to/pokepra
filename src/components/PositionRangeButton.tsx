"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
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
          <div>
            <Image
              src={`/${position.split("-")[0]}.png`}
              width={500}
              height={400}
              alt={`range-${position}`}
            />
          </div>
          <DialogDescription>Case: 6 players / 100BB</DialogDescription>
        </DialogContent>
      </Dialog>
    </>
  );
};