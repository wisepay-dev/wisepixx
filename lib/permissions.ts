import { UserRole } from "@prisma/client";

export function hasRole(roles: UserRole[] | string[] | undefined, role: UserRole) {
  return Boolean(roles?.includes(role));
}

export function canAccessOwner(roles: UserRole[] | string[] | undefined) {
  return hasRole(roles, UserRole.OWNER);
}

export function canAccessAdmin(roles: UserRole[] | string[] | undefined) {
  return hasRole(roles, UserRole.ADMIN) || hasRole(roles, UserRole.OWNER);
}

export const ADMIN_PERMISSION_KEYS = [
  "kyc",
  "disputes",
  "support",
  "withdrawals",
  "listings",
  "moderation"
] as const;
