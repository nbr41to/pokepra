"use client";

import { BookText, Calculator, Gamepad2, Settings2 } from "lucide-react";
import Link from "next/link";
import { ViewTransition } from "react";
import { cn } from "@/lib/utils";
import { useVibration } from "@/lib/web-haptics/vibration";
import { Button } from "../shadcn/button";

type Props = {
  menuName: "trainers" | "tools" | "tips" | "settings";
  className?: string;
};

export const FooterLayout = ({ menuName, className }: Props) => {
  const { trigger } = useVibration();

  return (
    <ViewTransition name={menuName}>
      <Button
        className={cn("rounded-full border shadow", className)}
        variant="secondary"
        size="icon-lg"
        onClick={() => trigger()}
        asChild
      >
        <Link href="/">
          <Gamepad2 className={`${menuName !== "trainers" && "hidden"}`} />
          <Calculator className={`${menuName !== "tools" && "hidden"}`} />
          <BookText className={`${menuName !== "tips" && "hidden"}`} />
          <Settings2 className={`${menuName !== "settings" && "hidden"}`} />
        </Link>
      </Button>
    </ViewTransition>
  );
};
