// ─── Auth Guard Utilities ────────────────────────────────────────────────────
// Server-compatible auth check for route-level guards (beforeLoad).
// Uses Supabase client directly since React context is not available in beforeLoad.

import { supabase } from "@/integrations/supabase/client";
import type { AppRole, Permission } from "@/types/domain";
import { ROLE_PERMISSIONS } from "@/types/domain";

export interface RouteAuthState {
  isAuthenticated: boolean;
  userId: string | null;
  role: AppRole | null;
}

let cachedAuth: RouteAuthState | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 2000; // 2s cache to avoid repeated queries during navigation

export async function getRouteAuthState(): Promise<RouteAuthState> {
  const now = Date.now();
  if (cachedAuth && now - cacheTimestamp < CACHE_TTL) {
    return cachedAuth;
  }

  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user) {
    cachedAuth = { isAuthenticated: false, userId: null, role: null };
    cacheTimestamp = now;
    return cachedAuth;
  }

  const { data: roleData } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", session.user.id)
    .single();

  const role: AppRole = (roleData?.role as AppRole) ?? "employee";

  cachedAuth = { isAuthenticated: true, userId: session.user.id, role };
  cacheTimestamp = now;
  return cachedAuth;
}

export function invalidateAuthCache() {
  cachedAuth = null;
  cacheTimestamp = 0;
}

export function hasRoutePermission(auth: RouteAuthState, permission: Permission): boolean {
  if (!auth.role) return false;
  return ROLE_PERMISSIONS[auth.role]?.includes(permission) ?? false;
}

export function hasRouteRole(auth: RouteAuthState, role: AppRole): boolean {
  return auth.role === role;
}

export function hasAnyRouteRole(auth: RouteAuthState, roles: AppRole[]): boolean {
  return auth.role ? roles.includes(auth.role) : false;
}
