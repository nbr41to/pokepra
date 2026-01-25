"use client";

import { useState } from "react";
import { PlayCard } from "@/components/play-card";
import { Button } from "@/components/shadcn/button";
import { TipsCard } from "@/features/tips/tips-card";
import { TipsText } from "@/features/tips/tips-text";

export function TexasHoldemSection() {
  const boardCards = ["8h", "9h", "2c", "Kd", "Th"];
  const players = [
    {
      id: "hero",
      label: "あなた",
      hand: ["Ah", "Qh"],
      best: ["Ah", "Qh", "8h", "9h", "Th"],
      role: "フラッシュ",
    },
    {
      id: "villain",
      label: "相手A",
      hand: ["Jc", "Qd"],
      best: ["8h", "9h", "Th", "Jc", "Qd"],
      role: "ストレート",
    },
    {
      id: "third",
      label: "相手B",
      hand: ["Ks", "2d"],
      best: ["Ks", "Kd", "2d", "2c", "Th"],
      role: "ツーペア",
    },
  ] as const;
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>(
    players[0].id,
  );
  const selectedPlayer =
    players.find((player) => player.id === selectedPlayerId) ?? players[0];

  return (
    <TipsCard asChild size="sm" className="space-y-2">
      <section>
        <h2 className="font-semibold">テキサスホールデム</h2>
        <TipsText>
          自分だけが見ることができる2枚(ハンド)と、全員が見ることができる共通の5枚(ボード)の合計7枚から、
          5枚を選んだときのもっとも強い役で勝負をします。
        </TipsText>
        <div className="space-y-3 rounded-md border bg-muted/30 p-3 text-sm">
          <p className="font-semibold">勝負の例:</p>
          <div className="grid grid-cols-3 grid-rows-3 place-items-center gap-3">
            {players.map((player, index) => {
              const positionClass =
                index === 0
                  ? "col-start-2 row-start-3"
                  : index === 1
                    ? "col-start-1 row-start-1"
                    : "col-start-3 row-start-1";
              return (
                <div
                  key={player.id}
                  className={`flex flex-col items-center gap-2 ${positionClass}`}
                >
                  <span className="text-muted-foreground text-xs">
                    {player.label}
                  </span>
                  <div className="flex items-center gap-2">
                    {player.hand.map((card) => (
                      <PlayCard
                        key={`${player.id}-${card}`}
                        rs={card}
                        size="sm"
                      />
                    ))}
                  </div>
                </div>
              );
            })}
            <div className="col-start-2 row-start-2 rounded-md border bg-background/80 p-3">
              <span className="mb-1 block text-center text-muted-foreground text-xs">
                ボード
              </span>
              <div className="flex items-center gap-2">
                {boardCards.map((card) => (
                  <PlayCard key={`board-${card}`} rs={card} size="sm" />
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {players.map((player) => (
              <Button
                key={`button-${player.id}`}
                size="sm"
                variant={selectedPlayerId === player.id ? "default" : "outline"}
                onClick={() => setSelectedPlayerId(player.id)}
              >
                {player.label}の役
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {selectedPlayer.best.map((card) => (
              <PlayCard
                key={`best-${selectedPlayer.id}-${card}`}
                rs={card}
                size="sm"
              />
            ))}
            <span className="text-muted-foreground text-xs">
              {selectedPlayer.role}
            </span>
          </div>
        </div>
        <TipsText>
          この中では、フラッシュが最も強いのであなたの勝ちです。なかなか激アツな展開です。
        </TipsText>
      </section>
    </TipsCard>
  );
}
