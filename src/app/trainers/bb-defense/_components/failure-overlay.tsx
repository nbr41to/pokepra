import { useState } from "react";
import { Button } from "@/components/shadcn/button";
import { cn } from "@/lib/utils";

type Props = {
  visible: boolean;
  onRetry: () => void;
};

export const FailureOverlay = ({ visible, onRetry }: Props) => {
  const [notBlur, setNotBlur] = useState(false);

  return (
    // biome-ignore lint/a11y/useSemanticElements: Uses div for overlay positioning with role.
    <div
      role="button"
      tabIndex={0}
      className={cn(
        "fixed inset-0 z-10 grid h-dvh w-screen place-content-center bg-background/50",
        !visible && "hidden",
        !notBlur && "backdrop-blur-xs",
      )}
      onClick={() => setNotBlur((prev) => !prev)}
      onKeyDown={() => setNotBlur((prev) => !prev)}
      onKeyUp={() => setNotBlur((prev) => !prev)}
    >
      <p className="text-xl">Game over</p>
      <Button
        className="mt-4 rounded-full"
        size="lg"
        variant="outline"
        onClick={(event) => {
          event.stopPropagation();
          onRetry();
        }}
      >
        Retry
      </Button>
    </div>
  );
};
