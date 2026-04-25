"use client";

import * as React from "react";
import { usePlatformExperience, type PlatformExperienceValue } from "@/components/use-platform-experience";

const PlatformStateContext = React.createContext<PlatformExperienceValue | null>(null);

export function PlatformStateProvider({ children }: { children: React.ReactNode }) {
  const value = usePlatformExperience();
  return <PlatformStateContext.Provider value={value}>{children}</PlatformStateContext.Provider>;
}

export function usePlatform() {
  const context = React.useContext(PlatformStateContext);
  if (!context) {
    throw new Error("usePlatform must be used inside PlatformStateProvider.");
  }
  return context;
}
