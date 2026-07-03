"use client";

import { useEffect, useState } from "react";
import { Setting } from "@/features/setting";

export const SettingButton = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="fixed top-0 right-0 z-50">
      <Setting />
    </div>
  );
};
