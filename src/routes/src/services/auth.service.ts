// ─── Auth Service ────────────────────────────────────────────────────────────
// Thin wrapper around Supabase Auth for convenience methods.

import { supabase } from "@/integrations/supabase/client";

class AuthService {
  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    return data;
  }

  async signup(email: string, password: string, name: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) throw new Error(error.message);
    return data;
  }

  async logout() {
    await supabase.auth.signOut();
  }

  async getSession() {
    const { data } = await supabase.auth.getSession();
    return data.session;
  }

  // Demo credentials for development convenience
  getDemoCredentials() {
    return [
      { email: "admin@empresa.com", role: "admin" as const, name: "Admin" },
      { email: "manager@empresa.com", role: "manager" as const, name: "Manager" },
      { email: "editor@empresa.com", role: "editor" as const, name: "Editor" },
      { email: "employee@empresa.com", role: "employee" as const, name: "Employee" },
    ];
  }
}

export const authService = new AuthService();
