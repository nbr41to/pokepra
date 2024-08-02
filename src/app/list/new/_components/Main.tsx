"use client";

import { RxReset } from "react-icons/rx";
import { PlayCard } from "@/components/PlayCard";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  PiSpadeFill,
  PiHeartFill,
  PiClubFill,
  PiDiamondFill,
} from "react-icons/pi";
import { addHand } from "@/utils/records";
import { TodayListView } from "./TodayListView";
import { toast } from "sonner";
import { PositionBadge } from "@/components/PositionBadge";
import { cn } from "@/utils/classNames";

const ADD_NUMBERS = [1, 2, 3, 5, 10];

type Props = {
  hands: Hand[];
};
export function Main({ hands }: Props) {
  const [position, setPosition] = useState("utg-0");
  const [hand, setHand] = useState<[string, string]>(["s-1", "s-1"]);
  const [focus, setFocus] = useState<0 | 1>(0);

  const handlePosition = (value: string) => {
    if (position.startsWith("utg") && value === "utg-0") {
      const prevNumber = Number(position.split("-")[1]);
      const newNumber = prevNumber === 3 ? 0 : prevNumber + 1;
      setPosition(`utg-${newNumber}`);
    } else {
      setPosition(value);
    }
  };

  const handleNumber = (value: number) => {
    const newHand: [string, string] = [...hand];
    newHand[focus] = hand[focus].replace(/-\d+/, `-${value}`);
    setHand(newHand);
  };
  const handleAddNumber = (value: number) => {
    const prevNumber = Number(hand[focus].split("-")[1]);
    const newHand: [string, string] = [...hand];
    newHand[focus] = hand[focus].replace(
      `${prevNumber}`,
      `${prevNumber + value > 13 ? 13 : prevNumber + value}`,
    );
    setHand(newHand);
  };
  const handleSuit = (value: string) => {
    const prevSuit = hand[focus].split("-")[0];
    const newHand: [string, string] = [...hand];
    newHand[focus] = hand[focus].replace(`${prevSuit}`, value);
    setHand(newHand);
  };
  const handleSubmit = async (isJoin?: boolean) => {
    if (focus === 0) {
      setFocus(1);
    } else if (typeof isJoin !== "undefined") {
      {
        const ok = await addHand({
          position,
          isJoin,
          preflop: hand,
          flop: null,
          turn: null,
          river: null,
        });
        if (ok) {
          setHand(["s-1", "c-1"]);
          setFocus(0);
          toast.success("Save success!!");
        } else {
          toast.error("Save failed");
        }
      }
    }
  };
  const handleClear = () => {
    setHand(["s-1", "s-1"]);
    setFocus(0);
  };

  return (
    <div className="flex h-full flex-col justify-between px-6 py-4">
      <div className="space-y-4">
        <div className="flex justify-end gap-2">
          <PositionBadge
            position={position.startsWith("utg") ? position : "utg-0"}
            active={position.startsWith("utg")}
            onClick={() => handlePosition("utg-0")}
          />
          <PositionBadge
            position="lj"
            active={position === "lj"}
            onClick={() => handlePosition("lj")}
          />
          <PositionBadge
            position="hj"
            active={position === "hj"}
            onClick={() => handlePosition("hj")}
          />
          <PositionBadge
            position="co"
            active={position === "co"}
            onClick={() => handlePosition("co")}
          />
          <PositionBadge
            position="btn"
            active={position === "btn"}
            onClick={() => handlePosition("btn")}
          />
          <PositionBadge
            position="sb"
            active={position === "sb"}
            onClick={() => handlePosition("sb")}
          />
          <PositionBadge
            position="bb"
            active={position === "bb"}
            onClick={() => handlePosition("bb")}
          />
        </div>

        <div className="flex justify-center">
          <PlayCard value={hand[0]} size={120} focus={focus === 0} />
          <PlayCard value={hand[1]} size={120} focus={focus === 1} />
        </div>

        <div className="text-right">
          <TodayListView hands={hands} />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="icon"
            className={cn(
              "flex-grow",
              hand[focus].startsWith("s") &&
                "outline outline-2 outline-slate-400",
            )}
            onClick={() => handleSuit("s")}
          >
            <PiSpadeFill className="fill-blue-500" size={24} />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className={cn(
              "flex-grow",
              hand[focus].startsWith("c") &&
                "outline outline-2 outline-slate-400",
            )}
            onClick={() => handleSuit("c")}
          >
            <PiClubFill className="fill-green-500" size={24} />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className={cn(
              "flex-grow",
              hand[focus].startsWith("h") &&
                "outline outline-2 outline-slate-400",
            )}
            onClick={() => handleSuit("h")}
          >
            <PiHeartFill className="fill-red-500" size={24} />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className={cn(
              "flex-grow",
              hand[focus].startsWith("d") &&
                "outline outline-2 outline-slate-400",
            )}
            onClick={() => handleSuit("d")}
          >
            <PiDiamondFill className="fill-orange-500" size={24} />
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {ADD_NUMBERS.map((value) => (
            <Button
              key={value}
              className="flex-grow text-xl"
              onClick={() => handleAddNumber(value)}
            >
              +{value}
            </Button>
          ))}
        </div>

        <div className="flex gap-2">
          {focus === 0 ? (
            <Button
              className="flex-grow"
              variant="outline"
              onClick={() => handleSubmit()}
            >
              NEXT
            </Button>
          ) : (
            <>
              <Button
                className="flex-grow"
                variant="outline"
                onClick={() => handleSubmit(true)}
              >
                JOIN
              </Button>
              <Button
                className="flex-grow"
                variant="outline"
                onClick={() => handleSubmit(false)}
              >
                FOLD
              </Button>
            </>
          )}
          <Button variant="outline" onClick={handleClear}>
            <RxReset size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
}
