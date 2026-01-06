"use client";

import { useEffect } from "react";
import { ActionArea } from "./_components/action-area";
import { OtherPlayers } from "./_components/other-players";
import { useActionStore } from "./_utils/state";

export default function Page() {
  const { shuffleAndDeal, reset } = useActionStore();

  useEffect(() => {
    shuffleAndDeal();

    return reset;
  }, [shuffleAndDeal, reset]);

  return (
    <div className="flex h-dvh w-full flex-col items-center justify-end p-2 pb-10">
      <OtherPlayers />
      <ActionArea />
    </div>
  );
}
