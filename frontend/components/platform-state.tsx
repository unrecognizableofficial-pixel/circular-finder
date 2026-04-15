"use client";

import * as React from "react";
import { fetchBootstrap, fetchOutfits, fetchWardrobe, login as loginRequest, register as registerRequest } from "@/lib/api";
import type { BodyProfile, BootstrapPayload, Outfit, WardrobeInsights, WardrobeItem } from "@/types/platform";

type PlatformStateValue = {
  token: string;
  bootstrap: BootstrapPayload | null;
  loading: boolean;
  error: string;
  userLabel: string;
  bodyProfiles: BodyProfile[];
  selectedProfileId: string;
  selectedProfile: BodyProfile | null;
  setSelectedProfileId: (id: string) => void;
  saveBodyProfile: (profile: Omit<BodyProfile, "id"> & { id?: string }) => void;
  removeBodyProfile: (id: string) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshBootstrap: () => Promise<void>;
  refreshWardrobe: () => Promise<void>;
  refreshOutfits: () => Promise<void>;
  setBootstrap: React.Dispatch<React.SetStateAction<BootstrapPayload | null>>;
};

const PlatformStateContext = React.createContext<PlatformStateValue | null>(null);

const TOKEN_STORAGE_KEY = "circular-finder-live-token";
const BODY_PROFILE_STORAGE_KEY = "circular-finder-body-profiles";
const SELECTED_PROFILE_STORAGE_KEY = "circular-finder-selected-profile";

export function PlatformStateProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = React.useState("");
  const [bootstrap, setBootstrap] = React.useState<BootstrapPayload | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [bodyProfiles, setBodyProfiles] = React.useState<BodyProfile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = React.useState("");

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedToken = window.localStorage.getItem(TOKEN_STORAGE_KEY) || "";
    const storedProfiles = window.localStorage.getItem(BODY_PROFILE_STORAGE_KEY);
    const storedSelectedProfile = window.localStorage.getItem(SELECTED_PROFILE_STORAGE_KEY) || "";

    setToken(storedToken);
    if (storedProfiles) {
      try {
        setBodyProfiles(JSON.parse(storedProfiles) as BodyProfile[]);
      } catch {
        setBodyProfiles([]);
      }
    }
    setSelectedProfileId(storedSelectedProfile);
  }, []);

  const refreshBootstrap = React.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const payload = await fetchBootstrap(token || undefined);
      setBootstrap(payload);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Could not load platform data.");
      setBootstrap(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  React.useEffect(() => {
    void refreshBootstrap();
  }, [refreshBootstrap]);

  const persistProfiles = React.useCallback((nextProfiles: BodyProfile[], nextSelectedId?: string) => {
    setBodyProfiles(nextProfiles);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(BODY_PROFILE_STORAGE_KEY, JSON.stringify(nextProfiles));
    }

    if (nextSelectedId !== undefined) {
      setSelectedProfileId(nextSelectedId);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(SELECTED_PROFILE_STORAGE_KEY, nextSelectedId);
      }
    }
  }, []);

  const saveBodyProfile = React.useCallback(
    (profile: Omit<BodyProfile, "id"> & { id?: string }) => {
      const nextId = profile.id ?? crypto.randomUUID();
      const nextProfile: BodyProfile = { ...profile, id: nextId };
      const nextProfiles = [...bodyProfiles.filter((item) => item.id !== nextId), nextProfile];
      persistProfiles(nextProfiles, nextId);
    },
    [bodyProfiles, persistProfiles]
  );

  const removeBodyProfile = React.useCallback(
    (id: string) => {
      const nextProfiles = bodyProfiles.filter((item) => item.id !== id);
      const nextSelectedId = selectedProfileId === id ? nextProfiles[0]?.id ?? "" : selectedProfileId;
      persistProfiles(nextProfiles, nextSelectedId);
    },
    [bodyProfiles, persistProfiles, selectedProfileId]
  );

  const setSelectedProfile = React.useCallback((id: string) => {
    setSelectedProfileId(id);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(SELECTED_PROFILE_STORAGE_KEY, id);
    }
  }, []);

  const login = React.useCallback(async (email: string, password: string) => {
    const payload = await loginRequest(email, password);
    setToken(payload.token);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(TOKEN_STORAGE_KEY, payload.token);
    }
  }, []);

  const register = React.useCallback(async (fullName: string, email: string, password: string) => {
    const payload = await registerRequest(fullName, email, password);
    setToken(payload.token);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(TOKEN_STORAGE_KEY, payload.token);
    }
  }, []);

  const logout = React.useCallback(() => {
    setToken("");
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  }, []);

  React.useEffect(() => {
    if (token && typeof window !== "undefined") {
      window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
    }
    if (!token && typeof window !== "undefined") {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  }, [token]);

  const refreshWardrobe = React.useCallback(async () => {
    if (!token) {
      return;
    }
    const payload = await fetchWardrobe(token);
    setBootstrap((current) => {
      if (!current || !current.user) {
        return current;
      }
      return {
        ...current,
        user: {
          ...current.user,
          wardrobe: payload.items,
          insights: payload.insights,
          outfits: payload.outfits
        }
      };
    });
  }, [token]);

  const refreshOutfits = React.useCallback(async () => {
    if (!token) {
      return;
    }
    const payload = await fetchOutfits(token);
    setBootstrap((current) => {
      if (!current || !current.user) {
        return current;
      }
      return {
        ...current,
        user: {
          ...current.user,
          outfits: payload.items
        }
      };
    });
  }, [token]);

  const selectedProfile = bodyProfiles.find((item) => item.id === selectedProfileId) ?? bodyProfiles[0] ?? null;
  const userLabel = bootstrap?.user?.profile?.email ?? "Local preview";

  const value = React.useMemo<PlatformStateValue>(
    () => ({
      token,
      bootstrap,
      loading,
      error,
      userLabel,
      bodyProfiles,
      selectedProfileId,
      selectedProfile,
      setSelectedProfileId: setSelectedProfile,
      saveBodyProfile,
      removeBodyProfile,
      login,
      register,
      logout,
      refreshBootstrap,
      refreshWardrobe,
      refreshOutfits,
      setBootstrap
    }),
    [
      token,
      bootstrap,
      loading,
      error,
      userLabel,
      bodyProfiles,
      selectedProfileId,
      selectedProfile,
      setSelectedProfile,
      saveBodyProfile,
      removeBodyProfile,
      login,
      register,
      logout,
      refreshBootstrap,
      refreshWardrobe,
      refreshOutfits
    ]
  );

  return <PlatformStateContext.Provider value={value}>{children}</PlatformStateContext.Provider>;
}

export function usePlatform() {
  const context = React.useContext(PlatformStateContext);
  if (!context) {
    throw new Error("usePlatform must be used inside PlatformStateProvider.");
  }
  return context;
}
