import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex h-dvh w-full flex-col items-center justify-center gap-y-8">
      <h1 className="font-bold font-montserrat text-2xl">MY POKER</h1>
      <div className="flex flex-col items-center justify-center gap-y-3">
        {/* <Button
          className="w-60 font-montserrat"
          variant="outline"
          size="lg"
          asChild
        >
          <Link href="/preflop">Preflop</Link>
        </Button>
        <Button
          className="w-60 font-montserrat"
          variant="outline"
          size="lg"
          asChild
        >
          <Link href="/postflop">Postflop</Link>
        </Button> */}
        <Button
          className="w-60 font-montserrat"
          variant="default"
          size="lg"
          asChild
        >
          <Link href="/score-attack">Score attack</Link>
        </Button>
      </div>
    </div>
  );
}
