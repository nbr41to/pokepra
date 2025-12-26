import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-y-8">
      <h1 className="font-bold font-montserrat text-2xl">MY POKER</h1>
      <Button className="font-bold font-montserrat" size="lg" asChild>
        <Link href="/preflop">Start Practice</Link>
      </Button>
    </div>
  );
}
