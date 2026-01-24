import { BookText, Calculator, Gamepad2, Home, Settings2 } from "lucide-react";
import { ViewTransition } from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  activeValue?: string;
};
const TAB_ORDER = ["introduction", "trainers", "tools", "tips", "settings"];
const TAB_LABELS: Record<string, string> = {
  introduction: "",
  trainers: "練習",
  tools: "計算",
  tips: "知識",
  settings: "設定",
};

export const FooterTablist = ({ className, activeValue }: Props) => {
  const activeIndex = Math.max(
    0,
    TAB_ORDER.indexOf(activeValue ?? "introduction"),
  );

  return (
    <TabsList
      className={cn(
        "relative h-16 gap-x-1 rounded-full bg-muted-foreground/30 shadow backdrop-blur",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute left-0.75 z-0 flex size-15 flex-col items-center justify-end rounded-full bg-muted pb-1 text-[10px] text-muted-foreground shadow-sm transition-[transform,opacity] duration-300 ease-out will-change-transform"
        style={{
          transform: `translateX(calc(${activeIndex} * (3.75rem + 0.25rem)))`,
        }}
      >
        {Object.entries(TAB_LABELS)
          .filter(([key]) => key !== "introduction")
          .map(([key, label]) => (
            <span
              key={key}
              data-active={activeValue === key}
              className="absolute bottom-1 opacity-0 transition-opacity duration-0 data-[active=true]:opacity-100 data-[active=true]:duration-300 data-[active=true]:ease-out"
            >
              {label}
            </span>
          ))}
      </div>
      <TabsTrigger
        value="introduction"
        className="group relative z-10 size-15 rounded-full border-none! bg-transparent! shadow-none!"
      >
        <Home className="size-6!" />
      </TabsTrigger>
      <ViewTransition name="trainers">
        <TabsTrigger
          value="trainers"
          className="group relative z-10 size-15 rounded-full border-none! bg-transparent! shadow-none!"
        >
          <Gamepad2 className="size-6! transition-transform duration-300 group-data-[state=active]:-translate-y-1.5" />
        </TabsTrigger>
      </ViewTransition>
      <ViewTransition name="tools">
        <TabsTrigger
          value="tools"
          className="group relative z-10 size-15 rounded-full border-none! bg-transparent! shadow-none!"
        >
          <Calculator className="size-6! transition-transform duration-300 group-data-[state=active]:-translate-y-1.5" />
        </TabsTrigger>
      </ViewTransition>
      <ViewTransition name="tips">
        <TabsTrigger
          value="tips"
          className="group relative z-10 size-15 rounded-full border-none! bg-transparent! shadow-none!"
        >
          <BookText className="size-6! transition-transform duration-300 group-data-[state=active]:-translate-y-1.5" />
        </TabsTrigger>
      </ViewTransition>
      <ViewTransition name="settings">
        <TabsTrigger
          value="settings"
          className="group relative z-10 size-15 rounded-full border-none! bg-transparent! shadow-none!"
        >
          <Settings2 className="size-6! transition-transform duration-300 group-data-[state=active]:-translate-y-1.5" />
        </TabsTrigger>
      </ViewTransition>
    </TabsList>
  );
};
