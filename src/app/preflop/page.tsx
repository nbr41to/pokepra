import { genHands } from "@/utils/genHands";
import { HandConfirmation } from "./_components/hand-confirmation";

export default function Home() {
  const hands = genHands();

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-y-8">
      <h1 className="font-bold font-montserrat text-2xl">MY POKER</h1>
      <HandConfirmation hands={hands} />
    </div>
  );
}
