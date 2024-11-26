"use client";

import { PlayCard } from "@/components/PlayCard";
import { Button } from "@/components/ui/button";
import { evaluateHand, INITIAL_DECK, shuffleCard } from "@/utils/cards";
import { cn } from "@/utils/classNames";
import { useMemo, useState } from "react";
import {
  TbSquareRoundedNumber1Filled,
  TbSquareRoundedNumber2Filled,
  TbSquareRoundedNumber3Filled,
} from "react-icons/tb";
import { IoReloadCircle } from "react-icons/io5";
// @ts-expect-error
import { calculateEquity } from "poker-odds";
import { Progress } from "@/components/ui/progress";
import { IoArrowUndo } from "react-icons/io5";

export const Board = () => {
  const [deck, setDeck] = useState<string[]>([]);
  const [hand, setHand] = useState<string[]>([]);
  const [cpuHand, setCpuHand] = useState<string[]>([]);
  const [board, setBoard] = useState<string[]>([]);

  const start = () => {
    const shuffledDeck = shuffleCard(INITIAL_DECK);
    const newHand = shuffledDeck.splice(0, 2);
    const newCpuHand = shuffledDeck.splice(0, 2);

    setDeck(shuffledDeck);
    setHand(newHand);
    setCpuHand(newCpuHand);
    setBoard([]);
  };

  const toFlop = () => {
    if (hand.length < 2) return;
    const newDeck = [...deck];
    const newBoard = newDeck.splice(0, 3);
    setDeck(newDeck);
    setBoard(newBoard);
  };

  const toTurn = () => {
    if (hand.length < 2 || board.length < 3) return;
    const newDeck = [...deck];
    const turnCard = newDeck.splice(0, 1);
    const newBoard = [...board, ...turnCard];
    setDeck(newDeck);
    setBoard(newBoard);
  };

  const toRiver = () => {
    if (hand.length < 2 || board.length < 4) return;
    const newDeck = [...deck];
    const riverCard = newDeck.splice(0, 1);
    const newBoard = [...board, ...riverCard];
    setDeck(newDeck);
    setBoard(newBoard);
  };

  const undo = () => {
    console.log("board", board);
    if (board.length < 4) return;
    const newDeck = [...deck];
    const newBoard = [...board];
    const lastCard = newBoard.splice(-1, 1);
    newDeck.unshift(lastCard[0]);
    setDeck(newDeck);
    setBoard(newBoard);
  };

  const result = useMemo(() => {
    const allCards = hand.concat(board);
    if (allCards.length < 7) return null;
    return evaluateHand(allCards);
  }, [hand, board]);

  const odds = useMemo(() => {
    if (hand.length < 2 || board.length < 3) return null;

    const convertedHand = (card: string) => {
      const [suit, number] = card.split("-");
      const rank =
        number === "1"
          ? "A"
          : number === "10"
            ? "T"
            : number === "11"
              ? "J"
              : number === "12"
                ? "Q"
                : number === "13"
                  ? "K"
                  : number;
      return `${rank}${suit}`;
    };

    const result = calculateEquity(
      [
        hand.map((card) => convertedHand(card)),
        // cpuHand.map((card) => convertedHand(card)),
      ],
      board.map((card) => convertedHand(card)),
      100,
      true,
    );

    return result;
  }, [hand, board]);

  return (
    <div className="space-y-2">
      <div className="h-80">
        {odds && (
          <div className="space-y-1">
            {/* biome-ignore lint/suspicious/noExplicitAny: <explanation> */}
            {odds[0].handChances.map((hand: any, i: number) => {
              const probability = (hand.count / odds[0].count) * 100;
              // if (probability === 0) return null;

              return (
                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                <div key={i}>
                  <div className="text-sm font-bold">
                    {hand.name}: {probability.toFixed(2)} %
                  </div>
                  <Progress className="h-2" value={probability} />
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="h-8 text-center text-2xl font-bold">{result?.rank}</div>

      <div className="flex">
        {board.map((card) => (
          <div
            key={card}
            className={cn(
              result?.cards.includes(card) &&
                "rounded bg-foreground ring-2 ring-red-500",
            )}
          >
            <PlayCard size={60} value={card} />
          </div>
        ))}
        {Array.from({ length: 5 - board.length }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
          <div key={i}>
            <PlayCard size={60} back />
          </div>
        ))}
      </div>

      <div className="flex h-[60px] justify-center">
        {hand.map((card) => (
          <div
            key={card}
            className={cn(
              result?.cards.includes(card) &&
                "rounded bg-foreground ring-2 ring-red-500",
            )}
          >
            <PlayCard size={60} value={card} />
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Button
          className="flex-grow gap-x-1"
          variant={board.length !== 5 ? "outline" : "default"}
          onClick={start}
        >
          {hand.length === 2 && (
            <>
              <IoReloadCircle size={24} />
              Re
            </>
          )}
          start
        </Button>
        {hand.length === 2 && !board.length && (
          <Button className="w-1/2 flex-grow gap-x-1" onClick={toFlop}>
            <TbSquareRoundedNumber1Filled size={24} />
            Flop
          </Button>
        )}
        {hand.length === 2 && board.length === 3 && (
          <Button className="w-1/2 flex-grow gap-x-1" onClick={toTurn}>
            <TbSquareRoundedNumber2Filled size={24} />
            Turn
          </Button>
        )}
        {hand.length === 2 && board.length === 4 && (
          <Button className="w-1/2 flex-grow gap-x-1" onClick={toRiver}>
            <TbSquareRoundedNumber3Filled size={24} />
            River
          </Button>
        )}
        {hand.length === 2 && board.length > 3 && (
          <Button className="" onClick={undo}>
            <IoArrowUndo size={24} />
          </Button>
        )}
      </div>
    </div>
  );
};
