import { RoleKey } from "@prisma/client";

export function parseRoleKey(value: string): RoleKey | null {
  const normalized = value.toUpperCase().replaceAll("-", "_");
  return Object.values(RoleKey).includes(normalized as RoleKey) ? (normalized as RoleKey) : null;
}
