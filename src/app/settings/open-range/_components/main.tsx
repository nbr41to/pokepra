"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Label } from "@/components/ui/label";
import initialOpenRanges from "@/data/initial-open-ranges.json";
import { cn } from "@/lib/utils";
import { CARD_RANK_ORDER, CARD_RANKS } from "@/utils/card";
import { compressStartingHands, expandStartingHands } from "@/utils/hand-range";

type RangeTable = {
  id: string;
  cells: number[];
};

type Props = {
  maxTables: number;
};

const GRID_SIZE = 13;
const CELL_COUNT = GRID_SIZE * GRID_SIZE;
const RATE_STEPS = [1, 0.75, 0.5, 0.25, 0] as const;
const STORAGE_RATE_ORDER = [1, 0.75, 0.5, 0.25, 0] as const;
const STORAGE_KEY = "mcpt:open-range-tables";

const createTable = (index: number): RangeTable => ({
  id: `range-${Date.now()}-${index}`,
  cells: Array.from({ length: CELL_COUNT }, () => 0),
});

const buildHandGrid = () =>
  CARD_RANKS.flatMap((rowRank, rowIndex) =>
    CARD_RANKS.map((colRank, colIndex) => {
      const ordered = [rowRank, colRank]
        .sort((a, b) => CARD_RANK_ORDER[b] - CARD_RANK_ORDER[a])
        .join("");
      const suited = rowRank === colRank ? "" : colIndex < rowIndex ? "o" : "s";
      return ordered + suited;
    }),
  );

const serializeTable = (cells: number[], handGrid: string[]) =>
  STORAGE_RATE_ORDER.map((rate) => {
    const labels = handGrid.filter((_, index) => cells[index] === rate);
    return labels.length === 0 ? [] : [compressStartingHands(labels)];
  });

const deserializeTables = (raw: string, handGrid: string[]) => {
  const parsed = JSON.parse(raw) as Array<Array<string[] | string>>;
  if (!Array.isArray(parsed)) return null;
  const labelToIndex = new Map(handGrid.map((label, index) => [label, index]));

  const tables: RangeTable[] = [];
  for (let tableIndex = 0; tableIndex < parsed.length; tableIndex += 1) {
    const table = parsed[tableIndex] ?? [];
    const cells = Array.from({ length: CELL_COUNT }, () => 0);
    for (
      let rateIndex = 0;
      rateIndex < STORAGE_RATE_ORDER.length;
      rateIndex += 1
    ) {
      const rate = STORAGE_RATE_ORDER[rateIndex] ?? 0;
      const entry = table?.[rateIndex];
      const rangeString = Array.isArray(entry)
        ? entry.join(",")
        : (entry ?? "");
      if (!rangeString) continue;
      const labels = expandStartingHands(rangeString);
      for (const label of labels) {
        const index = labelToIndex.get(label);
        if (index === undefined) continue;
        cells[index] = rate;
      }
    }
    tables.push({ id: `range-${Date.now()}-${tableIndex}`, cells });
  }

  return tables;
};

export const Main = ({ maxTables }: Props) => {
  const handGrid = useMemo(() => buildHandGrid(), []);
  const [tables, setTables] = useState<RangeTable[]>(() => [createTable(0)]);
  const [activeId, setActiveId] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);

  const activeTable =
    tables.find((table) => table.id === activeId) ?? tables[0];

  useEffect(() => {
    let alive = true;
    const loadTables = () => {
      const stored = localStorage.getItem(STORAGE_KEY);
      const source = stored ?? JSON.stringify(initialOpenRanges);
      try {
        const parsed = deserializeTables(source, handGrid);
        if (!parsed || parsed.length === 0) throw new Error("Invalid payload");
        const limited = parsed.slice(0, maxTables);
        if (!alive) return;
        setTables(limited);
        setActiveId(limited[0]?.id ?? "");
      } catch {
        if (!alive) return;
        const fallback = [createTable(0)];
        setTables(fallback);
        setActiveId(fallback[0]?.id ?? "");
      }
    };
    loadTables();
    return () => {
      alive = false;
    };
  }, [handGrid, maxTables]);

  const handleToggle = (index: number) => {
    if (!isEditing) return;
    setTables((prev) =>
      prev.map((table) => {
        if (table.id !== activeTable.id) return table;
        const nextCells = [...table.cells];
        const current = nextCells[index] ?? 0;
        const currentIndex = RATE_STEPS.indexOf(
          current as (typeof RATE_STEPS)[number],
        );
        const nextIndex =
          currentIndex === -1 ? 1 : (currentIndex + 1) % RATE_STEPS.length;
        nextCells[index] = RATE_STEPS[nextIndex] ?? 0;
        return { ...table, cells: nextCells };
      }),
    );
  };

  const handleAddTable = () => {
    if (!isEditing) return;
    setTables((prev) => {
      if (prev.length >= maxTables) return prev;
      const next = [...prev, createTable(prev.length)];
      setActiveId(next[next.length - 1]?.id ?? prev[0]?.id);
      return next;
    });
  };

  const handleSave = () => {
    const payload = tables
      .slice(0, maxTables)
      .map((table) => serializeTable(table.cells, handGrid));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3 rounded-lg border bg-card p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-muted-foreground text-sm">
              参加率は1→0.75→0.5→0.25→0の順で切り替わります。
            </p>
            <p className="text-muted-foreground text-xs">
              最大{maxTables}個まで作成可能です。
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleAddTable}
            disabled={!isEditing || tables.length >= maxTables}
          >
            新しいレンジ表を追加
          </Button>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <ButtonGroup className="max-w-full overflow-x-auto">
            {tables.map((table, index) => (
              <Button
                key={table.id}
                size="sm"
                variant={table.id === activeId ? "default" : "outline"}
                onClick={() => setActiveId(table.id)}
              >
                {`Range ${index + 1}`}
              </Button>
            ))}
          </ButtonGroup>
          <Button
            size="sm"
            variant={isEditing ? "default" : "outline"}
            onClick={() => setIsEditing((prev) => !prev)}
          >
            {isEditing ? "確認モード" : "編集モード"}
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <Label>レンジ表</Label>
        <div className="max-w-full overflow-auto rounded-lg border bg-card p-2 shadow-sm">
          <div className="grid w-max min-w-max grid-cols-13 border-r border-b">
            {handGrid.map((label, index) => {
              const value = activeTable?.cells[index] ?? 0;
              const fillPct = Math.round(value * 100);
              return (
                <button
                  key={label}
                  type="button"
                  className={cn(
                    "relative grid h-10 min-h-10 w-12 min-w-12 place-items-center overflow-hidden border-t border-l font-bold text-[11px] transition",
                    "bg-muted/40 text-foreground",
                    !isEditing && "cursor-default",
                  )}
                  onClick={() => handleToggle(index)}
                >
                  <div
                    className="absolute inset-y-0 left-0 bg-emerald-500/80"
                    style={{ width: `${fillPct}%` }}
                  />
                  <span className="relative z-10">{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {isEditing ? (
        <Button
          type="button"
          className="w-full rounded-full"
          size="lg"
          onClick={handleSave}
        >
          保存する
        </Button>
      ) : (
        <div className="rounded-lg border bg-card p-4 text-muted-foreground text-sm shadow-sm">
          編集するには「編集モード」に切り替えてください。
        </div>
      )}
    </div>
  );
};
