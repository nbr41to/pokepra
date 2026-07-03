"use client";

import { BookText, Calculator, Gamepad2, Home, Settings2 } from "lucide-react";
import { type PointerEvent, useRef, useState, ViewTransition } from "react";
import { TabsList, TabsTrigger } from "@/components/shadcn/tabs";
import { cn } from "@/lib/utils";
import { useVibration } from "@/lib/web-haptics/vibration";

type Props = {
  className?: string;
  activeValue?: string;
  onValueChange?: (value: string) => void;
};
const TAB_ORDER = ["introduction", "trainers", "tools", "tips", "settings"];
const TAB_LABELS: Record<string, string> = {
  introduction: "",
  trainers: "練習",
  tools: "計算",
  tips: "知識",
  settings: "設定",
};
// size-15 (60px) + gap-x-1 (4px)
const TAB_STEP_PX = 64;
const MAX_TRANSLATE_PX = (TAB_ORDER.length - 1) * TAB_STEP_PX;
const DRAG_THRESHOLD_PX = 6;

type DragState = {
  pointerId: number;
  fingerStartX: number;
  circleStartTranslateX: number;
  hoveredValue: string;
  translateX: number;
  isMoving: boolean;
};

export const FooterTablist = ({
  className,
  activeValue,
  onValueChange,
}: Props) => {
  const { trigger } = useVibration();
  const listRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const [drag, setDrag] = useState<DragState | null>(null);

  const activeIndex = Math.max(
    0,
    TAB_ORDER.indexOf(activeValue ?? "introduction"),
  );

  const displayValue = drag?.hoveredValue ?? activeValue ?? "introduction";
  const indicatorTranslateX = drag
    ? drag.translateX
    : activeIndex * TAB_STEP_PX;

  const valueAt = (clientX: number, clientY: number): string | null => {
    const list = listRef.current;
    if (!list) return null;
    const triggers = list.querySelectorAll<HTMLElement>(
      '[data-slot="tabs-trigger"]',
    );
    for (let i = 0; i < triggers.length && i < TAB_ORDER.length; i++) {
      const r = triggers[i].getBoundingClientRect();
      if (
        clientX >= r.left &&
        clientX <= r.right &&
        clientY >= r.top &&
        clientY <= r.bottom
      ) {
        return TAB_ORDER[i];
      }
    }
    return null;
  };

  const updateDrag = (next: DragState) => {
    dragRef.current = next;
    setDrag(next);
  };

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const value = valueAt(e.clientX, e.clientY);
    if (value === null) return;
    const startedIndex = TAB_ORDER.indexOf(value);
    if (startedIndex < 0) return;

    const startTranslateX = startedIndex * TAB_STEP_PX;
    const newDrag: DragState = {
      pointerId: e.pointerId,
      fingerStartX: e.clientX,
      circleStartTranslateX: startTranslateX,
      hoveredValue: value,
      translateX: startTranslateX,
      isMoving: false,
    };
    dragRef.current = newDrag;
    setDrag(newDrag);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d || d.pointerId !== e.pointerId) return;
    const dx = e.clientX - d.fingerStartX;

    if (!d.isMoving && Math.abs(dx) < DRAG_THRESHOLD_PX) return;

    const translateX = Math.min(
      Math.max(d.circleStartTranslateX + dx, 0),
      MAX_TRANSLATE_PX,
    );
    const idx = Math.max(
      0,
      Math.min(TAB_ORDER.length - 1, Math.round(translateX / TAB_STEP_PX)),
    );
    const newHovered = TAB_ORDER[idx];
    if (newHovered !== d.hoveredValue) trigger("selection");
    updateDrag({
      ...d,
      translateX,
      hoveredValue: newHovered,
      isMoving: true,
    });
  };

  const endSwipe = (e: PointerEvent<HTMLDivElement>, navigate: boolean) => {
    const d = dragRef.current;
    if (!d || d.pointerId !== e.pointerId) return;
    dragRef.current = null;
    setDrag(null);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    if (navigate && d.hoveredValue !== activeValue) {
      onValueChange?.(d.hoveredValue);
      trigger("selection");
    }
  };

  return (
    <TabsList
      ref={listRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={(e) => endSwipe(e, true)}
      onPointerCancel={(e) => endSwipe(e, false)}
      className={cn(
        "relative h-16 touch-none gap-x-1 rounded-full bg-muted-foreground/30 shadow backdrop-blur",
        className,
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute left-0.75 z-0 flex size-15 flex-col items-center justify-end rounded-full bg-muted pb-1 text-[10px] text-muted-foreground shadow-sm will-change-transform",
          drag?.isMoving
            ? "transition-none"
            : "transition-[transform,opacity] duration-300 ease-out",
        )}
        style={{
          transform: `translateX(${indicatorTranslateX}px)`,
        }}
      >
        {Object.entries(TAB_LABELS)
          .filter(([key]) => key !== "introduction")
          .map(([key, label]) => (
            <span
              key={key}
              data-active={displayValue === key}
              className="absolute bottom-1 opacity-0 transition-opacity duration-0 data-[active=true]:opacity-100 data-[active=true]:duration-300 data-[active=true]:ease-out"
            >
              {label}
            </span>
          ))}
      </div>
      <TabsTrigger
        value="introduction"
        data-display-active={displayValue === "introduction"}
        className="group relative z-10 size-15 rounded-full border-none! bg-transparent! shadow-none!"
        onClick={() => trigger("selection")}
      >
        <Home className="size-6!" />
      </TabsTrigger>
      <ViewTransition name="trainers">
        <TabsTrigger
          value="trainers"
          data-display-active={displayValue === "trainers"}
          className="group relative z-10 size-15 rounded-full border-none! bg-transparent! shadow-none!"
          onClick={() => trigger("selection")}
        >
          <Gamepad2 className="size-6! transition-transform duration-300 group-data-[display-active=true]:-translate-y-1.5" />
        </TabsTrigger>
      </ViewTransition>
      <ViewTransition name="tools">
        <TabsTrigger
          value="tools"
          data-display-active={displayValue === "tools"}
          className="group relative z-10 size-15 rounded-full border-none! bg-transparent! shadow-none!"
          onClick={() => trigger("selection")}
        >
          <Calculator className="size-6! transition-transform duration-300 group-data-[display-active=true]:-translate-y-1.5" />
        </TabsTrigger>
      </ViewTransition>
      <ViewTransition name="tips">
        <TabsTrigger
          value="tips"
          data-display-active={displayValue === "tips"}
          className="group relative z-10 size-15 rounded-full border-none! bg-transparent! shadow-none!"
          onClick={() => trigger("selection")}
        >
          <BookText className="size-6! transition-transform duration-300 group-data-[display-active=true]:-translate-y-1.5" />
        </TabsTrigger>
      </ViewTransition>
      <ViewTransition name="settings">
        <TabsTrigger
          value="settings"
          data-display-active={displayValue === "settings"}
          className="group relative z-10 size-15 rounded-full border-none! bg-transparent! shadow-none!"
          onClick={() => trigger("selection")}
        >
          <Settings2 className="size-6! transition-transform duration-300 group-data-[display-active=true]:-translate-y-1.5" />
        </TabsTrigger>
      </ViewTransition>
    </TabsList>
  );
};
