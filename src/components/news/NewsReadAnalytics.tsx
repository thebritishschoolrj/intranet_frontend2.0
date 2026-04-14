import { useState, useEffect, useCallback } from "react";
import { BarChart3, Eye, CheckCircle2, Users, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth-context";

interface ViewRecord {
  userName: string;
  viewedAt: string;
}

interface AckRecord {
  userName: string;
  acknowledgedAt: string;
}

interface PendingUser {
  name: string;
  department: string;
}

interface Props {
  newsId: string;
  isMandatory: boolean;
}

export function NewsReadAnalytics({ newsId, isMandatory }: Props) {
  const { hasAnyRole } = useAuth();
  const [viewCount, setViewCount] = useState(0);
  const [ackCount, setAckCount] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [viewers, setViewers] = useState<ViewRecord[]>([]);
  const [acknowledgers, setAcknowledgers] = useState<AckRecord[]>([]);
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPending, setShowPending] = useState(false);

  const canView = hasAnyRole(["admin", "manager"]);

  const load = useCallback(async () => {
    if (!canView) { setLoading(false); return; }
    try {
      // Get views count (unique via constraint)
      const { count: viewsCount } = await supabase
        .from("news_views" as any)
        .select("*", { count: "exact", head: true })
        .eq("news_id", newsId);

      setViewCount(viewsCount ?? 0);

      // Get recent viewers
      const { data: viewsData } = await supabase
        .from("news_views" as any)
        .select("*")
        .eq("news_id", newsId)
        .order("viewed_at", { ascending: false })
        .limit(20);

      const viewData = (viewsData ?? []) as any[];

      let ackData: any[] = [];
      if (isMandatory) {
        const { data: acksData, count: acksCount } = await supabase
          .from("news_acknowledgments" as any)
          .select("*", { count: "exact" })
          .eq("news_id", newsId)
          .order("acknowledged_at", { ascending: false })
          .limit(20);
        ackData = (acksData ?? []) as any[];
        setAckCount(acksCount ?? 0);
      }

      // Get total active users for compliance %
      const { count: usersCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");
      setTotalUsers(usersCount ?? 0);

      // Get profile names
      const allUserIds = [...new Set([...viewData.map((v: any) => v.user_id), ...ackData.map((a: any) => a.user_id)])];
      let profileMap: Record<string, string> = {};
      if (allUserIds.length > 0) {
        const { data: profiles } = await supabase.from("profiles").select("user_id, name").in("user_id", allUserIds);
        for (const p of profiles ?? []) profileMap[p.user_id] = p.name;
      }

      setViewers(viewData.map((v: any) => ({ userName: profileMap[v.user_id] ?? "Usuário", viewedAt: v.viewed_at })));
      setAcknowledgers(ackData.map((a: any) => ({ userName: profileMap[a.user_id] ?? "Usuário", acknowledgedAt: a.acknowledged_at })));

      // Get pending acknowledgments for mandatory news
      if (isMandatory && ackData.length > 0) {
        const ackedIds = ackData.map((a: any) => a.user_id);
        const { data: pendingProfiles } = await supabase
          .from("profiles")
          .select("name, department")
          .eq("status", "active")
          .not("user_id", "in", `(${ackedIds.join(",")})`);
        setPendingUsers((pendingProfiles ?? []).map((p) => ({ name: p.name, department: p.department })));
      } else if (isMandatory) {
        const { data: allProfiles } = await supabase
          .from("profiles")
          .select("name, department")
          .eq("status", "active");
        setPendingUsers((allProfiles ?? []).map((p) => ({ name: p.name, department: p.department })));
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [newsId, canView, isMandatory]);

  useEffect(() => { void load(); }, [load]);

  if (!canView || loading) return null;

  const ackPercent = isMandatory && totalUsers > 0 ? Math.round((ackCount / totalUsers) * 100) : 0;
  const viewPercent = totalUsers > 0 ? Math.round((viewCount / totalUsers) * 100) : 0;

  return (
    <Card>
      <CardContent className="p-5">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
          <BarChart3 className="h-4 w-4" />
          Análise de Leitura
        </h3>

        <div className={`grid gap-4 mb-4 ${isMandatory ? "grid-cols-3" : "grid-cols-2"}`}>
          <div className="rounded-lg border border-border bg-background p-3 text-center">
            <Eye className="mx-auto mb-1 h-5 w-5 text-muted-foreground" />
            <p className="text-2xl font-bold text-foreground">{viewCount}</p>
            <p className="text-xs text-muted-foreground">Visualizações únicas</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{viewPercent}% dos usuários</p>
          </div>
          {isMandatory && (
            <>
              <div className="rounded-lg border border-border bg-background p-3 text-center">
                <CheckCircle2 className="mx-auto mb-1 h-5 w-5 text-green-500" />
                <p className="text-2xl font-bold text-foreground">{ackCount}</p>
                <p className="text-xs text-muted-foreground">Confirmações</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{ackPercent}% conformidade</p>
              </div>
              <div className="rounded-lg border border-border bg-background p-3 text-center">
                <AlertCircle className="mx-auto mb-1 h-5 w-5 text-amber-500" />
                <p className="text-2xl font-bold text-foreground">{pendingUsers.length}</p>
                <p className="text-xs text-muted-foreground">Pendentes</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Aguardando confirmação</p>
              </div>
            </>
          )}
        </div>

        {/* Compliance progress bar for mandatory */}
        {isMandatory && totalUsers > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Conformidade</span>
              <span>{ackPercent}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-green-500 transition-all"
                style={{ width: `${ackPercent}%` }}
              />
            </div>
          </div>
        )}

        {viewers.length > 0 && (
          <>
            <Separator className="my-3" />
            <div>
              <h4 className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <Users className="h-3.5 w-3.5" /> Últimas visualizações
              </h4>
              <div className="max-h-40 overflow-y-auto space-y-1.5">
                {viewers.slice(0, 10).map((v, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="text-foreground">{v.userName}</span>
                    <span className="text-muted-foreground">
                      {new Date(v.viewedAt).toLocaleDateString("pt-BR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {isMandatory && acknowledgers.length > 0 && (
          <>
            <Separator className="my-3" />
            <div>
              <h4 className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <CheckCircle2 className="h-3.5 w-3.5" /> Confirmações de leitura
              </h4>
              <div className="max-h-40 overflow-y-auto space-y-1.5">
                {acknowledgers.slice(0, 10).map((a, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="text-foreground">{a.userName}</span>
                    <span className="text-muted-foreground">
                      {new Date(a.acknowledgedAt).toLocaleDateString("pt-BR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Pending acknowledgments */}
        {isMandatory && pendingUsers.length > 0 && (
          <>
            <Separator className="my-3" />
            <div>
              <button
                onClick={() => setShowPending(!showPending)}
                className="mb-2 flex w-full items-center justify-between text-xs font-medium text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5" /> Pendentes ({pendingUsers.length})
                </span>
                {showPending ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>
              {showPending && (
                <div className="max-h-48 overflow-y-auto space-y-1.5">
                  {pendingUsers.map((u, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="text-foreground">{u.name}</span>
                      <Badge variant="outline" className="text-[10px]">{u.department || "—"}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
