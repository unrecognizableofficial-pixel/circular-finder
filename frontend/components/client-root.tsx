"use client";

import * as React from "react";
import { usePlatform } from "@/components/platform-state";

export default function ClientRoot({ children }: { children: React.ReactNode }) {
  const { themeMode, reducedMotion, accessibilityMode } = usePlatform();

  React.useEffect(() => {
    document.documentElement.dataset.theme = themeMode;
    document.documentElement.dataset.motion = reducedMotion ? "reduced" : "full";
    document.documentElement.dataset.accessibility = accessibilityMode ? "high" : "standard";
  }, [accessibilityMode, reducedMotion, themeMode]);

  return <>{children}</>;
}
