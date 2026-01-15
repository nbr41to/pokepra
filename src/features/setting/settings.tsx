"use client";

import { Settings } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SwitchMode } from "./switch-mode";

export const Setting = () => {
  const reload = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button className="rounded-full" variant="ghost" size="icon-lg">
          <Settings />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuPortal>
        <DropdownMenuContent side="bottom" className="mr-2">
          <DropdownMenuLabel className="text-xs opacity-60">
            Menu
          </DropdownMenuLabel>
          <DropdownMenuItem asChild>
            <Link href="/">トップへ戻る</Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={reload}>アプリを更新</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-xs opacity-60">
            My Settings
          </DropdownMenuLabel>
          <DropdownMenuGroup>
            <SwitchMode />
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenu>
  );
};
