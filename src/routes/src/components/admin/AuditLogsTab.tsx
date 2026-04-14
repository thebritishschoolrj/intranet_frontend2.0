// ─── Audit Logs Tab ──────────────────────────────────────────────────────────
// Admin panel tab showing filterable, paginated audit trail.

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { pt, enUS } from "date-fns/locale";
import {
  Search, Filter, ChevronLeft, ChevronRight, Clock,
  FileText, Newspaper, ClipboardList, Users, BookOpen,
  Shield, Trash2, Send, Archive, Plus, Pencil, Eye,
  ToggleLeft, Upload, AlertCircle, RefreshCw,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { auditService, type AuditLogEntry, type AuditQueryFilters } from "@/services/data.service";

// ─── Action / Resource labels & icons ────────────────────────────────────────

const ACTION_LABELS: Record<string, { label: string; labelEn: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  create: { label: "Criação", labelEn: "Create", variant: "default" },
  edit: { label: "Edição", labelEn: "Edit", variant: "secondary" },
  update: { label: "Atualização", labelEn: "Update", variant: "secondary" },
  delete: { label: "Exclusão", labelEn: "Delete", variant: "destructive" },
  publish: { label: "Publicação", labelEn: "Publish", variant: "default" },
  archive: { label: "Arquivamento", labelEn: "Archive", variant: "outline" },
  send_to_review: { label: "Envio p/ Revisão", labelEn: "Sent to Review", variant: "outline" },
  activate: { label: "Ativação", labelEn: "Activate", variant: "default" },
  deactivate: { label: "Desativação", labelEn: "Deactivate", variant: "outline" },
  replace_file: { label: "Substituir Arquivo", labelEn: "Replace File", variant: "secondary" },
  change_role: { label: "Alterar Papel", labelEn: "Change Role", variant: "default" },
};

const RESOURCE_CONFIG: Record<string, { label: string; labelEn: string; icon: typeof FileText }> = {
  news: { label: "Notícias", labelEn: "News", icon: Newspaper },
  documents: { label: "Documentos", labelEn: "Documents", icon: FileText },
  procedures: { label: "Procedimentos", labelEn: "Procedures", icon: ClipboardList },
  profiles: { label: "Colaboradores", labelEn: "Employees", icon: Users },
  institutional_page: { label: "Institucional", labelEn: "Institutional", icon: BookOpen },
  user_roles: { label: "Papéis", labelEn: "Roles", icon: Shield },
};

const ACTION_ICONS: Record<string, typeof Plus> = {
  create: Plus,
  edit: Pencil,
  update: Pencil,
  delete: Trash2,
  publish: Send,
  archive: Archive,
  send_to_review: Send,
  activate: ToggleLeft,
  deactivate: ToggleLeft,
  replace_file: Upload,
  change_role: Shield,
};

function getActionLabel(action: string, lang: string): string {
  const cfg = ACTION_LABELS[action];
  if (cfg) return lang === "pt" ? cfg.label : cfg.labelEn;
  return action.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function getResourceLabel(resource: string, lang: string): string {
  const cfg = RESOURCE_CONFIG[resource];
  if (cfg) return lang === "pt" ? cfg.label : cfg.labelEn;
  return resource.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDetails(details: Record<string, unknown>, lang: string): string {
  if (!details || Object.keys(details).length === 0) return "";
  const parts: string[] = [];
  if (details.title) parts.push(`"${details.title}"`);
  if (details.name) parts.push(`${details.name}`);
  if (details.previousStatus) parts.push(`${lang === "pt" ? "de" : "from"} ${details.previousStatus}`);
  if (details.newStatus) parts.push(`${lang === "pt" ? "para" : "to"} ${details.newStatus}`);
  if (details.version) parts.push(`v${details.version}`);
  if (details.fileName) parts.push(`📎 ${details.fileName}`);
  return parts.join(" · ");
}

// ─── Component ───────────────────────────────────────────────────────────────

interface AuditLogsTabProps {
  t: (key: string) => string;
  lang: string;
}

export function AuditLogsTab({ t, lang }: AuditLogsTabProps) {
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailEntry, setDetailEntry] = useState<AuditLogEntry | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [resourceFilter, setResourceFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 25;

  // Available filter options
  const [availableActions, setAvailableActions] = useState<string[]>([]);
  const [availableResources, setAvailableResources] = useState<string[]>([]);

  useEffect(() => {
    Promise.all([
      auditService.getDistinctActions(),
      auditService.getDistinctResources(),
    ]).then(([actions, resources]) => {
      setAvailableActions(actions);
      setAvailableResources(resources);
    });
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filters: AuditQueryFilters = {
        page,
        perPage,
        search: search || undefined,
        action: actionFilter !== "all" ? actionFilter : undefined,
        resource: resourceFilter !== "all" ? resourceFilter : undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo ? `${dateTo}T23:59:59Z` : undefined,
      };
      const result = await auditService.query(filters);
      setEntries(result.entries);
      setTotal(result.total);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, search, actionFilter, resourceFilter, dateFrom, dateTo]);

  useEffect(() => { loadData(); }, [loadData]);

  const totalPages = Math.ceil(total / perPage);
  const locale = lang === "pt" ? pt : enUS;

  const clearFilters = () => {
    setSearch("");
    setActionFilter("all");
    setResourceFilter("all");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  const hasFilters = search || actionFilter !== "all" || resourceFilter !== "all" || dateFrom || dateTo;

  return (
    <div className="space-y-4">
      {/* ─── Filters ─── */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-wrap items-end gap-3">
            {/* Search */}
            <div className="min-w-[200px] flex-1">
              <Label className="mb-1.5 text-xs text-muted-foreground">
                <Search className="mr-1 inline h-3 w-3" />
                {lang === "pt" ? "Buscar" : "Search"}
              </Label>
              <Input
                placeholder={lang === "pt" ? "Buscar ação ou recurso..." : "Search action or resource..."}
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="h-8 text-sm"
              />
            </div>

            {/* Action filter */}
            <div className="min-w-[150px]">
              <Label className="mb-1.5 text-xs text-muted-foreground">
                {lang === "pt" ? "Ação" : "Action"}
              </Label>
              <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v); setPage(1); }}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{lang === "pt" ? "Todas" : "All"}</SelectItem>
                  {availableActions.map((a) => (
                    <SelectItem key={a} value={a}>{getActionLabel(a, lang)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Resource filter */}
            <div className="min-w-[150px]">
              <Label className="mb-1.5 text-xs text-muted-foreground">
                {lang === "pt" ? "Recurso" : "Resource"}
              </Label>
              <Select value={resourceFilter} onValueChange={(v) => { setResourceFilter(v); setPage(1); }}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{lang === "pt" ? "Todos" : "All"}</SelectItem>
                  {availableResources.map((r) => (
                    <SelectItem key={r} value={r}>{getResourceLabel(r, lang)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date from */}
            <div className="min-w-[140px]">
              <Label className="mb-1.5 text-xs text-muted-foreground">
                {lang === "pt" ? "De" : "From"}
              </Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                className="h-8 text-sm"
              />
            </div>

            {/* Date to */}
            <div className="min-w-[140px]">
              <Label className="mb-1.5 text-xs text-muted-foreground">
                {lang === "pt" ? "Até" : "To"}
              </Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                className="h-8 text-sm"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={loadData} className="h-8 gap-1">
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
              {hasFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 text-xs">
                  {lang === "pt" ? "Limpar" : "Clear"}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── Results info ─── */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {total} {lang === "pt" ? "registros" : "records"}
          {hasFilters && ` (${lang === "pt" ? "filtrado" : "filtered"})`}
        </span>
        {totalPages > 1 && (
          <span>
            {lang === "pt" ? "Página" : "Page"} {page}/{totalPages}
          </span>
        )}
      </div>

      {/* ─── Error ─── */}
      {error && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex items-center gap-2 py-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </CardContent>
        </Card>
      )}

      {/* ─── Loading ─── */}
      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      )}

      {/* ─── Empty ─── */}
      {!loading && !error && entries.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Shield className="mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm font-medium text-foreground">
              {lang === "pt" ? "Nenhum registro encontrado" : "No records found"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {hasFilters
                ? (lang === "pt" ? "Tente ajustar os filtros" : "Try adjusting your filters")
                : (lang === "pt" ? "As ações serão registradas aqui automaticamente" : "Actions will be logged here automatically")}
            </p>
          </CardContent>
        </Card>
      )}

      {/* ─── Table ─── */}
      {!loading && !error && entries.length > 0 && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                    {lang === "pt" ? "Data/Hora" : "Date/Time"}
                  </th>
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                    {lang === "pt" ? "Ação" : "Action"}
                  </th>
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                    {lang === "pt" ? "Recurso" : "Resource"}
                  </th>
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                    {lang === "pt" ? "Usuário" : "User"}
                  </th>
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                    {lang === "pt" ? "Resumo" : "Summary"}
                  </th>
                  <th className="px-4 py-2.5 text-right font-medium text-muted-foreground" />
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => {
                  const ActionIcon = ACTION_ICONS[entry.action] ?? Eye;
                  const ResourceIcon = RESOURCE_CONFIG[entry.resource]?.icon ?? FileText;
                  const actionCfg = ACTION_LABELS[entry.action];
                  const summary = formatDetails(entry.details, lang);

                  return (
                    <tr
                      key={entry.id}
                      className="border-b last:border-b-0 transition-colors hover:bg-muted/20 cursor-pointer"
                      onClick={() => setDetailEntry(entry)}
                    >
                      <td className="whitespace-nowrap px-4 py-2.5">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {format(new Date(entry.createdAt), "dd/MM/yyyy HH:mm", { locale })}
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <Badge
                          variant={actionCfg?.variant ?? "outline"}
                          className="gap-1 text-xs"
                        >
                          <ActionIcon className="h-3 w-3" />
                          {getActionLabel(entry.action, lang)}
                        </Badge>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1.5 text-xs">
                          <ResourceIcon className="h-3.5 w-3.5 text-muted-foreground" />
                          {getResourceLabel(entry.resource, lang)}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground">
                        {(entry.details as any)?.userEmail ?? entry.userId?.slice(0, 8) ?? "—"}
                      </td>
                      <td className="max-w-[250px] truncate px-4 py-2.5 text-xs text-muted-foreground">
                        {summary || "—"}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <Button variant="ghost" size="sm" className="h-7 text-xs">
                          <Eye className="h-3 w-3" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ─── Pagination ─── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="h-8 gap-1"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            {lang === "pt" ? "Anterior" : "Previous"}
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              return (
                <Button
                  key={pageNum}
                  variant={pageNum === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPage(pageNum)}
                  className="h-8 w-8 p-0 text-xs"
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="h-8 gap-1"
          >
            {lang === "pt" ? "Próxima" : "Next"}
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {/* ─── Detail Dialog ─── */}
      <Dialog open={!!detailEntry} onOpenChange={() => setDetailEntry(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              {lang === "pt" ? "Detalhes do Registro" : "Log Details"}
            </DialogTitle>
          </DialogHeader>
          {detailEntry && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    {lang === "pt" ? "Data/Hora" : "Date/Time"}
                  </p>
                  <p className="mt-0.5">
                    {format(new Date(detailEntry.createdAt), "dd/MM/yyyy HH:mm:ss", { locale })}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    {lang === "pt" ? "Ação" : "Action"}
                  </p>
                  <Badge variant={ACTION_LABELS[detailEntry.action]?.variant ?? "outline"} className="mt-0.5 gap-1">
                    {getActionLabel(detailEntry.action, lang)}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    {lang === "pt" ? "Recurso" : "Resource"}
                  </p>
                  <p className="mt-0.5">{getResourceLabel(detailEntry.resource, lang)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    {lang === "pt" ? "Usuário" : "User"}
                  </p>
                  <p className="mt-0.5 text-xs">
                    {(detailEntry.details as any)?.userEmail ?? detailEntry.userId ?? "—"}
                  </p>
                </div>
              </div>

              {detailEntry.resourceId && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Resource ID</p>
                  <code className="mt-0.5 block rounded bg-muted px-2 py-1 font-mono text-xs">
                    {detailEntry.resourceId}
                  </code>
                </div>
              )}

              <Separator />

              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  {lang === "pt" ? "Detalhes" : "Details"}
                </p>
                <div className="rounded-lg border bg-muted/30 p-3">
                  {Object.entries(detailEntry.details)
                    .filter(([key]) => key !== "timestamp" && key !== "userEmail")
                    .map(([key, value]) => (
                      <div key={key} className="flex items-start justify-between py-1 text-xs">
                        <span className="font-medium text-muted-foreground">
                          {key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}
                        </span>
                        <span className="ml-4 max-w-[200px] text-right text-foreground">
                          {typeof value === "object" ? JSON.stringify(value) : String(value ?? "—")}
                        </span>
                      </div>
                    ))}
                  {Object.keys(detailEntry.details).filter((k) => k !== "timestamp" && k !== "userEmail").length === 0 && (
                    <p className="text-xs text-muted-foreground italic">
                      {lang === "pt" ? "Sem detalhes adicionais" : "No additional details"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
