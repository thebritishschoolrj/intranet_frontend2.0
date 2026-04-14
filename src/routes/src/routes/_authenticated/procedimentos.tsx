import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Paperclip, History, ChevronDown, ChevronUp, ClipboardList, Search, Building2, Tag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AppLayout } from "@/components/layout/AppLayout";
import { useI18n } from "@/hooks/use-i18n";
import { proceduresService, departmentsService } from "@/services/data.service";
import type { Procedure } from "@/types/domain";

export const Route = createFileRoute("/src/routes/_authenticated/procedimentos")({
  component: ProceduresPage,
  head: () => ({
    meta: [
      { title: "Procedimentos — Intranet 2.0" },
      { name: "description", content: "Procedimentos operacionais padrão da organização." },
    ],
  }),
});

const statusColors: Record<string, string> = {
  vigente: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  em_revisao: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  obsoleto: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const categoryColors: Record<string, string> = {
  operacional: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  administrativo: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  seguranca: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  qualidade: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  compliance: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const categories = ["all", "operacional", "administrativo", "seguranca", "qualidade", "compliance"] as const;

function ProceduresPage() {
  const { t, lang } = useI18n();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [deptFilter, setDeptFilter] = useState<string>("all");
  const [departments, setDepartments] = useState<{ slug: string; label: string }[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    departmentsService.list().then((d) => setDepartments(d.map((dept) => ({ slug: dept.slug, label: dept.label })))).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    proceduresService
      .list({
        search: search || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
        category: categoryFilter === "all" ? undefined : categoryFilter,
        department: deptFilter === "all" ? undefined : deptFilter,
        pageSize: 15,
        page,
        sortBy: "code",
        sortOrder: "asc",
      })
      .then((res) => {
        setProcedures(res.data);
        setTotalPages(res.totalPages);
        setTotal(res.total);
      })
      .catch(() => setProcedures([]))
      .finally(() => setLoading(false));
  }, [search, statusFilter, categoryFilter, deptFilter, page]);

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("proc.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {total} {lang === "pt" ? "procedimentos encontrados" : "procedures found"}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={lang === "pt" ? "Buscar por código ou título..." : "Search by code or title..."}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9 bg-secondary border-0"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{lang === "pt" ? "Todos" : "All"}</SelectItem>
              <SelectItem value="vigente">{t("proc.vigente")}</SelectItem>
              <SelectItem value="em_revisao">{t("proc.em_revisao")}</SelectItem>
              <SelectItem value="obsoleto">{t("proc.obsoleto")}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder={t("proc.category")} />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat === "all" ? (lang === "pt" ? "Todas" : "All") : t(`proc.${cat}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {departments.length > 0 && (
            <Select value={deptFilter} onValueChange={(v) => { setDeptFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder={t("proc.department")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{lang === "pt" ? "Todos" : "All"}</SelectItem>
                {departments.map((d) => (
                  <SelectItem key={d.slug} value={d.slug}>{d.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : procedures.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <ClipboardList className="mb-3 h-10 w-10" />
            <p className="text-sm">{lang === "pt" ? "Nenhum procedimento encontrado" : "No procedures found"}</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {procedures.map((proc, i) => (
                <motion.div
                  key={proc.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Card className="transition-shadow hover:shadow-md">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className="font-mono text-[10px]">{proc.code}</Badge>
                            <Badge variant="outline" className={`text-[10px] ${statusColors[proc.status] ?? ""}`}>
                              {t(`proc.${proc.status}`)}
                            </Badge>
                            <Badge variant="outline" className={`text-[10px] ${categoryColors[proc.category] ?? ""}`}>
                              {t(`proc.${proc.category}`)}
                            </Badge>
                            {!proc.isActive && (
                              <Badge variant="destructive" className="text-[10px]">{t("proc.inactive")}</Badge>
                            )}
                          </div>
                          <Link to="/procedimentos/$slug" params={{ slug: proc.slug }}>
                            <h3 className="mt-2 text-sm font-semibold text-foreground hover:text-primary transition-colors cursor-pointer">
                              {proc.title}
                            </h3>
                          </Link>
                          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{proc.description}</p>
                          <div className="mt-2 flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground">
                            <span>v{proc.version}</span>
                            <span>•</span>
                            <span>{t("proc.effective")}: {proc.effectiveDate ? new Date(proc.effectiveDate).toLocaleDateString("pt-BR") : "—"}</span>
                            <span>•</span>
                            <span>{proc.responsibleUser || proc.author}</span>
                            {proc.tags.length > 0 && (
                              <>
                                <span>•</span>
                                {proc.tags.slice(0, 3).map((tag) => (
                                  <span key={tag}>#{tag}</span>
                                ))}
                              </>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpanded(expanded === proc.id ? null : proc.id)}
                        >
                          {expanded === proc.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </div>

                      {expanded === proc.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="mt-4 space-y-4 border-t border-border pt-4"
                        >
                          {proc.attachments.length > 0 && (
                            <div>
                              <h4 className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                                <Paperclip className="h-3.5 w-3.5" /> {t("proc.attachments")}
                              </h4>
                              <div className="mt-2 space-y-1.5">
                                {proc.attachments.map((att) => (
                                  <a key={att.id} href={att.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-md bg-accent px-3 py-2 text-xs hover:bg-accent/80">
                                    <Paperclip className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-foreground">{att.name}</span>
                                    <Badge variant="outline" className="ml-auto text-[9px]">{att.type.toUpperCase()}</Badge>
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}

                          {proc.history.length > 0 && (
                            <div>
                              <h4 className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                                <History className="h-3.5 w-3.5" /> {t("proc.history")}
                              </h4>
                              <div className="mt-2 space-y-2">
                                {proc.history.map((h, j) => (
                                  <div key={j} className="flex items-start gap-3 text-xs">
                                    <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                                    <div>
                                      <p className="font-medium text-foreground">v{h.version} — {h.date}</p>
                                      <p className="text-muted-foreground">{h.changes}</p>
                                      <p className="text-[10px] text-muted-foreground">{h.author}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex justify-end">
                            <Link to="/procedimentos/$slug" params={{ slug: proc.slug }}>
                              <Button variant="outline" size="sm" className="text-xs">
                                {lang === "pt" ? "Ver detalhes completos" : "View full details"} →
                              </Button>
                            </Link>
                          </div>
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  {lang === "pt" ? "Anterior" : "Previous"}
                </Button>
                <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                  {lang === "pt" ? "Próxima" : "Next"}
                </Button>
              </div>
            )}
          </>
        )}
      </motion.div>
    </AppLayout>
  );
}
