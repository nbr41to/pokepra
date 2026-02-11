"use client";

import { useMemo, useState } from "react";

type HandEquityRow = {
  rank: number;
  hand: string;
  player2: number;
  player6: number;
  player10: number;
};

type SortKey = "player2" | "player6" | "player10";
type SortOrder = "desc" | "asc";

type Props = {
  rows: HandEquityRow[];
  simulated: Record<string, number> | null;
};

const formatPct = (value: number, digits = 1) => `${value.toFixed(digits)}%`;

export const StartingHandEquityTable = ({ rows, simulated }: Props) => {
  const [sort, setSort] = useState<{ key: SortKey; order: SortOrder } | null>(
    null,
  );

  const sortedRows = useMemo(() => {
    if (!sort) return rows;

    return [...rows].sort((a, b) => {
      const left = a[sort.key];
      const right = b[sort.key];
      return sort.order === "desc" ? right - left : left - right;
    });
  }, [rows, sort]);

  const toggleSort = (key: SortKey) => {
    setSort((prev) => {
      if (!prev) {
        return { key, order: "desc" };
      }

      if (prev.key !== key) {
        return { key, order: prev.order };
      }

      return {
        key,
        order: prev.order === "desc" ? "asc" : "desc",
      };
    });
  };

  const getSortIndicator = (key: SortKey) => {
    if (!sort || sort.key !== key) return "";
    return sort.order === "desc" ? " ▼" : " ▲";
  };

  const getDisplayRank = (index: number) => {
    if (sort?.order === "asc") {
      return sortedRows.length - index;
    }

    return index + 1;
  };

  return (
    <div className="max-h-100 overflow-y-auto bg-muted px-2">
      <table className="w-full text-left text-sm">
        <thead className="sticky top-0 border-b bg-muted text-muted-foreground text-xs uppercase">
          <tr>
            <th className="py-2 pr-3">位</th>
            <th className="whitespace-nowrap py-2 pr-3">ハンド</th>
            <th className="py-2 pr-3">
              <button
                type="button"
                onClick={() => toggleSort("player2")}
                className="cursor-pointer"
              >
                2人{getSortIndicator("player2")}
              </button>
            </th>
            <th className="py-2 pr-3">実行結果</th>
            <th className="py-2 pr-3">差</th>
            <th className="py-2 pr-3">
              <button
                type="button"
                onClick={() => toggleSort("player6")}
                className="cursor-pointer"
              >
                6人{getSortIndicator("player6")}
              </button>
            </th>
            <th className="py-2 pr-3">
              <button
                type="button"
                onClick={() => toggleSort("player10")}
                className="cursor-pointer"
              >
                10人{getSortIndicator("player10")}
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((row, index) => {
            const sim = simulated?.[row.hand];
            const diff = typeof sim === "number" ? sim - row.player2 : null;

            return (
              <tr key={row.hand} className="border-b last:border-0">
                <td className="py-2 pr-3 font-mono text-xs">
                  {getDisplayRank(index)}
                </td>
                <td className="py-2 pr-3 font-semibold">{row.hand}</td>
                <td className="py-2 pr-3">{formatPct(row.player2)}</td>
                <td className="py-2 pr-3">
                  {typeof sim === "number" ? formatPct(sim) : "-"}
                </td>
                <td className="py-2 pr-3">
                  {typeof diff === "number" ? formatPct(Math.abs(diff)) : "-"}
                </td>
                <td className="py-2 pr-3">{formatPct(row.player6)}</td>
                <td className="py-2 pr-3">{formatPct(row.player10)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
