"use client";

import { RxReset } from "react-icons/rx";
import { PlayCard } from "@/components/PlayCard";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { addHand, updatePeople } from "@/utils/records";
import { TodayListView } from "./TodayListView";
import { toast } from "sonner";
import { NumberButtons } from "./NumberButtons";
import { AddNumberButtons } from "./AddNumberButtons";
import { SuitButtons } from "./SuitButtons";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { PositionButtons } from "./PositionButtons";
import { PeopleCounter } from "./PeopleCounter";
import { calcPosition } from "@/utils/calcPosition";

type Props = {
  people: number;
  hands: Hand[];
};
export function Main({ people, hands }: Props) {
  const [position, setPosition] = useState("utg-0");
  const [hand, setHand] = useState<[string, string]>(["s-1", "c-1"]);
  const [countMode, setCountMode] = useState(false);
  const [addCount, setAddCount] = useState(0);
  const [focus, setFocus] = useState<0 | 1>(0);

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
  const handleIncrementPeople = async () => {
    if (people === 10) return;
    await updatePeople(people + 1);
  };
  const handleDecrementPeople = async () => {
    if (people === 2) return;
    await updatePeople(people - 1);
  };
  const handleNumber = (value: number) => {
    const newHand: [string, string] = [...hand];
    const fixedValue = value > 13 ? 13 : value;
    newHand[focus] = hand[focus].replace(/-\d+/, `-${fixedValue}`);
    setHand(newHand);
    setAddCount(fixedValue);
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
      setAddCount(0);
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
          setAddCount(0);
          setPosition(calcPosition(position, people));
          toast.success("Save success!!");
        } else {
          toast.error("Save failed");
        }
      }
    }
  };
  const handleClear = () => {
    setHand(["s-1", "c-1"]);
    setFocus(0);
    setAddCount(0);
  };

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

      {/* Interface */}
      <div className="space-y-4 pb-8">
        <div className="flex justify-center py-4">
          <button type="button" onClick={() => setFocus(0)}>
            <PlayCard value={hand[0]} size={120} focus={focus === 0} />
          </button>
          <button type="button" onClick={() => setFocus(1)}>
            <PlayCard value={hand[1]} size={120} focus={focus === 1} />
          </button>
        </div>

        <SuitButtons hand={hand[focus]} onClick={handleSuit} />
        {countMode ? (
          <AddNumberButtons currentCount={addCount} onClick={handleNumber} />
        ) : (
          <NumberButtons onClick={handleNumber} />
        )}

        <div className="flex items-center justify-end gap-x-2">
          <Label htmlFor="count-mode">Count Mode</Label>
          <Switch
            id="count-mode"
            checked={countMode}
            onClick={() => setCountMode(!countMode)}
          />
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
