"use client";

import { useEffect } from "react";
import Main from "./_components/main";
import { useActionStore } from "./_utils/state";

export default function Page() {
  const { shuffleAndDeal, reset } = useActionStore();

  useEffect(() => {
    shuffleAndDeal();

    return reset;
  }, [shuffleAndDeal, reset]);

  return <Main />;
}
