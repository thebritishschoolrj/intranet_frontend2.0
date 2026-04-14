// ─── Authenticated Layout Route ──────────────────────────────────────────────
import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";
import { getRouteAuthState } from "@/lib/auth-guard";

export const Route = createFileRoute("/src/routes/_authenticated")({
  beforeLoad: async () => {
    const auth = await getRouteAuthState();
    if (!auth.isAuthenticated) {
      throw redirect({ to: "/login" });
    }
    return { auth };
  },
  component: () => <Outlet />,
});
