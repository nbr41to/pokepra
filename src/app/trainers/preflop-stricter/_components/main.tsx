"use client";

import { useEffect } from "react";
import { useTrainerStore } from "./_utils/state";
import { ActionArea } from "./action-area";
import { ConfirmPosition } from "./confirm-position";
import { ResultArea } from "./result-area";

export const Main = () => {
  const { initialized, shuffleAndDeal, reset } = useTrainerStore();

  useEffect(() => {
    shuffleAndDeal();

    return reset;
  }, [shuffleAndDeal, reset]);

  if (!initialized) return null;

  return (
    <div className="w-full">
      <ResultArea />
      <ConfirmPosition />
      <ActionArea />
    </div>
  );
};
