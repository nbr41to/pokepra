import { PlayCard } from "@/components/play-card";

export default function Home() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-y-8">
      <h1 className="font-bold font-montserrat text-2xl">MY POKER</h1>
      <div className="flex aspect-video w-100 items-center justify-evenly border-2 bg-orange-50">
        <div className="relative top-1">
          <div className="relative -left-4 rotate-4">
            <PlayCard />
          </div>
          <div className="absolute -top-1.5 left-6 -rotate-4">
            <PlayCard />
          </div>
        </div>
      </div>
    </div>
  );
}
