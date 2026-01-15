"use client";

import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef } from "react";

const HOME_SCROLL_KEY = "mcpt:home-scroll";
const HOME_WINDOW_SCROLL_KEY = "mcpt:home-window-scroll";
export const HOME_TAB_KEY = "mcpt:home-tab";
export const HOME_SCROLL_CONTAINER_ID = "home-scroll-container";

const readScrollValue = (key: string) => {
  const raw = sessionStorage.getItem(key);
  const y = raw ? Number(raw) : 0;
  return Number.isNaN(y) ? 0 : y;
};

type RestoreHomeScrollProps = {
  onRestoreTab?: (value: string) => void;
  tabValue?: string;
};

/**
 * Homeのスクロール位置とTabを保存して復元する
 */
export const RestoreHomeScroll = ({
  onRestoreTab,
  tabValue,
}: RestoreHomeScrollProps) => {
  const pathname = usePathname();
  const prevTabValue = useRef<string | null>(null);

  useLayoutEffect(() => {
    if (pathname !== "/") return;

    const container = document.getElementById(HOME_SCROLL_CONTAINER_ID);

    const restore = () => {
      if (container && container.scrollHeight > container.clientHeight) {
        container.scrollTo({
          top: readScrollValue(HOME_SCROLL_KEY),
          behavior: "auto",
        });
      } else {
        window.scrollTo(0, readScrollValue(HOME_WINDOW_SCROLL_KEY));
      }
    };

    if (onRestoreTab) {
      const storedTab = sessionStorage.getItem(HOME_TAB_KEY);
      if (storedTab) {
        onRestoreTab(storedTab);
      }
    }

    restore();
    const raf = requestAnimationFrame(restore);
    const timeout = window.setTimeout(restore, 0);

    const handleContainerScroll = () => {
      if (!container) return;
      sessionStorage.setItem(HOME_SCROLL_KEY, String(container.scrollTop));
    };

    const handleWindowScroll = () => {
      sessionStorage.setItem(HOME_WINDOW_SCROLL_KEY, String(window.scrollY));
    };

    handleContainerScroll();
    handleWindowScroll();

    container?.addEventListener("scroll", handleContainerScroll, {
      passive: true,
    });
    window.addEventListener("scroll", handleWindowScroll, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timeout);
      container?.removeEventListener("scroll", handleContainerScroll);
      window.removeEventListener("scroll", handleWindowScroll);
    };
  }, [onRestoreTab, pathname]);

  useEffect(() => {
    if (!tabValue) return;
    sessionStorage.setItem(HOME_TAB_KEY, tabValue);
  }, [tabValue]);

  useEffect(() => {
    if (!tabValue || pathname !== "/") {
      prevTabValue.current = tabValue ?? null;
      return;
    }
    const previous = prevTabValue.current;
    if (previous && previous !== tabValue) {
      const container = document.getElementById(HOME_SCROLL_CONTAINER_ID);
      if (container && container.scrollHeight > container.clientHeight) {
        container.scrollTo({ top: 0, behavior: "auto" });
        sessionStorage.setItem(HOME_SCROLL_KEY, "0");
      } else {
        window.scrollTo(0, 0);
        sessionStorage.setItem(HOME_WINDOW_SCROLL_KEY, "0");
      }
    }
    prevTabValue.current = tabValue;
  }, [tabValue, pathname]);

  return null;
};
