import { Button } from "@/components/ui/button";
import Link from "next/link";
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/list");

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
