"use client";

import { useState } from "react";
import { PlayCard } from "@/components/play-card";
import { Button } from "@/components/ui/button";
import {
  simulateRankDistribution,
  simulateVsList,
  simulateVsListWithRanks,
} from "@/lib/wasm/simulation";
import { getHandsByTiers } from "@/utils/dealer";
import { InputCard } from "./_components/input-card";

export default function Page() {
  const [hero, setHero] = useState("As Ks");
  const [compare, setCompare] = useState(
    getHandsByTiers(5, ["As", "Ks", "Qc", "3c", "Ts"])
      .join(";")
      .replaceAll(",", " "),
  );
  const [board, setBoard] = useState("Qc 3c Ts");
  const [trials, setTrials] = useState(200);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);
  const [equity, setEquity] = useState<number | null>(null);
  const [results, setResults] = useState<
    { hand: string; wins: number; ties: number; plays: number }[]
  >([]);

  const normalizeCard = (c: string) => c.trim();
  const splitCards = (input: string) => {
    const tokens = input.trim().split(/\s+/).filter(Boolean);
    if (tokens.length === 1 && tokens[0].length > 2) {
      // compact form like "AsKs" -> chunk by 2
      return tokens[0].match(/.{1,2}/g)?.map(normalizeCard) ?? [];
    }
    return tokens.map(normalizeCard);
  };
  const splitHands = (input: string) =>
    input
      .split(";")
      .map((h) => h.trim())
      .filter(Boolean);
  const handCards = (hand: string) =>
    hand.includes(" ")
      ? splitCards(hand)
      : (hand
          .match(/.{1,2}/g)
          ?.map((c) => c.trim())
          .filter(Boolean) ?? []);

  const filterHands = (handsStr: string, forbidden: Set<string>) =>
    splitHands(handsStr)
      .filter((h) => {
        const cards = handCards(h);
        return !cards.some((c) => forbidden.has(c));
      })
      .join(";");

  async function runSimulation() {
    setStatus("loading");
    setError(null);
    setEquity(null);
    setResults([]);

    const timeStart = performance.now(); // 計測開始
    try {
      const payload = await simulateVsList({
        hero,
        board,
        compare,
        trials,
      });

      console.log("=== WASM hero vs listed opponents ===");
      console.log("hero:", hero);
      console.log("board:", board || "(none)");
      console.log("compare:", compare);
      console.log("trials:", trials);
      console.log("hero aggregate:", payload.hero);
      console.log("payload:", payload);

      setEquity(payload.equity);
      setResults(payload.results);
      setStatus("ready");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unknown error running simulation";
      setError(message);
      setStatus("error");
    } finally {
      const durationMs = performance.now() - timeStart;
      console.log(`runSimulation: end in ${durationMs.toFixed(2)}ms`);
    }
  }

  async function runSimulation2() {
    const timeStart = performance.now(); // 計測開始
    const hands = getHandsByTiers(3, ["Qc", "3c", "Ts"])
      .join(";")
      .replaceAll(",", "");
    const boardCards = new Set(splitCards(board || "Qc 3c Ts"));
    const filteredHands = filterHands(hands, boardCards);

    const results = await simulateRankDistribution({
      hands: filteredHands,
      board: "Qc 3c Ts",
      trials: 1000,
    });

    console.log(results);

    const durationMs = performance.now() - timeStart;
    console.log(`simulateRankDistribution: end in ${durationMs.toFixed(2)}ms`);
  }

  async function runSimulation3() {
    const timeStart = performance.now(); // 計測開始
    const hero = "AsKs";
    const compareRaw = getHandsByTiers(5, ["Qc", "3c", "Ts"])
      .join(";")
      .replaceAll(",", "");
    const forbidden = new Set([...splitCards(hero), ...splitCards("Qc 3c Ts")]);
    const compare = filterHands(compareRaw, forbidden);

    const results = await simulateVsListWithRanks({
      hero,
      compare,
      board: "Qc 3c Ts",
      trials: 1000,
    });

    console.log(results);

    const durationMs = performance.now() - timeStart;
    console.log(`simulateRankDistribution: end in ${durationMs.toFixed(2)}ms`);
  }

  return (
    <div className="flex w-full flex-col items-center justify-center gap-y-8 overflow-scroll p-6">
      <div className="text-center">
        <p className="text-muted-foreground text-sm uppercase tracking-[0.12em]">
          Rust -&gt; WebAssembly -&gt; Next.js
        </p>
        <h1 className="font-bold font-montserrat text-2xl">
          WASM Monte Carlo (Hero vs Listed Opponents)
        </h1>
        <p className="text-muted-foreground text-xs">
          ヒーローの 2 枚ハンド、任意のボード（0-5
          枚）、比較したい相手ハンド群を入力して Monte Carlo を実行します。
        </p>
      </div>

      <div className="flex w-full max-w-2xl flex-col gap-3 rounded-xl border border-border/60 bg-background/60 p-6 shadow-sm">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted-foreground">Hero hand (2 cards)</span>
          <input
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
            value={hero}
            onChange={(e) => setHero(e.target.value)}
            placeholder="例: As Ks"
          />
          <InputCard value={hero} onChange={setHero} placeholder="例: As Ks" />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted-foreground">Board (0-5 cards)</span>
          <input
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
            value={board}
            onChange={(e) => setBoard(e.target.value)}
            placeholder="例: 2c 3c 4c"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted-foreground">
            Compare hands (2 cards each, ; separated)
          </span>
          <input
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
            value={compare}
            onChange={(e) => setCompare(e.target.value)}
            placeholder="例: Qh Qd;Jh Th"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted-foreground">Trials</span>
          <input
            type="number"
            min={1}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
            value={trials}
            onChange={(e) => setTrials(Number(e.target.value) || 1)}
          />
        </label>

        <div className="flex flex-wrap gap-2">
          <Button onClick={runSimulation} disabled={status === "loading"}>
            {status === "loading"
              ? "Simulating..."
              : "Simulate & Log to Console"}
          </Button>
          <Button onClick={runSimulation2} disabled={status === "loading"}>
            {status === "loading"
              ? "Simulating..."
              : "Simulate Rank Distribution & Log to Console"}
          </Button>
          <Button onClick={runSimulation3} disabled={status === "loading"}>
            {status === "loading"
              ? "Simulating..."
              : "Simulate Vs List With Ranks & Log to Console"}
          </Button>
        </div>

        {error && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-destructive text-sm">
            {error}
          </div>
        )}

        {status === "ready" && !error && (
          <div className="rounded-md border border-border/60 bg-muted/40 px-3 py-2 text-foreground text-sm">
            {equity !== null
              ? `Hero equity: ${(equity * 100).toFixed(2)}% （コンソールに全結果を出力しました）`
              : "コンソールに結果を出力しました。"}
          </div>
        )}
      </div>

      {results.length > 0 && (
        <div className="max-w-2xl space-y-2">
          <h2 className="font-semibold">Detailed Results:</h2>
          <div className="flex flex-wrap gap-4">
            {results
              .sort((a, b) => b.wins - a.wins)
              .map(({ hand, wins, plays }) => {
                const winRate = ((wins / plays) * 100).toFixed(2);
                const hand1 = hand.split(" ")[0];
                const hand2 = hand.split(" ")[1];

                return (
                  <div
                    key={hand}
                    className="rounded-md border border-border/60 bg-background/60 p-3 shadow-sm"
                  >
                    <div className="relative w-12 scale-75">
                      <PlayCard
                        className="relative -left-px -rotate-2"
                        rank={hand1[0]}
                        suit={hand1[1] as "c" | "d" | "h" | "s"}
                        size="sm"
                      />
                      <PlayCard
                        className="absolute top-0 right-0 rotate-4"
                        rank={hand2[0]}
                        suit={hand2[1] as "c" | "d" | "h" | "s"}
                        size="sm"
                      />
                    </div>
                    <p className="text-sm">Wins: {winRate}%</p>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
