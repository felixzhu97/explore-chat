import type { User } from "@/auth/user.model";
import { mapUser } from "@/auth/user.model";

export function mapUnknownToUser(data: unknown): User {
  return mapUser(data as Parameters<typeof mapUser>[0]);
}
