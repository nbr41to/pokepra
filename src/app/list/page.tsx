import { PlayCard } from "@/components/PlayCard";
import { Button } from "@/components/ui/button";
import { cards, shuffleCard } from "@/utils/cards";
import Link from "next/link";

export default function Page() {
  const list = shuffleCard(cards);
  console.log(list);

  return (
    <div>
      <div className="mx-auto w-fit p-6">
        <Button className="font-bold" asChild>
          <Link href="/list/new">New</Link>
        </Button>
      </div>
    </div>
  );
}
