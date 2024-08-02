import { PlayCard } from "@/components/PlayCard";
import { Button } from "@/components/ui/button";
import { cards, shuffleCard } from "@/utils/cards";
import Link from "next/link";

export default function Home() {
  const list = shuffleCard(cards);
  console.log(list);

  return (
    <div className="flex h-full items-center justify-center gap-4 py-6">
      <Button className="font-bold" asChild>
        <Link href="/list/new">記録をする</Link>
      </Button>
      <Button className="font-bold" asChild>
        <Link href="/list">記録を見る</Link>
      </Button>
    </div>
  );
}
