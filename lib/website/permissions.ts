import type { Permission, WebsiteResponse } from "@/lib/api/types";

/** True for the Owner (implicitly has every permission) or a Manager who was explicitly granted this one. Mirrors WebsiteAccessGuard.requirePermission on the backend - the real enforcement stays server-side, this only drives UI hiding. */
export function hasPermission(website: Pick<WebsiteResponse, "role" | "permissions">, permission: Permission): boolean {
  if (website.role === "OWNER" || website.role === null) return true;
  return website.permissions.includes(permission);
}
