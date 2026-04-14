import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  FileText, Download, Search, FileSpreadsheet, FileIcon,
  Presentation, Star, Calendar, Tag, Building2, Globe,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useI18n } from "@/hooks/use-i18n";
import { documentsService, departmentsService } from "@/services/data.service";
import type { IntranetDocument } from "@/types/domain";

export const Route = createFileRoute("/src/routes/_authenticated/documentos")({
  component: DocumentsPage,
  head: () => ({
    meta: [
      { title: "Documentos — Intranet 2.0" },
      { name: "description", content: "Biblioteca de documentos institucionais." },
    ],
  }),
});

const categoryFilters = ["all", "manual", "formulario", "politica", "procedimento", "template"] as const;

const fileIcons: Record<string, any> = {
  pdf: FileText,
  docx: FileIcon,
  xlsx: FileSpreadsheet,
  pptx: Presentation,
};

function DocumentsPage() {
  const { t, lang } = useI18n();
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [langFilter, setLangFilter] = useState<string>("all");
  const [deptFilter, setDeptFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [docs, setDocs] = useState<IntranetDocument[]>([]);
  const [featured, setFeatured] = useState<IntranetDocument[]>([]);
  const [departments, setDepartments] = useState<{ slug: string; label: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    departmentsService.list().then((d) => setDepartments(d.map((dept) => ({ slug: dept.slug, label: dept.label })))).catch(() => {});
    documentsService.listFeatured().then(setFeatured).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    documentsService
      .list({
        search: search || undefined,
        category: filter === "all" ? undefined : filter,
        language: langFilter === "all" ? undefined : langFilter as any,
        department: deptFilter === "all" ? undefined : deptFilter,
        status: statusFilter === "all" ? undefined : statusFilter,
        page,
        pageSize: 20,
      })
      .then((res) => {
        setDocs(res.data);
        setTotal(res.total);
        setTotalPages(res.totalPages);
      })
      .catch(() => setDocs([]))
      .finally(() => setLoading(false));
  }, [filter, search, langFilter, deptFilter, statusFilter, page]);

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("docs.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{total} {lang === "pt" ? "documentos" : "documents"}</p>
        </div>

        {/* Featured Documents */}
        {featured.length > 0 && (
          <div className="space-y-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Star className="h-4 w-4 text-chart-4" /> {lang === "pt" ? "Documentos em Destaque" : "Featured Documents"}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((doc) => {
                const IconComp = fileIcons[doc.file?.type ?? ""] || FileText;
                return (
                  <Link key={doc.id} to="/documentos/$slug" params={{ slug: doc.slug }}>
                    <Card className="transition-all hover:shadow-md hover:border-primary/30 cursor-pointer h-full">
                      <CardContent className="p-4 space-y-2">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                            <IconComp className="h-5 w-5 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-foreground line-clamp-1">{doc.title}</p>
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{doc.description}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Badge variant="outline" className="text-[10px]">{t(`docs.${doc.category}`)}</Badge>
                          <span className="text-[10px] text-muted-foreground">v{doc.version}</span>
                          {doc.file && <span className="text-[10px] text-muted-foreground">· {doc.file.sizeFormatted}</span>}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={lang === "pt" ? "Buscar documento..." : "Search document..."}
              className="pl-9"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categoryFilters.map((cat) => (
              <Button
                key={cat}
                variant={filter === cat ? "default" : "outline"}
                size="sm"
                className="text-xs"
                onClick={() => { setFilter(cat); setPage(1); }}
              >
                {cat === "all" ? t("docs.all") : t(`docs.${cat}`)}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={langFilter} onValueChange={(v) => { setLangFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder={lang === "pt" ? "Idioma" : "Language"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{lang === "pt" ? "Todos" : "All"}</SelectItem>
                <SelectItem value="pt">🇧🇷 PT</SelectItem>
                <SelectItem value="en">🇬🇧 EN</SelectItem>
              </SelectContent>
            </Select>
            {departments.length > 0 && (
              <Select value={deptFilter} onValueChange={(v) => { setDeptFilter(v); setPage(1); }}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder={lang === "pt" ? "Depto" : "Dept"} />
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
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : docs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="h-12 w-12 text-muted-foreground" />
            <p className="mt-3 text-sm font-medium text-foreground">{t("crud.noResults")}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {docs.map((doc, i) => {
              const IconComp = fileIcons[doc.file?.type ?? ""] || FileText;
              return (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Link to="/documentos/$slug" params={{ slug: doc.slug }}>
                    <Card className="transition-shadow hover:shadow-md cursor-pointer">
                      <CardContent className="flex items-center gap-4 p-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent">
                          <IconComp className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate text-sm font-semibold text-foreground">{doc.title}</p>
                            <StatusBadge status={doc.status} lang={lang as "pt" | "en"} />
                            {doc.isFeatured && <Badge variant="secondary" className="gap-1 text-[10px]"><Star className="h-2.5 w-2.5" /> {lang === "pt" ? "Destaque" : "Featured"}</Badge>}
                            <Badge variant="outline" className="text-[10px]">{doc.language === "pt" ? "🇧🇷" : "🇬🇧"}</Badge>
                          </div>
                          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{doc.description}</p>
                          <div className="mt-1.5 flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className="text-[10px]">{t(`docs.${doc.category}`)}</Badge>
                            <span className="text-[10px] text-muted-foreground">{t("docs.version")} {doc.version}</span>
                            <span className="text-[10px] text-muted-foreground">·</span>
                            <span className="text-[10px] text-muted-foreground">{doc.file?.sizeFormatted ?? "—"}</span>
                            <span className="text-[10px] text-muted-foreground">·</span>
                            <span className="text-[10px] text-muted-foreground">{new Date(doc.updatedAt).toLocaleDateString("pt-BR")}</span>
                            {doc.responsibleUser && (
                              <>
                                <span className="text-[10px] text-muted-foreground">·</span>
                                <span className="text-[10px] text-muted-foreground">{doc.responsibleUser}</span>
                              </>
                            )}
                            {doc.tags.length > 0 && (
                              <>
                                <span className="text-[10px] text-muted-foreground">·</span>
                                {doc.tags.slice(0, 3).map((tag) => (
                                  <span key={tag} className="text-[10px] text-muted-foreground">#{tag}</span>
                                ))}
                              </>
                            )}
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="shrink-0 gap-1.5 text-xs" onClick={(e) => e.stopPropagation()}>
                          <Download className="h-3.5 w-3.5" /> {t("docs.download")}
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}

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
      </motion.div>
    </AppLayout>
  );
}
