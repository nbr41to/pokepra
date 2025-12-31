import { Settings } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SwitchMode } from "./switch-mode";

export const Setting = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-lg">
          <Settings />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent side="bottom" className="ml-2">
        <DropdownMenuItem asChild>
          <Link href="/">Go to Home</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>My Settings</DropdownMenuLabel>
        <DropdownMenuGroup>
          <SwitchMode />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
