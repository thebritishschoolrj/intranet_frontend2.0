// ─── Role Management Server Function ─────────────────────────────────────────
// Secure role changes: only admins can promote/demote users.

import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

function getAdminClient() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export const changeUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { targetUserId: string; newRole: string }) => {
    if (!input.targetUserId || !input.newRole) throw new Error("Missing required fields");
    const validRoles = ["admin", "manager", "editor", "employee"];
    if (!validRoles.includes(input.newRole)) throw new Error("Invalid role");
    return input;
  })
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const admin = getAdminClient();

    // Verify caller is admin
    const { data: callerRole } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .single();

    if (callerRole?.role !== "admin") {
      throw new Error("Only admins can change user roles");
    }

    // Prevent self-demotion from admin
    if (data.targetUserId === userId && data.newRole !== "admin") {
      throw new Error("Cannot demote yourself from admin");
    }

    // Update role
    const { error } = await admin
      .from("user_roles")
      .update({ role: data.newRole as "admin" | "manager" | "editor" | "employee" })
      .eq("user_id", data.targetUserId);

    if (error) throw new Error(error.message);

    // Audit log
    await admin.from("audit_logs").insert({
      user_id: userId,
      action: "change_role",
      resource: "user_roles",
      resource_id: data.targetUserId,
      details: {
        newRole: data.newRole,
        timestamp: new Date().toISOString(),
      },
    });

    return { success: true };
  });
