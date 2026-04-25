"use client";

import React, { createContext, useContext, useState, type ReactNode } from "react";
import { getRoleById, type DemoRole, type DemoRoleId } from "@/lib/roles";

interface RoleContextType {
  role: DemoRole | null;
  setRoleId: (roleId: DemoRoleId | null) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<DemoRole | null>(null);

  return (
    <RoleContext.Provider
      value={{
        role,
        setRoleId: (roleId) => setRole(roleId ? getRoleById(roleId) : null)
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used within RoleProvider");
  }
  return context;
}
