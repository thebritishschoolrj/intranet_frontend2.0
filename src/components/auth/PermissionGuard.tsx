// ─── Permission Guard ────────────────────────────────────────────────────────
// Conditionally renders children based on user permissions or roles.

import type { ReactNode } from "react";
import type { Permission, AppRole } from "@/types/domain";
import { useAuth } from "@/contexts/auth-context";

interface PermissionGuardProps {
  children: ReactNode;
  /** Require a specific permission */
  permission?: Permission;
  /** Require any of these permissions */
  anyPermission?: Permission[];
  /** Require a specific role */
  role?: AppRole;
  /** Require any of these roles */
  anyRole?: AppRole[];
  /** Require access to a specific department */
  department?: string;
  /** What to render when access is denied (default: nothing) */
  fallback?: ReactNode;
}

export function PermissionGuard({
  children,
  permission,
  anyPermission,
  role,
  anyRole,
  department,
  fallback = null,
}: PermissionGuardProps) {
  const { hasPermission, hasAnyPermission, hasRole, hasAnyRole, hasDepartmentAccess, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <>{fallback}</>;

  if (permission && !hasPermission(permission)) return <>{fallback}</>;
  if (anyPermission && !hasAnyPermission(anyPermission)) return <>{fallback}</>;
  if (role && !hasRole(role)) return <>{fallback}</>;
  if (anyRole && !hasAnyRole(anyRole)) return <>{fallback}</>;
  if (department && !hasDepartmentAccess(department)) return <>{fallback}</>;

  return <>{children}</>;
}
