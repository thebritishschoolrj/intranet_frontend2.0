import { useState, useEffect, useRef, useCallback } from "react";
import { Bell, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth-context";
import { useNavigate } from "@tanstack/react-router";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

export function NotificationsDropdown() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("notifications" as any)
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);

    setNotifications(
      (data ?? []).map((n: any) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        link: n.link,
        isRead: n.is_read,
        createdAt: n.created_at,
      }))
    );
  }, [user]);

  useEffect(() => { void load(); }, [load]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAsRead = async (id: string) => {
    await supabase.from("notifications" as any).update({ is_read: true } as any).eq("id", id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllRead = async () => {
    if (!user) return;
    await supabase.from("notifications" as any).update({ is_read: true } as any).eq("user_id", user.id).eq("is_read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleClick = async (n: Notification) => {
    if (!n.isRead) await markAsRead(n.id);
    if (n.link) {
      setOpen(false);
      navigate({ to: n.link as any });
    }
  };

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="ghost"
        size="icon"
        className="relative h-8 w-8"
        onClick={() => { setOpen(!open); if (!open) void load(); }}
      >
        <Bell className="h-4 w-4 text-muted-foreground" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-corporate-red text-[9px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-80 rounded-lg border border-border bg-card shadow-lg">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <span className="text-sm font-semibold text-foreground">Notificações</span>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" className="h-auto py-0.5 text-xs text-primary" onClick={markAllRead}>
                <Check className="mr-1 h-3 w-3" /> Marcar todas como lidas
              </Button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">Nenhuma notificação</p>
            )}
            {notifications.map((n) => (
              <button
                key={n.id}
                className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-accent ${!n.isRead ? "bg-primary/5" : ""}`}
                onClick={() => handleClick(n)}
              >
                <div className={`mt-1 h-2 w-2 shrink-0 rounded-full ${n.isRead ? "bg-transparent" : "bg-primary"}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground leading-tight">{n.title}</p>
                  {n.message && (
                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                  )}
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {new Date(n.createdAt).toLocaleDateString("pt-BR", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                {n.link && <ExternalLink className="mt-1 h-3 w-3 shrink-0 text-muted-foreground" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
