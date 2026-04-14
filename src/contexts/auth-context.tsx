// ─── Auth Context ────────────────────────────────────────────────────────────
// Manages authentication state via Supabase Auth with profile + role loading.

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { invalidateAuthCache } from "@/lib/auth-guard";
import type { AppRole, Permission } from "@/types/domain";
import { ROLE_PERMISSIONS } from "@/types/domain";
import type { User as SupabaseUser, Session } from "@supabase/supabase-js";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  department: string;
  departmentSlug: string;
  position: string;
  role: AppRole;
  status: "active" | "inactive" | "suspended";
  preferredLanguage: "pt" | "en";
  avatar?: string;
  phone?: string;
  birthday?: string;
  joinedAt: string;
}

interface AuthContextType {
  user: AppUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasRole: (role: AppRole) => boolean;
  hasAnyRole: (roles: AppRole[]) => boolean;
  hasDepartmentAccess: (departmentSlug: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

async function loadAppUser(supabaseUser: SupabaseUser): Promise<AppUser | null> {
  // Load profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", supabaseUser.id)
    .single();

  if (!profile) return null;

  // Load role
  const { data: roleData } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", supabaseUser.id)
    .single();

  const role: AppRole = (roleData?.role as AppRole) ?? "employee";

  return {
    id: supabaseUser.id,
    name: profile.name,
    email: profile.email,
    employeeId: profile.employee_id,
    department: profile.department,
    departmentSlug: profile.department_slug,
    position: profile.position,
    role,
    status: profile.status as "active" | "inactive" | "suspended",
    preferredLanguage: (profile.preferred_language as "pt" | "en") ?? "pt",
    avatar: profile.avatar_url ?? undefined,
    phone: profile.phone ?? undefined,
    birthday: profile.birthday ?? undefined,
    joinedAt: profile.joined_at ?? profile.created_at,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Listen for auth state changes FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          // Use setTimeout to avoid Supabase deadlock on initial load
          setTimeout(async () => {
            const appUser = await loadAppUser(session.user);
            setUser(appUser);
            setIsLoading(false);
          }, 0);
        } else {
          setUser(null);
          setIsLoading(false);
        }
      }
    );

    // Then check existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const appUser = await loadAppUser(session.user);
        setUser(appUser);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setIsLoading(false);
      throw new Error(error.message);
    }
  }, []);

  const signup = useCallback(async (email: string, password: string, name: string) => {
    setIsLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) {
      setIsLoading(false);
      throw new Error(error.message);
    }
  }, []);

  const logout = useCallback(async () => {
    invalidateAuthCache();
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const hasPermission = useCallback((permission: Permission): boolean => {
    if (!user) return false;
    return ROLE_PERMISSIONS[user.role]?.includes(permission) ?? false;
  }, [user]);

  const hasAnyPermission = useCallback((permissions: Permission[]): boolean => {
    return permissions.some((p) => hasPermission(p));
  }, [hasPermission]);

  const hasRole = useCallback((role: AppRole): boolean => {
    return user?.role === role;
  }, [user]);

  const hasAnyRole = useCallback((roles: AppRole[]): boolean => {
    return user ? roles.includes(user.role) : false;
  }, [user]);

  const hasDepartmentAccess = useCallback((departmentSlug: string): boolean => {
    if (!user) return false;
    if (user.role === "admin") return true;
    return user.departmentSlug === departmentSlug;
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        hasPermission,
        hasAnyPermission,
        hasRole,
        hasAnyRole,
        hasDepartmentAccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
