"use client";

import { useEffect, useState } from "react";
import { Spinner } from "@/components/shadcn/spinner";

const READY_MESSAGE = "sw-ready";

export const ServiceWorkerRegister = () => {
  const [ready, setReady] = useState(process.env.NODE_ENV !== "production");

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) {
      setReady(true);
      return;
    }

    const onMessage = (event: MessageEvent) => {
      if (event.data?.type === READY_MESSAGE) {
        setReady(true);
      }
    };

    navigator.serviceWorker.addEventListener("message", onMessage);

    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        if (registration.active) {
          setReady(true);
          return;
        }

        const installing = registration.installing ?? registration.waiting;
        if (!installing) return;

        const onStateChange = () => {
          if (installing.state === "activated") {
            setReady(true);
            installing.removeEventListener("statechange", onStateChange);
          }
        };

        installing.addEventListener("statechange", onStateChange);
      })
      .catch(() => setReady(true));

    return () => {
      navigator.serviceWorker.removeEventListener("message", onMessage);
    };
  }, []);

  if (ready) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur">
      <div className="flex flex-col items-center gap-3 rounded-2xl border bg-card px-16 py-5 shadow-lg">
        <Spinner className="size-10 text-muted-foreground" />
        <p className="text-muted-foreground text-sm">waiting...</p>
      </div>
    </div>
  );
};
