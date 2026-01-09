"use client";

import { useLayoutEffect } from "react";

const HOME_SCROLL_KEY = "mcpt:home-scroll";
const HOME_WINDOW_SCROLL_KEY = "mcpt:home-window-scroll";
const HOME_SCROLL_CONTAINER_ID = "home-scroll-container";

const readScrollValue = (key: string) => {
  const raw = sessionStorage.getItem(key);
  const y = raw ? Number(raw) : 0;
  return Number.isNaN(y) ? 0 : y;
};

/**
 * Homeのスクロール位置を保存して復元する
 */
export const RestoreHomeScroll = () => {
  useLayoutEffect(() => {
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
  }, []);

  return null;
};
