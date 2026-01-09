"use client";

import { ChevronsLeft } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

export const BackButton = () => {
  const pathname = usePathname();

  if (pathname === "/") return null;

  return (
    <div className="fixed top-2 left-2 z-50">
      <Button asChild variant="ghost">
        <Link href="/">
          <ChevronsLeft />
          back to Home
        </Link>
      </Button>
    </div>
  );
};
