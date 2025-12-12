"use client";

import { RxReset } from "react-icons/rx";
import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useMemo, useState } from "react";
import { addHand } from "@/utils/records";
import { TodayListView } from "./TodayListView";
import { toast } from "sonner";
import { NumberButtons } from "./NumberButtons";
import { PositionButtons } from "./PositionButtons";
import { PeopleCounter } from "./PeopleCounter";
import { calcPosition } from "@/utils/calcPosition";
import { IsSuitedButtons } from "./IsSuitedButtons";
import { toHandString } from "@/utils/toHandString";

type Props = {
  hands: Hand[];
};
export function Main({ hands }: Props) {
  const currentPeople = hands[hands.length - 1]?.people || 2;

  const [position, setPosition] = useState("utg-0");
  const [people, setPeople] = useState(currentPeople);
  const [hand, setHand] = useState<[number, number, boolean]>([0, 0, false]);

  /* スクロールイベントを抑制 */
  useEffect(() => {
    const handleScroll = (e: Event) => {
      e.preventDefault();
    };
    document.addEventListener("touchmove", handleScroll, { passive: false });
    return () => {
      document.removeEventListener("wheel", handleScroll);
      document.removeEventListener("touchmove", handleScroll);
    };
  }, []);

  const handlePosition = (value: string) => {
    if (position.startsWith("utg") && value === "utg-0") {
      const prevNumber = Number(position.split("-")[1]);
      const newNumber = prevNumber === 3 ? 0 : prevNumber + 1;
      setPosition(`utg-${newNumber}`);
    } else {
      setPosition(value);
    }
  };
  const handleIncrementPeople = () => {
    if (people === 10) return;
    setPeople(people + 1);
  };
  const handleDecrementPeople = () => {
    if (people === 2) return;
    setPeople(people - 1);
  };
  const handleNumber = useCallback(
    (value: number) => {
      /* numbersの合計 */
      if (hand[0] !== 0 && hand[1] !== 0) return;
      if (hand[0] === 0) {
        setHand([value, 0, hand[2]]);
      } else {
        setHand([hand[0], value, hand[2]]);
      }
    },
    [hand],
  );
  const handleSuited = useCallback(
    (value: boolean) => {
      setHand([hand[0], hand[1], value]);
    },
    [hand],
  );
  const handleClear = () => {
    setHand([0, 0, false]);
  };

  const disabled = useMemo(() => hand[0] === 0 || hand[1] === 0, [hand]);
  const handleSubmit = useCallback(
    async (action: string) => {
      if (disabled) return;

      const ok = await addHand({
        people,
        position,
        action,
        preflop: hand,
        flop: null,
        turn: null,
        river: null,
      });
      if (ok) {
        setHand([0, 0, false]);
        setPosition(calcPosition(position, people));
        toast.success("Save success!!");
      } else {
        toast.error("Save failed");
      }
    },
    [disabled, people, position, hand],
  );

  return (
    <div className="flex h-full flex-col justify-between px-6 py-4">
      <div className="space-y-4">
        <PositionButtons position={position} onClick={handlePosition} />
        <div className="flex items-center justify-between">
          <PeopleCounter
            current={people}
            increment={handleIncrementPeople}
            decrement={handleDecrementPeople}
          />
          <TodayListView hands={hands} />
        </div>
      </div>

      <div className="flex flex-grow items-center justify-center text-9xl">
        {toHandString(hand)}
      </div>

      {/* Interface */}
      <div className="space-y-4 pb-8">
        <NumberButtons onClick={handleNumber} />
        <div className="flex gap-x-2">
          <IsSuitedButtons suited={hand[2]} onClick={handleSuited} />
          <Button variant="outline" onClick={handleClear}>
            <RxReset size={20} />
          </Button>
        </div>

        <div className="flex gap-2">
          <>
            <Button
              className="flex-grow"
              variant="outline"
              disabled={disabled}
              onClick={() => handleSubmit("raise")}
            >
              RISE
            </Button>
            <Button
              className="flex-grow"
              variant="outline"
              disabled={disabled}
              onClick={() => handleSubmit("call")}
            >
              CALL
            </Button>
            <Button
              className="flex-grow"
              variant="outline"
              disabled={disabled}
              onClick={() => handleSubmit("3bet")}
            >
              3BET
            </Button>
            <Button
              className="flex-grow"
              variant="outline"
              disabled={disabled}
              onClick={() => handleSubmit("fold")}
            >
              FOLD
            </Button>
          </>
        </div>
      </div>
    </div>
  );
}
