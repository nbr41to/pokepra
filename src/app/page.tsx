import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Page() {
  return (
    <div className="flex h-dvh w-full flex-col items-center justify-center gap-y-8">
      <h1 className="font-bold font-montserrat text-2xl">Monte Carlo Poker</h1>
      <div className="flex flex-col items-center justify-center gap-y-3">
        <Button className="w-60" variant="default" size="lg" asChild>
          <Link href="/preflop">Preflop</Link>
        </Button>
        <Button className="w-60" variant="default" size="lg" asChild>
          <Link href="/postflop">Postflop</Link>
        </Button>
        <Button className="w-60" variant="default" size="lg" asChild>
          <Link href="/score-attack">Score attack</Link>
        </Button>
        <Button className="w-60" variant="default" size="lg" disabled>
          <Link href="/range-bet">Range bet</Link>
        </Button>
        <Button className="w-60" variant="outline" size="lg" asChild>
          <Link href="/simulation">Simulation</Link>
        </Button>
        <Button className="w-60" variant="outline" size="lg" asChild>
          <Link href="/tips">Tips</Link>
        </Button>
      </div>
    </div>
  );
}
