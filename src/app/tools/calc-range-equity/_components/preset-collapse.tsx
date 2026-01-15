import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

type Props = {
  children: ReactNode;
};

export const PresetCollapse = ({ children }: Props) => {
  return (
    <Collapsible>
      <CollapsibleTrigger className="group mx-auto flex w-fit items-center gap-x-1 py-1 text-sm">
        ボードのプリセット
        <ChevronDown
          size={16}
          className="transition-transform group-data-[state=open]:rotate-180"
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="flex flex-wrap gap-2">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
};
