"use client";

import { Copy, QrCode, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";

export const InvitationLink = () => {
  const [lightLoaded, setLightLoaded] = useState(false);
  const [darkLoaded, setDarkLoaded] = useState(false);

  const copy = (url: string) => {
    navigator.clipboard.writeText(url);
  };
  return (
    <div className="flex w-full items-center justify-between rounded-lg border p-4 shadow-sm backdrop-blur-xs">
      <div className="">アプリを友達に紹介する</div>

      <Dialog>
        <DialogTrigger asChild>
          <Button className="font-bold" size="lg">
            開く <QrCode />
          </Button>
        </DialogTrigger>
        <DialogContent
          className="flex h-dvh max-w-screen flex-col items-center justify-center gap-1 rounded-none"
          showCloseButton={false}
        >
          <div>
            <div className="mx-auto w-fit rounded-[22px] bg-[conic-gradient(at_50%_50%,#fb923c_0deg,#4ade80_90deg,#60a5fa_180deg,#f472b6_270deg,#fb923c_360deg)] p-1.5 dark:bg-[conic-gradient(at_50%_50%,#ea580c_0deg,#16a34a_90deg,#2563eb_180deg,#db2777_270deg,#ea580c_360deg)]">
              <Image
                className="rounded-[16px] bg-white"
                src="/apple-touch-icon.png"
                alt="MCPT Logo"
                width={80}
                height={80}
                priority
                unoptimized
              />
            </div>
            <DialogTitle className="text-center font-bold font-montserrat text-2xl">
              <span className="text-suit-diamond">M</span>
              <span className="text-suit-club">C</span>
              <span className="text-suit-spade">P</span>
              <span className="text-suit-heart">T</span>
            </DialogTitle>
          </div>
          <div className="flex items-center justify-center gap-x-2">
            <p className="text-sm">https://pokepra.vercel.app</p>
            <Button
              size="icon-sm"
              variant="outline"
              onClick={() => copy("https://pokepra.vercel.app")}
            >
              <Copy />
            </Button>
          </div>
          <div className="relative dark:hidden">
            <Image
              className={`transition-opacity duration-300 ${
                lightLoaded ? "opacity-100" : "opacity-0"
              }`}
              src="/qr.png"
              alt="Invitation QR Code"
              width={360}
              height={360}
              onLoadingComplete={() => setLightLoaded(true)}
            />
            {!lightLoaded && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="grid size-76 place-content-center rounded-xl bg-muted/40">
                  <Spinner className="size-12 text-muted-foreground/70" />
                </div>
              </div>
            )}
          </div>
          <div className="relative hidden dark:block">
            <Image
              className={`transition-opacity duration-300 ${
                darkLoaded ? "opacity-100" : "opacity-0"
              }`}
              src="/qr-dark.png"
              alt="Invitation QR Code"
              width={360}
              height={400}
              onLoadingComplete={() => setDarkLoaded(true)}
            />
            {!darkLoaded && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="grid size-76 place-content-center rounded-xl bg-muted/40">
                  <Spinner className="size-12 text-muted-foreground/70" />
                </div>
              </div>
            )}
          </div>
          <DialogClose asChild>
            <Button className="rounded-full" variant="outline" size="icon-lg">
              <X />
            </Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </div>
  );
};
