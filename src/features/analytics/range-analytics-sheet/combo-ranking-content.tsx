import { GalleryVertical, GalleryVerticalEnd } from "lucide-react";
import { use, useCallback, useRef } from "react";
import { Button } from "@/components/shadcn/button";
import { ScrollArea } from "@/components/shadcn/scroll-area";
import type { EquityPayload, HandRankingEntry } from "@/lib/wasm-v1/types";
import { ComboRankingReport } from "../reports/combo-ranking-report";

type Props = {
  evaluationPromise: Promise<HandRankingEntry[]>;
  heroEquityPromise: Promise<EquityPayload>;
};

export const ComboRankingContent = ({
  evaluationPromise,
  heroEquityPromise,
}: Props) => {
  const rankingPayload = use(evaluationPromise);
  const heroEquityPayload = use(heroEquityPromise);

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToMyHand = (smooth = false) => {
    const element = document.getElementById(heroEquityPayload.hand);
    if (element) {
      element.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
        block: "center",
      });
    }
  };

  const scrollToTop = useCallback((smooth = false) => {
    const viewport = scrollAreaRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]",
    ) as HTMLElement | null;
    if (!viewport) return;
    viewport.scrollTo({
      top: 0,
      behavior: smooth ? "smooth" : "auto",
    });
  }, []);

  return (
    <>
      <ScrollArea ref={scrollAreaRef} className="h-[calc(100dvh-140px)] w-full">
        <ComboRankingReport
          ranking={rankingPayload}
          payload={heroEquityPayload}
          onScroll={scrollToMyHand}
        />
      </ScrollArea>
      <div className="absolute right-2 bottom-7 z-10 flex flex-col gap-y-2 rounded-full opacity-80">
        <Button
          className="rounded-full"
          size="icon-lg"
          onClick={() => scrollToTop(true)}
        >
          <GalleryVerticalEnd className="rotate-180" />
        </Button>
        <Button
          className="rounded-full"
          size="icon-lg"
          onClick={() => scrollToMyHand(true)}
        >
          <GalleryVertical />
        </Button>
      </div>
    </>
  );
};
