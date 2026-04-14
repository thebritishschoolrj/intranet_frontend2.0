import { Link, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import {
  LayoutDashboard, Newspaper, FileText, Users, BookOpen,
  Building2, Shield, ClipboardList, ChevronLeft, ChevronRight,
  Menu, X, Globe, Bell, User, Search, LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/hooks/use-i18n";
import { useAuth } from "@/contexts/auth-context";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { cn } from "@/lib/utils";
import type { Permission } from "@/types/domain";

const navItems: { key: string; icon: typeof LayoutDashboard; href: string; badge?: number; requiredPermission?: Permission }[] = [
  { key: "nav.dashboard", icon: LayoutDashboard, href: "/" },
  { key: "nav.news", icon: Newspaper, href: "/noticias", badge: 3 },
  { key: "nav.documents", icon: FileText, href: "/documentos" },
  { key: "nav.procedures", icon: ClipboardList, href: "/procedimentos" },
  { key: "nav.employees", icon: Users, href: "/colaboradores" },
  { key: "nav.departments", icon: Building2, href: "/departamentos" },
  { key: "nav.institutional", icon: BookOpen, href: "/institucional" },
  { key: "nav.admin", icon: Shield, href: "/admin", requiredPermission: "admin:access" },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t, lang, setLang } = useI18n();
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-background">
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-card transition-all duration-300",
          collapsed ? "w-[68px]" : "w-[240px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          {!collapsed && (
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <span className="text-sm font-bold text-primary-foreground">IN</span>
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Intranet</p>
                <p className="text-[10px] text-muted-foreground">{t("header.subtitle")}</p>
              </div>
            </Link>
          )}
          {collapsed && (
            <Link to="/" className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-primary-foreground">IN</span>
            </Link>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = item.href === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.href);

              const linkContent = (
                <li key={item.key}>
                  <Link
                    to={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    {!collapsed && <span className="truncate">{t(item.key)}</span>}
                    {!collapsed && item.badge && (
                      <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-bold text-destructive-foreground">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              );

              if (item.requiredPermission) {
                return (
                  <PermissionGuard key={item.key} permission={item.requiredPermission}>
                    {linkContent}
                  </PermissionGuard>
                );
              }

              return linkContent;
            })}
          </ul>
        </nav>

        {/* User info at bottom */}
        {isAuthenticated && !collapsed && (
          <div className="border-t border-border p-3">
            <div className="flex items-center gap-2 rounded-lg bg-secondary p-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {user?.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-foreground">{user?.name}</p>
                <p className="truncate text-[10px] capitalize text-muted-foreground">{user?.role}</p>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => logout()}>
                <LogOut className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </div>
          </div>
        )}

        <div className="hidden border-t border-border p-3 lg:block">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </aside>

      <div
        className={cn(
          "flex flex-1 flex-col transition-all duration-300",
          collapsed ? "lg:ml-[68px]" : "lg:ml-[240px]"
        )}
      >
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/80 px-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <div className="relative hidden w-72 md:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder={t("header.search")} className="pl-9 bg-secondary border-0" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLang(lang === "pt" ? "en" : "pt")}
              className="gap-1.5 text-xs"
            >
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">{lang === "pt" ? "EN" : "PT"}</span>
              <span className="text-[10px]">{lang === "pt" ? "🇬🇧" : "🇧🇷"}</span>
            </Button>
            {isAuthenticated && (
              <>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">3</span>
                </Button>
                <div className="flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary">
                    <User className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <span className="hidden text-sm font-medium text-foreground md:block">{user?.name ?? t("header.user")}</span>
                </div>
              </>
            )}
            {!isAuthenticated && (
              <Link to="/login">
                <Button size="sm">{t("login.title")}</Button>
              </Link>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">{children}</main>

        <footer className="border-t border-border bg-card px-4 py-3">
          <p className="text-center text-xs text-muted-foreground">{t("footer.text")} — © {new Date().getFullYear()}</p>
        </footer>
      </div>
    </div>
  );
}
