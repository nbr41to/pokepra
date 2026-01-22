import { BookText, Calculator, Gamepad2, Settings2 } from "lucide-react";
import Link from "next/link";
import { ViewTransition } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

type Props = {
  menuName: "trainers" | "tools" | "tips" | "settings";
  className?: string;
};

export const FooterLayout = ({ menuName, className }: Props) => {
  return (
    <div className={cn("", className)}>
      <ViewTransition name={menuName}>
        <Button
          className="rounded-full"
          variant="outline"
          size="icon-lg"
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
    </div>
  );
};
