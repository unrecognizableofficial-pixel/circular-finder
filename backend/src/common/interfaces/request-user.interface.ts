import type { RoleKey } from "@prisma/client";

export interface RequestUser {
  sub: string;
  email: string;
  role: RoleKey;
  permissions: string[];
  sessionId?: string;
}
