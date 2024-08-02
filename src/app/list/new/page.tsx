"use client";

import { PlayCard } from "@/components/PlayCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  PiSpadeFill,
  PiHeartFill,
  PiClubFill,
  PiDiamondFill,
} from "react-icons/pi";
import { FaListUl } from "react-icons/fa6";

const ADD_NUMBERS = [1, 2, 3, 5, 10];

export default function Page() {
  const [hand, setHand] = useState(["s-1", "c-1"]);
  const [focus, setFocus] = useState<0 | 1>(0);

  const handleNumber = (value: number) => {
    const prevNumber = Number(hand[focus].split("-")[1]);
    const newHand = [...hand];
    newHand[focus] = hand[focus].replace(
      `${prevNumber}`,
      `${prevNumber + value}`,
    );
    setHand(newHand);
  };
  const handleSuit = (value: string) => {
    const prevSuit = hand[focus].split("-")[0];
    const newHand = [...hand];
    newHand[focus] = hand[focus].replace(`${prevSuit}`, value);
    setHand(newHand);
  };
  const handleSubmit = () => {
    if (focus === 0) {
      setFocus(1);
    } else {
      /* 保存 */
      setHand(["s-1", "c-1"]);
      setFocus(0);
    }
  };
  const handleClear = () => {
    setHand(["s-1", "c-1"]);
    setFocus(0);
  };

  return (
    <div className="flex h-full flex-col justify-between px-6 py-2">
      <div className="space-y-2">
        <div className="text-right">
          <Badge>UTG</Badge>
        </div>

        <div className="flex justify-center">
          <PlayCard value={hand[0]} size={120} focus={focus === 0} />
          <PlayCard value={hand[1]} size={120} focus={focus === 1} />
        </div>

        <div className="text-right">
          <Button
            variant="secondary"
            size="icon"
            className="flex-grow"
            onClick={() => handleSuit("s")}
          >
            <FaListUl size={24} />
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          <Button
            size="icon"
            className="flex-grow"
            onClick={() => handleSuit("s")}
          >
            <PiSpadeFill size={24} />
          </Button>
          <Button
            size="icon"
            className="flex-grow"
            onClick={() => handleSuit("c")}
          >
            <PiClubFill size={24} />
          </Button>
          <Button
            size="icon"
            className="flex-grow"
            onClick={() => handleSuit("h")}
          >
            <PiHeartFill size={24} />
          </Button>
          <Button
            size="icon"
            className="flex-grow"
            onClick={() => handleSuit("d")}
          >
            <PiDiamondFill size={24} />
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {ADD_NUMBERS.map((value) => (
            <Button
              key={value}
              className="flex-grow text-xl"
              onClick={() => handleNumber(value)}
            >
              +{value}
            </Button>
          ))}
        </div>

        <div className="flex gap-2">
          <Button
            className="flex-grow"
            variant="default"
            onClick={handleSubmit}
          >
            {focus === 0 ? "OK" : "NEXT"}
          </Button>
          <Button className="text-xl" onClick={handleClear}>
            C
          </Button>
        </div>
      </div>
    </div>
  );
}
