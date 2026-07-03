"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/shadcn/button";
import { ButtonGroup } from "@/components/shadcn/button-group";
import initialOpenRanges from "@/data/initial-open-ranges.json";
import { cn } from "@/lib/utils";
import {
  buildComboClassGrid,
  comboClassToIndex,
  createRange,
  expandComboClasses,
  RANGE_SIZE,
  type Range,
} from "@/utils/v2/combo";
import {
  DEFAULT_POSITION,
  POSITIONS,
  type PositionName,
} from "@/utils/v2/position";

type RangeTable = {
  position: PositionName;
  range: Range;
};

const STORAGE_KEY = "mcpt:open-range-tables-v2";
const PARTICIPATION_STEP = 200;
const MAX_PARTICIPATION = 1000;

type StoredRangeTables = Record<PositionName, number[]>;

const createEmptyRange = () => createRange();

const createTable = (position: PositionName, range = createEmptyRange()) => ({
  position,
  range,
});

const createTables = () =>
  POSITIONS.map((position, index) =>
    createTable(
      position,
      rangeFromLegacyString(initialOpenRanges[index] ?? ""),
    ),
  );

const cloneRange = (range: Range) => new Uint16Array(range);

const normalizeParticipation = (value: unknown) => {
  if (typeof value !== "number" || !Number.isFinite(value)) return 0;
  const rounded = Math.round(value / PARTICIPATION_STEP) * PARTICIPATION_STEP;
  return Math.min(MAX_PARTICIPATION, Math.max(0, rounded));
};

const rangeFromArray = (values: unknown[]) => {
  const range = createEmptyRange();
  for (let index = 0; index < RANGE_SIZE; index += 1) {
    range[index] = normalizeParticipation(values[index]);
  }
  return range;
};

const rangeFromLegacyString = (rangeString: string) => {
  const range = createEmptyRange();
  if (!rangeString) return range;

  for (const label of expandComboClasses(rangeString)) {
    const index = comboClassToIndex(label);
    range[index] = MAX_PARTICIPATION;
  }

  return range;
};

const normalizeStoredRanges = (raw: unknown): string[] | null => {
  if (!Array.isArray(raw)) return null;
  return raw.map((entry) => {
    if (Array.isArray(entry)) {
      return entry.flat().join(",");
    }
    return typeof entry === "string" ? entry : "";
  });
};

const deserializeTables = (raw: string) => {
  const parsed = JSON.parse(raw) as unknown;

  if (
    parsed &&
    typeof parsed === "object" &&
    !Array.isArray(parsed) &&
    POSITIONS.every(
      (position) =>
        Array.isArray((parsed as Partial<StoredRangeTables>)[position]) &&
        (parsed as Partial<StoredRangeTables>)[position]?.length === RANGE_SIZE,
    )
  ) {
    return POSITIONS.map((position) =>
      createTable(
        position,
        rangeFromArray((parsed as StoredRangeTables)[position]),
      ),
    );
  }

  const legacy = normalizeStoredRanges(parsed);
  if (!legacy) return null;
  return POSITIONS.map((position, index) =>
    createTable(position, rangeFromLegacyString(legacy[index] ?? "")),
  );
};

const serializeTables = (tables: RangeTable[]): StoredRangeTables =>
  tables.reduce((payload, table) => {
    payload[table.position] = Array.from(table.range);
    return payload;
  }, {} as StoredRangeTables);

export const Main = () => {
  const handGrid = useMemo(() => buildComboClassGrid(), []);
  const [tables, setTables] = useState<RangeTable[]>(createTables);
  const [activePosition, setActivePosition] =
    useState<PositionName>(DEFAULT_POSITION);
  const [isEditing, setIsEditing] = useState(false);

  const activeTable =
    tables.find((table) => table.position === activePosition) ?? tables[0];

  useEffect(() => {
    let alive = true;
    const loadTables = () => {
      const stored = localStorage.getItem(STORAGE_KEY);
      try {
        const parsed = stored ? deserializeTables(stored) : createTables();
        if (!parsed || parsed.length !== POSITIONS.length) {
          throw new Error("Invalid payload");
        }
        if (!alive) return;
        setTables(parsed);
        setActivePosition(parsed[0]?.position ?? DEFAULT_POSITION);
      } catch {
        if (!alive) return;
        const fallback = createTables();
        setTables(fallback);
        setActivePosition(fallback[0]?.position ?? DEFAULT_POSITION);
      }
    };
    loadTables();
    return () => {
      alive = false;
    };
  }, []);

  const handleStepParticipation = (index: number) => {
    if (!isEditing || !activeTable) return;
    setTables((prev) =>
      prev.map((table) => {
        if (table.position !== activeTable.position) return table;
        const nextRange = cloneRange(table.range);
        nextRange[index] =
          nextRange[index] >= MAX_PARTICIPATION
            ? 0
            : nextRange[index] + PARTICIPATION_STEP;
        return { ...table, range: nextRange };
      }),
    );
  };

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializeTables(tables)));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3 rounded-lg border bg-card p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-muted-foreground text-sm">
              ポジションごとに参加率を設定できます。
            </p>
            <p className="text-muted-foreground text-xs">
              編集中はセルを押すたびに 20% ずつ変化します。
            </p>
          </div>
          <Button
            size="sm"
            variant={isEditing ? "default" : "outline"}
            onClick={() => setIsEditing((prev) => !prev)}
          >
            {isEditing ? "確認モード" : "編集モード"}
          </Button>
        </div>
        <ButtonGroup className="max-w-full overflow-x-auto">
          {tables.map((table) => (
            <Button
              key={table.position}
              size="sm"
              variant={
                table.position === activePosition ? "default" : "outline"
              }
              onClick={() => setActivePosition(table.position)}
            >
              {table.position}
            </Button>
          ))}
        </ButtonGroup>
      </div>

      <div className="max-w-full overflow-auto bg-card p-2 shadow-sm">
        <div className="grid w-max min-w-max grid-cols-13 border-r border-b">
          {handGrid.map((label, index) => {
            const value = activeTable?.range[index] ?? 0;
            const percent = value / 10;
            return (
              <button
                key={label}
                type="button"
                className={cn(
                  "relative h-10 min-h-10 w-12 min-w-12 overflow-hidden border-t border-l bg-muted/40 text-foreground transition",
                  isEditing
                    ? "cursor-pointer hover:bg-muted"
                    : "cursor-default",
                )}
                onClick={() => handleStepParticipation(index)}
              >
                <span
                  className="absolute inset-y-0 left-0 bg-emerald-500/80"
                  style={{ width: `${percent}%` }}
                />
                <span className="relative z-10 grid h-full place-items-center">
                  {label}
                </span>
              </button>
            );
          })}
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
        <div className="mx-2 rounded-lg border bg-card p-4 text-muted-foreground text-sm shadow-sm">
          編集するには「編集モード」に切り替えてください。
        </div>
      )}
    </div>
  );
};
