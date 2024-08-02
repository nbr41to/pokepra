"use client";

import { ChangeModeButton } from "@/components/ChangeModeButton";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { HiOutlineMenuAlt2 } from "react-icons/hi";

export const Header = () => {
  return (
    <>
      <header className="flex items-center justify-between border-b">
        <Sheet>
          <SheetTrigger>
            <HiOutlineMenuAlt2 size={24} />
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>Are you absolutely sure?</SheetTitle>
              <SheetDescription>
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers.
              </SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>

        <h1 className="font-bold">pokepra</h1>

        <ChangeModeButton />
      </header>
    </>
  );
};
