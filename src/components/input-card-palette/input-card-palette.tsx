import { useEffect, useState } from "react";
import { CARD_RANKS, CARD_SUITS } from "@/utils/card";
import { DeleteButton } from "./delete-button";
import { EnterButton } from "./enter-button";
import { InputRankButton } from "./input-rank-button";
import { InputSuitButton } from "./input-suit-button";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onEnter: () => void;
  limit?: number; // 最大入力可能枚数
  separator?: string;
  handSeparator?: string | null;
  banCards?: string[];
};

export const InputCardPalette = ({
  value,
  onChange,
  onEnter,
  limit,
  separator = " ",
  handSeparator = null,
  banCards = [],
}: Props) => {
  const parseCards = (val: string) => {
    if (!val) return [] as string[];
    const replaced = handSeparator
      ? val.replaceAll(handSeparator, separator)
      : val;
    return replaced
      .split(separator)
      .map((c) => c.trim())
      .filter(Boolean);
  };

  const [pending, setPending] = useState<{
    rank: string | null;
    suit: string | null;
  }>({
    rank: null,
    suit: null,
  });

  // pending状態の初期化
  useEffect(() => {
    return () => {
      setPending({ rank: null, suit: null });
    };
  }, []);

  const cards = parseCards(value);
  const isLimited = limit ? cards.length >= limit : false;

  const handleOnChange = (type: "rank" | "suit", val: string) => {
    const next = { ...pending, [type]: val };
    const complete = next.rank && next.suit;

    if (complete) {
      const nextCard = `${next.rank}${next.suit}`;
      const updated = [...cards, nextCard];
      if (limit && updated.length > limit) return;

      const newValue = handSeparator
        ? (() => {
            const grouped: string[] = [];
            for (let i = 0; i < updated.length; i += 2) {
              grouped.push(
                updated
                  .slice(i, i + 2)
                  .filter(Boolean)
                  .join(separator)
                  .trim(),
              );
            }
            return grouped.filter(Boolean).join(`${handSeparator}`).trim();
          })()
        : updated.join(separator).trim();

      onChange(newValue);
      setPending({
        rank: null,
        suit: null,
      });
    } else {
      setPending(next);
    }
  };

  const handleDelete = () => {
    setPending({ suit: null, rank: null });
    onChange(
      (() => {
        const updated = [...cards];
        updated.pop();
        if (handSeparator) {
          const grouped: string[] = [];
          for (let i = 0; i < updated.length; i += 2) {
            grouped.push(
              updated
                .slice(i, i + 2)
                .filter(Boolean)
                .join(separator)
                .trim(),
            );
          }
          return grouped.filter(Boolean).join(`${handSeparator}`).trim();
        } else {
          return updated.join(separator).trim();
        }
      })(),
    );
  };

  // current value と banCards を考慮して、次の入力を制限するかどうか
  const getWillBun = (type: "rank" | "suit", val: string) => {
    const next = { ...pending, [type]: val };
    const complete = next.rank && next.suit;
    if (!complete) return false;

    const nextCard = `${next.rank}${next.suit}`;
    const bannedCards = [...parseCards(value), ...banCards];

    return bannedCards.includes(nextCard);
  };

  return (
    <div
      className="flex w-full justify-center border-t p-4"
      id="input-card-palette"
    >
      <div className="grid grid-cols-5 gap-1">
        {CARD_RANKS.slice(0, 1).map((rank) => (
          <InputRankButton
            key={rank}
            rank={rank}
            disabled={
              isLimited || pending.rank === rank || getWillBun("rank", rank)
            }
            onClick={() => handleOnChange("rank", rank)}
            pending={pending.rank === rank}
          />
        ))}
        {CARD_SUITS.map((suit) => (
          <InputSuitButton
            key={suit}
            suit={suit}
            disabled={
              isLimited || pending.suit === suit || getWillBun("suit", suit)
            }
            onClick={() => handleOnChange("suit", suit)}
            pending={pending.suit === suit}
          />
        ))}
        {CARD_RANKS.slice(1, 5).map((rank) => (
          <InputRankButton
            key={rank}
            rank={rank}
            disabled={
              isLimited || pending.rank === rank || getWillBun("rank", rank)
            }
            onClick={() => handleOnChange("rank", rank)}
            pending={pending.rank === rank}
          />
        ))}
        <DeleteButton onClick={handleDelete} />
        {CARD_RANKS.slice(5, 9).map((rank) => (
          <InputRankButton
            key={rank}
            rank={rank}
            disabled={
              isLimited || pending.rank === rank || getWillBun("rank", rank)
            }
            onClick={() => handleOnChange("rank", rank)}
            pending={pending.rank === rank}
          />
        ))}
        <EnterButton className="row-span-2" onClick={onEnter} />
        {CARD_RANKS.slice(9, 13).map((rank) => (
          <InputRankButton
            key={rank}
            rank={rank}
            disabled={
              isLimited || pending.rank === rank || getWillBun("rank", rank)
            }
            onClick={() => handleOnChange("rank", rank)}
            pending={pending.rank === rank}
          />
        ))}
      </div>
    </div>
  );
};
