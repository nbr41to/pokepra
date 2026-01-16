import { BookText, Calculator, Gamepad2, Home, Settings2 } from "lucide-react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};
export const FooterTablist = ({ className }: Props) => {
  return (
    <TabsList
      className={cn(
        "h-15 gap-x-1 rounded-full bg-muted-foreground/30 shadow backdrop-blur",
        className,
      )}
    >
      <TabsTrigger value="introduction" className="size-14 rounded-full">
        <Home className="size-6!" />
      </TabsTrigger>
      <TabsTrigger value="trainer" className="size-14 rounded-full">
        <Gamepad2 className="size-6!" />
      </TabsTrigger>
      <TabsTrigger value="tools" className="size-14 rounded-full">
        <Calculator className="size-6!" />
      </TabsTrigger>
      <TabsTrigger value="tips" className="size-14 rounded-full">
        <BookText className="size-6!" />
      </TabsTrigger>
      <TabsTrigger value="settings" className="size-14 rounded-full">
        <Settings2 className="size-6!" />
      </TabsTrigger>
    </TabsList>
  );
};
