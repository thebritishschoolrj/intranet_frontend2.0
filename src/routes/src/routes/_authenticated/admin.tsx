import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { getRouteAuthState, hasRoutePermission } from "@/lib/auth-guard";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Users, FileText, Building2, Shield, BarChart3, Newspaper,
  Pencil, Trash2, Send, Archive, Plus, Eye, Star, Pin,
  Clock, CheckCircle, Globe, ClipboardList, BookOpen, ScrollText,
  ShieldCheck,
} from "lucide-react";
import { AuditLogsTab } from "@/components/admin/AuditLogsTab";
import { FileUpload, flushPendingUploads } from "@/components/shared/FileUpload";
import { changeUserRole } from "@/services/role.functions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { AppLayout } from "@/components/layout/AppLayout";
import { useI18n } from "@/hooks/use-i18n";
import { useAuth } from "@/contexts/auth-context";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { DataTableShell } from "@/components/shared/DataTableShell";
import { EmptyState } from "@/components/shared/EmptyState";
import { newsService, documentsService, proceduresService, employeesService, auditService, departmentsService, institutionalPagesService } from "@/services/data.service";
import type { NewsArticle, IntranetDocument, Procedure, ContentStatus, NewsCategory, ProcedureCategory, InstitutionalPage, InstitutionalCategory } from "@/types/domain";

export const Route = createFileRoute("/src/routes/_authenticated/admin")({
  beforeLoad: async () => {
    const auth = await getRouteAuthState();
    if (!hasRoutePermission(auth, "admin:access")) {
      throw redirect({ to: "/" });
    }
  },
  component: AdminPage,
  head: () => ({
    meta: [
      { title: "Administração — Intranet" },
      { name: "description", content: "Painel administrativo da intranet." },
    ],
  }),
});

function AdminPage() {
  const { t, lang } = useI18n();
  const { isAuthenticated, hasPermission } = useAuth();

  if (!isAuthenticated || !hasPermission("admin:access")) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <Shield className="h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-lg font-bold text-foreground">Acesso Restrito</h2>
          <p className="mt-1 text-sm text-muted-foreground">Você não tem permissão para acessar esta página.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("adm.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("nav.admin")}</p>
        </div>

        <Tabs defaultValue="news" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview" className="gap-1.5">
              <BarChart3 className="h-3.5 w-3.5" /> Overview
            </TabsTrigger>
            <TabsTrigger value="news" className="gap-1.5">
              <Newspaper className="h-3.5 w-3.5" /> {t("nav.news")}
            </TabsTrigger>
            <TabsTrigger value="docs" className="gap-1.5">
              <FileText className="h-3.5 w-3.5" /> {t("nav.documents")}
            </TabsTrigger>
            <TabsTrigger value="procedures" className="gap-1.5">
              <ClipboardList className="h-3.5 w-3.5" /> {t("nav.procedures")}
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-1.5">
              <Users className="h-3.5 w-3.5" /> {t("adm.users")}
            </TabsTrigger>
            <TabsTrigger value="institutional" className="gap-1.5">
              <BookOpen className="h-3.5 w-3.5" /> {t("nav.institutional")}
            </TabsTrigger>
            <TabsTrigger value="audit" className="gap-1.5">
              <ScrollText className="h-3.5 w-3.5" /> {lang === "pt" ? "Auditoria" : "Audit Logs"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab t={t} lang={lang} />
          </TabsContent>
          <TabsContent value="news">
            <NewsCrudTab t={t} lang={lang} />
          </TabsContent>
          <TabsContent value="docs">
            <DocsCrudTab t={t} lang={lang} />
          </TabsContent>
          <TabsContent value="procedures">
            <ProceduresCrudTab t={t} lang={lang} />
          </TabsContent>
          <TabsContent value="users">
            <UsersTab t={t} lang={lang} />
          </TabsContent>
          <TabsContent value="institutional">
            <InstitutionalCrudTab t={t} lang={lang} />
          </TabsContent>
          <TabsContent value="audit">
            <AuditLogsTab t={t} lang={lang} />
          </TabsContent>
        </Tabs>
      </motion.div>
    </AppLayout>
  );
}

// ─── Overview Tab ────────────────────────────────────────────────────────────

function OverviewTab({ t, lang }: { t: (k: string) => string; lang: string }) {
  const [metrics, setMetrics] = useState<import("@/services/dashboard.service").DashboardMetrics | null>(null);
  const [pending, setPending] = useState<import("@/services/dashboard.service").PendingWorkflows | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      import("@/services/dashboard.service").then((m) => m.fetchDashboardMetrics()),
      import("@/services/dashboard.service").then((m) => m.fetchPendingWorkflows()),
    ])
      .then(([m, p]) => { setMetrics(m); setPending(p); })
      .catch(() => toast.error(t("toast.error")))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i}><CardContent className="p-5"><div className="h-16 animate-pulse rounded-lg bg-muted" /></CardContent></Card>
        ))}
      </div>
    );
  }

  const stats = [
    { label: t("dash.totalEmployees"), value: metrics?.totalEmployees ?? 0, icon: Users, color: "bg-blue-500" },
    { label: t("dash.departments"), value: metrics?.departmentsCount ?? 0, icon: Building2, color: "bg-emerald-500" },
    { label: t("dash.publishedNews"), value: metrics?.publishedNews ?? 0, icon: Newspaper, color: "bg-amber-500" },
    { label: t("dash.publishedDocs"), value: metrics?.publishedDocs ?? 0, icon: FileText, color: "bg-violet-500" },
    { label: t("dash.activeProcedures"), value: metrics?.activeProcedures ?? 0, icon: ClipboardList, color: "bg-cyan-500" },
    { label: t("dash.publishedPages"), value: metrics?.publishedPages ?? 0, icon: BookOpen, color: "bg-rose-500" },
    { label: t("dash.pendingNewsReview"), value: pending?.newsInReview ?? 0, icon: Clock, color: "bg-orange-500" },
    { label: t("dash.pendingDraftProcs"), value: pending?.draftProcedures ?? 0, icon: Archive, color: "bg-slate-500" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((s) => (
        <Card key={s.label}>
          <CardContent className="flex items-center gap-4 p-5">
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${s.color}`}>
              <s.icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── News CRUD Tab ───────────────────────────────────────────────────────────

function NewsCrudTab({ t, lang }: { t: (k: string) => string; lang: string }) {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [langFilter, setLangFilter] = useState<string>("all");
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [publishTarget, setPublishTarget] = useState<string | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await newsService.list({
        search: search || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
        category: categoryFilter === "all" ? undefined : categoryFilter,
        language: langFilter === "all" ? undefined : langFilter as any,
        page,
        pageSize: 20,
        sortBy: "updated_at",
        sortOrder: "desc",
      });
      setArticles(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch { toast.error(t("toast.error")); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, [search, statusFilter, categoryFilter, langFilter, page]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await newsService.delete(deleteTarget);
      await auditService.log("delete", "news", deleteTarget);
      toast.success(t("toast.deleted"));
      setDeleteTarget(null);
      loadData();
    } catch { toast.error(t("toast.error")); }
  };

  const handlePublish = async () => {
    if (!publishTarget) return;
    try {
      await newsService.publish(publishTarget);
      await auditService.log("publish", "news", publishTarget, { previousStatus: articles.find(a => a.id === publishTarget)?.status });
      toast.success(t("toast.published"));
      setPublishTarget(null);
      loadData();
    } catch { toast.error(t("toast.error")); }
  };

  const handleArchive = async () => {
    if (!archiveTarget) return;
    try {
      await newsService.archive(archiveTarget);
      await auditService.log("archive", "news", archiveTarget, { previousStatus: articles.find(a => a.id === archiveTarget)?.status });
      toast.success(t("toast.archived"));
      setArchiveTarget(null);
      loadData();
    } catch { toast.error(t("toast.error")); }
  };

  const handleSendToReview = async (id: string) => {
    try {
      await newsService.update(id, { status: "review" });
      await auditService.log("send_to_review", "news", id, { previousStatus: "draft" });
      toast.success(t("toast.reviewSent"));
      loadData();
    } catch { toast.error(t("toast.error")); }
  };

  return (
    <>
      <DataTableShell
        title={t("nav.news")}
        description={lang === "pt" ? "Gerenciar notícias e comunicados internos" : "Manage internal news and announcements"}
        searchPlaceholder={lang === "pt" ? "Buscar notícias..." : "Search news..."}
        searchValue={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        onCreateClick={() => { setEditingArticle(null); setShowForm(true); }}
        createLabel={lang === "pt" ? "Nova Notícia" : "New Article"}
        totalItems={total}
        filters={
          <div className="flex flex-wrap gap-2">
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{lang === "pt" ? "Todos" : "All"}</SelectItem>
                <SelectItem value="draft">{lang === "pt" ? "Rascunho" : "Draft"}</SelectItem>
                <SelectItem value="review">{lang === "pt" ? "Em Revisão" : "In Review"}</SelectItem>
                <SelectItem value="published">{lang === "pt" ? "Publicado" : "Published"}</SelectItem>
                <SelectItem value="archived">{lang === "pt" ? "Arquivado" : "Archived"}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder={lang === "pt" ? "Categoria" : "Category"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{lang === "pt" ? "Todas" : "All"}</SelectItem>
                <SelectItem value="comunicado">{t("news.comunicado")}</SelectItem>
                <SelectItem value="aviso">{t("news.aviso")}</SelectItem>
                <SelectItem value="evento">{t("news.evento")}</SelectItem>
                <SelectItem value="campanha">{t("news.campanha")}</SelectItem>
              </SelectContent>
            </Select>
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
          </div>
        }
      >
        {articles.length === 0 ? (
          <EmptyState
            title={lang === "pt" ? "Nenhuma notícia encontrada" : "No news found"}
            description={lang === "pt"
              ? "Crie notícias, comunicados e avisos para manter os colaboradores informados."
              : "Create news, announcements and notices to keep employees informed."}
            icon={Newspaper}
            onCreateClick={() => { setEditingArticle(null); setShowForm(true); }}
            createLabel={lang === "pt" ? "Nova Notícia" : "New Article"}
          />
        ) : (
          <div className="space-y-2">
            {articles.map((article) => (
              <Card key={article.id}>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="truncate text-sm font-medium text-foreground">{article.title}</h4>
                      <StatusBadge status={article.status} lang={lang as "pt" | "en"} />
                      {article.pinned && <Badge variant="secondary" className="gap-1 text-[10px]"><Pin className="h-2.5 w-2.5" /> {t("news.pinned")}</Badge>}
                      {article.isFeatured && <Badge variant="secondary" className="gap-1 text-[10px]"><Star className="h-2.5 w-2.5" /> {t("news.featured")}</Badge>}
                      <Badge variant="outline" className="text-[10px]">{article.language === "pt" ? "🇧🇷" : "🇬🇧"}</Badge>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{article.excerpt}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
                      <span>{article.author}</span>
                      <span>·</span>
                      <span>{article.updatedAt.split("T")[0]}</span>
                      <span>·</span>
                      <Badge variant="outline" className="text-[10px]">{t(`news.${article.category}`)}</Badge>
                      {article.tags.length > 0 && (
                        <>
                          <span>·</span>
                          {article.tags.slice(0, 2).map((tag) => (
                            <span key={tag} className="text-muted-foreground">#{tag}</span>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    {article.status === "draft" && (
                      <>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleSendToReview(article.id)} title={t("news.sendToReview")}>
                          <CheckCircle className="h-3.5 w-3.5 text-chart-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setPublishTarget(article.id)} title={t("crud.publish")}>
                          <Send className="h-3.5 w-3.5 text-chart-2" />
                        </Button>
                      </>
                    )}
                    {article.status === "review" && (
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setPublishTarget(article.id)} title={t("crud.publish")}>
                        <Send className="h-3.5 w-3.5 text-chart-2" />
                      </Button>
                    )}
                    {article.status === "published" && (
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setArchiveTarget(article.id)} title={t("crud.archive")}>
                        <Archive className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingArticle(article); setShowForm(true); }}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleteTarget(article.id)}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              {lang === "pt" ? "Anterior" : "Previous"}
            </Button>
            <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              {lang === "pt" ? "Próxima" : "Next"}
            </Button>
          </div>
        )}
      </DataTableShell>

      <NewsFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        article={editingArticle}
        onSaved={loadData}
        lang={lang as "pt" | "en"}
        t={t}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title={t("crud.confirmDelete")}
        description={t("crud.confirmDeleteDesc")}
        confirmLabel={t("crud.delete")}
        cancelLabel={t("crud.cancel")}
        onConfirm={handleDelete}
        variant="destructive"
      />

      <ConfirmDialog
        open={!!publishTarget}
        onOpenChange={(o) => !o && setPublishTarget(null)}
        title={t("crud.confirmPublish")}
        description={t("crud.confirmPublishDesc")}
        confirmLabel={t("crud.publish")}
        cancelLabel={t("crud.cancel")}
        onConfirm={handlePublish}
      />

      <ConfirmDialog
        open={!!archiveTarget}
        onOpenChange={(o) => !o && setArchiveTarget(null)}
        title={t("crud.confirmArchive")}
        description={t("crud.confirmArchiveDesc")}
        confirmLabel={t("crud.archive")}
        cancelLabel={t("crud.cancel")}
        onConfirm={handleArchive}
      />
    </>
  );
}

// ─── News Form Dialog ────────────────────────────────────────────────────────

function NewsFormDialog({
  open, onOpenChange, article, onSaved, lang, t,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  article: NewsArticle | null;
  onSaved: () => void;
  lang: "pt" | "en";
  t: (k: string) => string;
}) {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<NewsCategory>("comunicado");
  const [articleLang, setArticleLang] = useState<"pt" | "en">("pt");
  const [visibility, setVisibility] = useState<string>("public");
  const [pinned, setPinned] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [tags, setTags] = useState("");
  const [publishedAt, setPublishedAt] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  useEffect(() => {
    if (article) {
      setTitle(article.title);
      setExcerpt(article.excerpt);
      setContent(article.content);
      setCategory(article.category);
      setArticleLang(article.language);
      setVisibility(article.visibility);
      setPinned(article.pinned);
      setIsFeatured(article.isFeatured);
      setTags(article.tags.join(", "));
      setPublishedAt(article.publishedAt?.split("T")[0] ?? "");
      setExpiresAt(article.expiresAt?.split("T")[0] ?? "");
    } else {
      setTitle(""); setExcerpt(""); setContent(""); setCategory("comunicado");
      setArticleLang("pt"); setVisibility("public"); setPinned(false);
      setIsFeatured(false); setTags(""); setPublishedAt(""); setExpiresAt("");
      setPendingFiles([]);
    }
    setErrors({});
  }, [article, open]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = lang === "pt" ? "Título é obrigatório" : "Title is required";
    if (title.length > 200) errs.title = lang === "pt" ? "Título muito longo" : "Title too long";
    if (excerpt.length > 500) errs.excerpt = lang === "pt" ? "Resumo muito longo" : "Summary too long";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (publish = false) => {
    if (!validate()) return;
    setSaving(true);
    try {
      const parsedTags = tags.split(",").map((t) => t.trim()).filter(Boolean);
      const payload: Partial<NewsArticle> & { title: string } = {
        title,
        excerpt,
        content,
        category,
        language: articleLang,
        visibility: visibility as any,
        pinned,
        isFeatured,
        tags: parsedTags,
        author: article?.author ?? user?.name ?? "Sistema",
        publishedAt: publish ? new Date().toISOString() : (publishedAt ? new Date(publishedAt).toISOString() : null),
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
        status: publish ? "published" : (article?.status ?? "draft"),
        departmentAccess: [],
      };

      if (article) {
        await newsService.update(article.id, payload);
        if (pendingFiles.length > 0) await flushPendingUploads(pendingFiles, "news", article.id);
        await auditService.log("edit", "news", article.id, { title });
      } else {
        const created = await newsService.create(payload);
        if (pendingFiles.length > 0) await flushPendingUploads(pendingFiles, "news", created.id);
        await auditService.log("create", "news", created.id, { title });
      }
      toast.success(article ? t("toast.updated") : t("toast.created"));
      onSaved();
      onOpenChange(false);
    } catch { toast.error(t("toast.error")); } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{article ? t("crud.edit") : t("crud.create")} {t("nav.news")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label>{lang === "pt" ? "Título" : "Title"} *</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} />
              {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>{lang === "pt" ? "Resumo" : "Summary"}</Label>
              <Textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2} maxLength={500} />
              {errors.excerpt && <p className="text-xs text-destructive">{errors.excerpt}</p>}
              <p className="text-[10px] text-muted-foreground">{excerpt.length}/500</p>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>{lang === "pt" ? "Conteúdo" : "Content"}</Label>
              <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={6} />
            </div>
            <div className="space-y-2">
              <Label>{lang === "pt" ? "Categoria" : "Category"}</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as NewsCategory)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="comunicado">{t("news.comunicado")}</SelectItem>
                  <SelectItem value="aviso">{t("news.aviso")}</SelectItem>
                  <SelectItem value="evento">{t("news.evento")}</SelectItem>
                  <SelectItem value="campanha">{t("news.campanha")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{lang === "pt" ? "Idioma" : "Language"}</Label>
              <Select value={articleLang} onValueChange={(v) => setArticleLang(v as "pt" | "en")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt">🇧🇷 Português</SelectItem>
                  <SelectItem value="en">🇬🇧 English</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{lang === "pt" ? "Visibilidade" : "Visibility"}</Label>
              <Select value={visibility} onValueChange={setVisibility}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">{lang === "pt" ? "Público" : "Public"}</SelectItem>
                  <SelectItem value="department">{lang === "pt" ? "Departamento" : "Department"}</SelectItem>
                  <SelectItem value="restricted">{lang === "pt" ? "Restrito" : "Restricted"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tags</Label>
              <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder={lang === "pt" ? "Separadas por vírgula" : "Comma-separated"} />
            </div>
            <div className="space-y-2">
              <Label>{lang === "pt" ? "Data de publicação" : "Publish date"}</Label>
              <Input type="date" value={publishedAt} onChange={(e) => setPublishedAt(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{lang === "pt" ? "Data de expiração" : "Expiry date"}</Label>
              <Input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={pinned} onCheckedChange={setPinned} />
              <Pin className="h-3.5 w-3.5" /> {lang === "pt" ? "Fixado" : "Pinned"}
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
              <Star className="h-3.5 w-3.5" /> {lang === "pt" ? "Destaque" : "Featured"}
            </label>
          </div>

          <FileUpload
            entityType="news"
            entityId={article?.id ?? null}
            lang={lang}
            pendingQueue={pendingFiles}
            onPendingChange={setPendingFiles}
          />
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("crud.cancel")}</Button>
          <Button variant="secondary" onClick={() => handleSave(false)} disabled={saving || !title.trim()}>
            {saving ? "..." : t("crud.save")}
          </Button>
          <Button onClick={() => handleSave(true)} disabled={saving || !title.trim()} className="gap-1.5">
            <Send className="h-3.5 w-3.5" />
            {saving ? "..." : (lang === "pt" ? "Salvar e Publicar" : "Save & Publish")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Procedures CRUD Tab ─────────────────────────────────────────────────────

function ProceduresCrudTab({ t, lang }: { t: (k: string) => string; lang: string }) {
  const { user } = useAuth();
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [deptFilter, setDeptFilter] = useState<string>("all");
  const [departments, setDepartments] = useState<{ slug: string; label: string }[]>([]);
  const [editingProc, setEditingProc] = useState<Procedure | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [publishTarget, setPublishTarget] = useState<string | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    departmentsService.list().then((d) => setDepartments(d.map((dept) => ({ slug: dept.slug, label: dept.label })))).catch(() => {});
  }, []);

  const loadData = async () => {
    const res = await proceduresService.list({
      search: search || undefined,
      status: statusFilter === "all" ? undefined : statusFilter,
      category: categoryFilter === "all" ? undefined : categoryFilter,
      department: deptFilter === "all" ? undefined : deptFilter,
      page, pageSize: 20,
    });
    setProcedures(res.data);
    setTotal(res.total);
    setTotalPages(res.totalPages);
  };

  useEffect(() => { loadData(); }, [search, statusFilter, categoryFilter, deptFilter, page]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await proceduresService.delete(deleteTarget);
      await auditService.log("delete", "procedures", deleteTarget);
      toast.success(t("toast.deleted"));
      setDeleteTarget(null);
      loadData();
    } catch { toast.error(t("toast.error")); setDeleteTarget(null); }
  };

  const handlePublish = async () => {
    if (!publishTarget) return;
    try {
      await proceduresService.publish(publishTarget);
      await auditService.log("publish", "procedures", publishTarget);
      toast.success(t("toast.published"));
      setPublishTarget(null);
      loadData();
    } catch { toast.error(t("toast.error")); }
  };

  const handleArchive = async () => {
    if (!archiveTarget) return;
    try {
      await proceduresService.archive(archiveTarget);
      await auditService.log("archive", "procedures", archiveTarget);
      toast.success(t("toast.archived"));
      setArchiveTarget(null);
      loadData();
    } catch { toast.error(t("toast.error")); }
  };

  const handleSaveProc = async (data: Partial<Procedure> & { code: string; title: string }, publish: boolean) => {
    if (editingProc) {
      const newVersion = publish && editingProc.contentStatus !== "published"
        ? (parseFloat(editingProc.version) + 0.1).toFixed(1)
        : editingProc.version;
      const historyEntry = {
        version: newVersion,
        date: new Date().toISOString().split("T")[0],
        author: user?.name ?? "Sistema",
        changes: publish ? "Publicado" : "Atualizado",
      };
      await proceduresService.update(editingProc.id, {
        ...data,
        version: newVersion,
        contentStatus: publish ? "published" : editingProc.contentStatus,
        history: [...editingProc.history, historyEntry],
      });
      await auditService.log(publish ? "publish" : "edit", "procedures", editingProc.id, { title: data.title });
    } else {
      const created = await proceduresService.create({
        ...data,
        contentStatus: publish ? "published" : "draft",
        history: [{
          version: "1.0",
          date: new Date().toISOString().split("T")[0],
          author: user?.name ?? "Sistema",
          changes: "Versão inicial",
        }],
      });
      await auditService.log("create", "procedures", created.id, { title: data.title });
    }
    toast.success(editingProc ? t("toast.updated") : t("toast.created"));
    setShowForm(false);
    loadData();
  };

  return (
    <>
      <DataTableShell
        title={t("nav.procedures")}
        description={lang === "pt" ? "Gerenciar procedimentos operacionais" : "Manage operating procedures"}
        searchPlaceholder={lang === "pt" ? "Buscar procedimentos..." : "Search procedures..."}
        searchValue={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        onCreateClick={() => { setEditingProc(null); setShowForm(true); }}
        createLabel={lang === "pt" ? "Novo Procedimento" : "New Procedure"}
        totalItems={total}
        filters={
          <div className="flex flex-wrap gap-2">
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[130px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{lang === "pt" ? "Todos" : "All"}</SelectItem>
                <SelectItem value="vigente">{t("proc.vigente")}</SelectItem>
                <SelectItem value="em_revisao">{t("proc.em_revisao")}</SelectItem>
                <SelectItem value="obsoleto">{t("proc.obsoleto")}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder={t("proc.category")} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{lang === "pt" ? "Todas" : "All"}</SelectItem>
                <SelectItem value="operacional">{t("proc.operacional")}</SelectItem>
                <SelectItem value="administrativo">{t("proc.administrativo")}</SelectItem>
                <SelectItem value="seguranca">{t("proc.seguranca")}</SelectItem>
                <SelectItem value="qualidade">{t("proc.qualidade")}</SelectItem>
                <SelectItem value="compliance">{t("proc.compliance")}</SelectItem>
              </SelectContent>
            </Select>
            {departments.length > 0 && (
              <Select value={deptFilter} onValueChange={(v) => { setDeptFilter(v); setPage(1); }}>
                <SelectTrigger className="w-[140px]"><SelectValue placeholder={t("proc.department")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{lang === "pt" ? "Todos" : "All"}</SelectItem>
                  {departments.map((d) => (
                    <SelectItem key={d.slug} value={d.slug}>{d.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        }
      >
        {procedures.length === 0 ? (
          <EmptyState
            title={lang === "pt" ? "Nenhum procedimento encontrado" : "No procedures found"}
            description={lang === "pt"
              ? "Cadastre procedimentos operacionais, de segurança e qualidade da organização."
              : "Register operational, safety and quality procedures."}
            icon={ClipboardList}
          />
        ) : (
          <div className="space-y-2">
            {procedures.map((proc) => (
              <Card key={proc.id}>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="font-mono text-[10px]">{proc.code}</Badge>
                      <h4 className="truncate text-sm font-medium text-foreground">{proc.title}</h4>
                      <StatusBadge status={proc.status} lang={lang as "pt" | "en"} />
                      <StatusBadge status={proc.contentStatus} lang={lang as "pt" | "en"} />
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{proc.description}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
                      <span>v{proc.version}</span>
                      <span>·</span>
                      <span>{proc.responsibleUser || proc.author}</span>
                      <span>·</span>
                      <span>{proc.departmentSlug}</span>
                      <span>·</span>
                      <Badge variant="outline" className="text-[10px]">{t(`proc.${proc.category}`)}</Badge>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    {proc.contentStatus === "draft" && (
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setPublishTarget(proc.id)} title={t("crud.publish")}>
                        <Send className="h-3.5 w-3.5 text-chart-2" />
                      </Button>
                    )}
                    {proc.contentStatus === "published" && (
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setArchiveTarget(proc.id)} title={t("crud.archive")}>
                        <Archive className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingProc(proc); setShowForm(true); }}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleteTarget(proc.id)}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              {lang === "pt" ? "Anterior" : "Previous"}
            </Button>
            <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              {lang === "pt" ? "Próxima" : "Next"}
            </Button>
          </div>
        )}
      </DataTableShell>

      {/* Procedure Form Dialog */}
      <ProcedureFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        procedure={editingProc}
        departments={departments}
        onSave={handleSaveProc}
        lang={lang as "pt" | "en"}
        t={t}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title={t("crud.confirmDelete")}
        description={t("crud.confirmDeleteDesc")}
        confirmLabel={t("crud.delete")}
        cancelLabel={t("crud.cancel")}
        onConfirm={handleDelete}
        variant="destructive"
      />

      <ConfirmDialog
        open={!!publishTarget}
        onOpenChange={(o) => !o && setPublishTarget(null)}
        title={t("crud.confirmPublish")}
        description={t("crud.confirmPublishDesc")}
        confirmLabel={t("crud.publish")}
        cancelLabel={t("crud.cancel")}
        onConfirm={handlePublish}
      />

      <ConfirmDialog
        open={!!archiveTarget}
        onOpenChange={(o) => !o && setArchiveTarget(null)}
        title={t("crud.confirmArchive")}
        description={t("crud.confirmArchiveDesc")}
        confirmLabel={t("crud.archive")}
        cancelLabel={t("crud.cancel")}
        onConfirm={handleArchive}
      />
    </>
  );
}

// ─── Procedure Form Dialog ───────────────────────────────────────────────────

function ProcedureFormDialog({
  open, onOpenChange, procedure, departments, onSave, lang, t,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  procedure: Procedure | null;
  departments: { slug: string; label: string }[];
  onSave: (data: Partial<Procedure> & { code: string; title: string }, publish: boolean) => Promise<void>;
  lang: "pt" | "en";
  t: (k: string) => string;
}) {
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("operacional");
  const [deptSlug, setDeptSlug] = useState("");
  const [responsible, setResponsible] = useState("");
  const [procLang, setProcLang] = useState<"pt" | "en">("pt");
  const [visibility, setVisibility] = useState<string>("public");
  const [procStatus, setProcStatus] = useState<string>("vigente");
  const [tags, setTags] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  useEffect(() => {
    if (procedure) {
      setCode(procedure.code); setTitle(procedure.title);
      setDescription(procedure.description); setCategory(procedure.category);
      setDeptSlug(procedure.departmentSlug); setResponsible(procedure.responsibleUser);
      setProcLang(procedure.language); setVisibility(procedure.visibility);
      setProcStatus(procedure.status); setTags(procedure.tags.join(", "));
    } else {
      setCode(""); setTitle(""); setDescription(""); setCategory("operacional");
      setDeptSlug(""); setResponsible(""); setProcLang("pt"); setVisibility("public");
      setProcStatus("vigente"); setTags(""); setPendingFiles([]);
    }
    setErrors({});
  }, [procedure, open]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!code.trim()) errs.code = lang === "pt" ? "Código é obrigatório" : "Code is required";
    if (!title.trim()) errs.title = lang === "pt" ? "Título é obrigatório" : "Title is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (publish = false) => {
    if (!validate()) return;
    setSaving(true);
    try {
      await onSave({
        code, title, description,
        category: category as ProcedureCategory,
        departmentSlug: deptSlug,
        responsibleUser: responsible,
        language: procLang,
        visibility: visibility as any,
        status: procStatus as any,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      }, publish);
      // Flush pending file uploads after save
      // Note: files are flushed in the parent's onSave callback where entityId is available
    } finally { setSaving(false); setPendingFiles([]); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{procedure ? t("crud.edit") : t("crud.create")} {t("nav.procedures")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("proc.code")} *</Label>
              <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="POP-XX-000" disabled={!!procedure} />
              {errors.code && <p className="text-xs text-destructive">{errors.code}</p>}
            </div>
            <div className="space-y-2 sm:col-span-1">
              <Label>{lang === "pt" ? "Título" : "Title"} *</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} />
              {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>{lang === "pt" ? "Descrição" : "Description"}</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
            </div>
            <div className="space-y-2">
              <Label>{t("proc.category")}</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="operacional">{t("proc.operacional")}</SelectItem>
                  <SelectItem value="administrativo">{t("proc.administrativo")}</SelectItem>
                  <SelectItem value="seguranca">{t("proc.seguranca")}</SelectItem>
                  <SelectItem value="qualidade">{t("proc.qualidade")}</SelectItem>
                  <SelectItem value="compliance">{t("proc.compliance")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("proc.department")}</Label>
              <Select value={deptSlug} onValueChange={setDeptSlug}>
                <SelectTrigger><SelectValue placeholder={lang === "pt" ? "Selecionar" : "Select"} /></SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d.slug} value={d.slug}>{d.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("proc.responsible")}</Label>
              <Input value={responsible} onChange={(e) => setResponsible(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={procStatus} onValueChange={setProcStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="vigente">{t("proc.vigente")}</SelectItem>
                  <SelectItem value="em_revisao">{t("proc.em_revisao")}</SelectItem>
                  <SelectItem value="obsoleto">{t("proc.obsoleto")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{lang === "pt" ? "Idioma" : "Language"}</Label>
              <Select value={procLang} onValueChange={(v) => setProcLang(v as "pt" | "en")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt">🇧🇷 Português</SelectItem>
                  <SelectItem value="en">🇬🇧 English</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{lang === "pt" ? "Visibilidade" : "Visibility"}</Label>
              <Select value={visibility} onValueChange={setVisibility}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">{lang === "pt" ? "Público" : "Public"}</SelectItem>
                  <SelectItem value="department">{lang === "pt" ? "Departamento" : "Department"}</SelectItem>
                  <SelectItem value="restricted">{lang === "pt" ? "Restrito" : "Restricted"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Tags</Label>
              <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder={lang === "pt" ? "Separadas por vírgula" : "Comma-separated"} />
            </div>
          </div>

          <FileUpload
            entityType="procedures"
            entityId={procedure?.id ?? null}
            lang={lang}
            pendingQueue={pendingFiles}
            onPendingChange={setPendingFiles}
          />
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("crud.cancel")}</Button>
          <Button variant="secondary" onClick={() => handleSubmit(false)} disabled={saving}>
            {saving ? "..." : t("crud.save")}
          </Button>
          <Button onClick={() => handleSubmit(true)} disabled={saving} className="gap-1.5">
            <Send className="h-3.5 w-3.5" />
            {saving ? "..." : (lang === "pt" ? "Salvar e Publicar" : "Save & Publish")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Documents CRUD Tab ──────────────────────────────────────────────────────

function DocsCrudTab({ t, lang }: { t: (k: string) => string; lang: string }) {
  const { user } = useAuth();
  const [docs, setDocs] = useState<IntranetDocument[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [langFilter, setLangFilter] = useState<string>("all");
  const [deptFilter, setDeptFilter] = useState<string>("all");
  const [departments, setDepartments] = useState<{ slug: string; label: string }[]>([]);
  const [editingDoc, setEditingDoc] = useState<IntranetDocument | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    departmentsService.list().then((d) => setDepartments(d.map((dept) => ({ slug: dept.slug, label: dept.label })))).catch(() => {});
  }, []);

  const loadData = async () => {
    const res = await documentsService.list({
      search: search || undefined,
      status: statusFilter === "all" ? undefined : statusFilter,
      category: categoryFilter === "all" ? undefined : categoryFilter,
      language: langFilter === "all" ? undefined : langFilter as any,
      department: deptFilter === "all" ? undefined : deptFilter,
      page, pageSize: 20,
    });
    setDocs(res.data);
    setTotal(res.total);
    setTotalPages(res.totalPages);
  };

  useEffect(() => { loadData(); }, [search, statusFilter, categoryFilter, langFilter, deptFilter, page]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await documentsService.delete(deleteTarget);
      await auditService.log("delete", "documents", deleteTarget);
      toast.success(t("toast.deleted"));
      setDeleteTarget(null);
      loadData();
    } catch { toast.error(t("toast.error")); setDeleteTarget(null); }
  };

  const handlePublish = async (id: string) => {
    try {
      await documentsService.publish(id);
      await auditService.log("publish", "documents", id);
      toast.success(t("toast.published"));
      loadData();
    } catch { toast.error(t("toast.error")); }
  };

  const handleArchive = async (id: string) => {
    try {
      await documentsService.archive(id);
      await auditService.log("archive", "documents", id);
      toast.success(t("toast.archived"));
      loadData();
    } catch { toast.error(t("toast.error")); }
  };

  return (
    <>
      <DataTableShell
        title={t("nav.documents")}
        description={lang === "pt" ? "Gerenciar biblioteca de documentos" : "Manage document library"}
        searchPlaceholder={lang === "pt" ? "Buscar documentos..." : "Search documents..."}
        searchValue={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        onCreateClick={() => { setEditingDoc(null); setShowForm(true); }}
        createLabel={lang === "pt" ? "Novo Documento" : "New Document"}
        totalItems={total}
        filters={
          <div className="flex flex-wrap gap-2">
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[130px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{lang === "pt" ? "Todos" : "All"}</SelectItem>
                <SelectItem value="draft">{lang === "pt" ? "Rascunho" : "Draft"}</SelectItem>
                <SelectItem value="review">{lang === "pt" ? "Em Revisão" : "In Review"}</SelectItem>
                <SelectItem value="published">{lang === "pt" ? "Publicado" : "Published"}</SelectItem>
                <SelectItem value="archived">{lang === "pt" ? "Arquivado" : "Archived"}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[130px]"><SelectValue placeholder={lang === "pt" ? "Categoria" : "Category"} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{lang === "pt" ? "Todas" : "All"}</SelectItem>
                <SelectItem value="manual">{t("docs.manual")}</SelectItem>
                <SelectItem value="formulario">{t("docs.formulario")}</SelectItem>
                <SelectItem value="politica">{t("docs.politica")}</SelectItem>
                <SelectItem value="procedimento">{t("docs.procedimento")}</SelectItem>
                <SelectItem value="template">{t("docs.template")}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={langFilter} onValueChange={(v) => { setLangFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[100px]"><SelectValue placeholder={lang === "pt" ? "Idioma" : "Language"} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{lang === "pt" ? "Todos" : "All"}</SelectItem>
                <SelectItem value="pt">🇧🇷 PT</SelectItem>
                <SelectItem value="en">🇬🇧 EN</SelectItem>
              </SelectContent>
            </Select>
            {departments.length > 0 && (
              <Select value={deptFilter} onValueChange={(v) => { setDeptFilter(v); setPage(1); }}>
                <SelectTrigger className="w-[140px]"><SelectValue placeholder={lang === "pt" ? "Depto" : "Dept"} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{lang === "pt" ? "Todos" : "All"}</SelectItem>
                  {departments.map((d) => (
                    <SelectItem key={d.slug} value={d.slug}>{d.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        }
      >
        {docs.length === 0 ? (
          <EmptyState
            title={lang === "pt" ? "Nenhum documento encontrado" : "No documents found"}
            description={lang === "pt"
              ? "Adicione manuais, formulários, políticas e templates para a biblioteca de documentos."
              : "Add manuals, forms, policies and templates to the document library."}
            icon={FileText}
            onCreateClick={() => { setEditingDoc(null); setShowForm(true); }}
            createLabel={lang === "pt" ? "Novo Documento" : "New Document"}
          />
        ) : (
          <div className="space-y-2">
            {docs.map((doc) => (
              <Card key={doc.id}>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="truncate text-sm font-medium text-foreground">{doc.title}</h4>
                      <StatusBadge status={doc.status} lang={lang as "pt" | "en"} />
                      {doc.isFeatured && <Badge variant="secondary" className="gap-1 text-[10px]"><Star className="h-2.5 w-2.5" /> {lang === "pt" ? "Destaque" : "Featured"}</Badge>}
                      <Badge variant="outline" className="text-[10px]">{doc.language === "pt" ? "🇧🇷" : "🇬🇧"}</Badge>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{doc.description}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
                      <span>v{doc.version}</span>
                      <span>·</span>
                      <Badge variant="outline" className="text-[10px]">{t(`docs.${doc.category}`)}</Badge>
                      <span>·</span>
                      <span>{doc.file?.sizeFormatted ?? "—"}</span>
                      <span>·</span>
                      <span>{doc.responsibleUser || doc.author}</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    {doc.status === "draft" && (
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handlePublish(doc.id)} title={t("crud.publish")}>
                        <Send className="h-3.5 w-3.5 text-chart-2" />
                      </Button>
                    )}
                    {doc.status === "review" && (
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handlePublish(doc.id)} title={t("crud.publish")}>
                        <Send className="h-3.5 w-3.5 text-chart-2" />
                      </Button>
                    )}
                    {doc.status === "published" && (
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleArchive(doc.id)} title={t("crud.archive")}>
                        <Archive className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingDoc(doc); setShowForm(true); }}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleteTarget(doc.id)}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              {lang === "pt" ? "Anterior" : "Previous"}
            </Button>
            <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              {lang === "pt" ? "Próxima" : "Next"}
            </Button>
          </div>
        )}
      </DataTableShell>

      <DocFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        document={editingDoc}
        departments={departments}
        onSaved={loadData}
        lang={lang as "pt" | "en"}
        t={t}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title={t("crud.confirmDelete")}
        description={t("crud.confirmDeleteDesc")}
        confirmLabel={t("crud.delete")}
        cancelLabel={t("crud.cancel")}
        onConfirm={handleDelete}
        variant="destructive"
      />
    </>
  );
}

// ─── Document Form Dialog ────────────────────────────────────────────────────

function DocFormDialog({
  open, onOpenChange, document: doc, departments, onSaved, lang, t,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  document: IntranetDocument | null;
  departments: { slug: string; label: string }[];
  onSaved: () => void;
  lang: "pt" | "en";
  t: (k: string) => string;
}) {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("manual");
  const [docLang, setDocLang] = useState<"pt" | "en">("pt");
  const [visibility, setVisibility] = useState<string>("public");
  const [deptSlug, setDeptSlug] = useState("");
  const [responsible, setResponsible] = useState("");
  const [tags, setTags] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  useEffect(() => {
    if (doc) {
      setTitle(doc.title); setDescription(doc.description);
      setCategory(doc.category); setDocLang(doc.language);
      setVisibility(doc.visibility); setDeptSlug(doc.departmentSlug ?? "");
      setResponsible(doc.responsibleUser); setTags(doc.tags.join(", "));
      setEffectiveDate(doc.effectiveDate?.split("T")[0] ?? "");
      setExpiryDate(doc.expiryDate?.split("T")[0] ?? "");
      setIsFeatured(doc.isFeatured);
    } else {
      setTitle(""); setDescription(""); setCategory("manual");
      setDocLang("pt"); setVisibility("public"); setDeptSlug("");
      setResponsible(""); setTags(""); setEffectiveDate(""); setExpiryDate("");
      setIsFeatured(false); setPendingFiles([]);
    }
    setErrors({});
  }, [doc, open]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = lang === "pt" ? "Título é obrigatório" : "Title is required";
    if (title.length > 200) errs.title = lang === "pt" ? "Título muito longo" : "Title too long";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (publish = false) => {
    if (!validate()) return;
    setSaving(true);
    try {
      const parsedTags = tags.split(",").map((t) => t.trim()).filter(Boolean);
      const payload: Partial<IntranetDocument> & { title: string } = {
        title, description,
        category: category as any,
        language: docLang,
        visibility: visibility as any,
        departmentSlug: deptSlug || undefined,
        responsibleUser: responsible,
        tags: parsedTags,
        effectiveDate: effectiveDate || null,
        expiryDate: expiryDate || null,
        isFeatured,
        author: doc?.author ?? user?.name ?? "Sistema",
        status: publish ? "published" : (doc?.status ?? "draft"),
        departmentAccess: [],
      };

      if (doc) {
        const newVersion = publish && doc.status !== "published"
          ? (parseFloat(doc.version) + 0.1).toFixed(1)
          : doc.version;
        const historyEntry = {
          version: newVersion,
          date: new Date().toISOString().split("T")[0],
          author: user?.name ?? "Sistema",
          changes: publish ? "Publicado" : "Atualizado",
        };
        await documentsService.update(doc.id, {
          ...payload,
          version: newVersion,
          history: [...doc.history, historyEntry],
        });
        if (pendingFiles.length > 0) await flushPendingUploads(pendingFiles, "documents", doc.id);
        await auditService.log(publish ? "publish" : "edit", "documents", doc.id, { title });
      } else {
        const created = await documentsService.create({
          ...payload,
          version: "1.0",
          history: [{
            version: "1.0",
            date: new Date().toISOString().split("T")[0],
            author: user?.name ?? "Sistema",
            changes: lang === "pt" ? "Versão inicial" : "Initial version",
          }],
        });
        if (pendingFiles.length > 0) await flushPendingUploads(pendingFiles, "documents", created.id);
        await auditService.log("create", "documents", created.id, { title });
      }
      toast.success(doc ? t("toast.updated") : t("toast.created"));
      onSaved();
      onOpenChange(false);
    } catch { toast.error(t("toast.error")); } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{doc ? t("crud.edit") : t("crud.create")} {t("nav.documents")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label>{lang === "pt" ? "Título" : "Title"} *</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} />
              {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>{lang === "pt" ? "Descrição" : "Description"}</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
            </div>
            <div className="space-y-2">
              <Label>{lang === "pt" ? "Categoria" : "Category"}</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">{t("docs.manual")}</SelectItem>
                  <SelectItem value="formulario">{t("docs.formulario")}</SelectItem>
                  <SelectItem value="politica">{t("docs.politica")}</SelectItem>
                  <SelectItem value="procedimento">{t("docs.procedimento")}</SelectItem>
                  <SelectItem value="template">{t("docs.template")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{lang === "pt" ? "Idioma" : "Language"}</Label>
              <Select value={docLang} onValueChange={(v) => setDocLang(v as "pt" | "en")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt">🇧🇷 Português</SelectItem>
                  <SelectItem value="en">🇬🇧 English</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{lang === "pt" ? "Departamento" : "Department"}</Label>
              <Select value={deptSlug} onValueChange={setDeptSlug}>
                <SelectTrigger><SelectValue placeholder={lang === "pt" ? "Selecionar" : "Select"} /></SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d.slug} value={d.slug}>{d.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{lang === "pt" ? "Responsável" : "Responsible"}</Label>
              <Input value={responsible} onChange={(e) => setResponsible(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{lang === "pt" ? "Visibilidade" : "Visibility"}</Label>
              <Select value={visibility} onValueChange={setVisibility}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">{lang === "pt" ? "Público" : "Public"}</SelectItem>
                  <SelectItem value="department">{lang === "pt" ? "Departamento" : "Department"}</SelectItem>
                  <SelectItem value="restricted">{lang === "pt" ? "Restrito" : "Restricted"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tags</Label>
              <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder={lang === "pt" ? "Separadas por vírgula" : "Comma-separated"} />
            </div>
            <div className="space-y-2">
              <Label>{lang === "pt" ? "Data de vigência" : "Effective date"}</Label>
              <Input type="date" value={effectiveDate} onChange={(e) => setEffectiveDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{lang === "pt" ? "Data de expiração" : "Expiry date"}</Label>
              <Input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
            <Star className="h-3.5 w-3.5" /> {lang === "pt" ? "Destaque" : "Featured"}
          </label>

          <FileUpload
            entityType="documents"
            entityId={doc?.id ?? null}
            lang={lang}
            pendingQueue={pendingFiles}
            onPendingChange={setPendingFiles}
          />
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("crud.cancel")}</Button>
          <Button variant="secondary" onClick={() => handleSave(false)} disabled={saving || !title.trim()}>
            {saving ? "..." : t("crud.save")}
          </Button>
          <Button onClick={() => handleSave(true)} disabled={saving || !title.trim()} className="gap-1.5">
            <Send className="h-3.5 w-3.5" />
            {saving ? "..." : (lang === "pt" ? "Salvar e Publicar" : "Save & Publish")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Users Tab ───────────────────────────────────────────────────────────────

function UsersTab({ t, lang }: { t: (k: string) => string; lang: string }) {
  const { user: currentUser, hasPermission } = useAuth();
  const [users, setUsers] = useState<import("@/types/domain").User[]>([]);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [departments, setDepartments] = useState<{ slug: string; label: string }[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingUser, setEditingUser] = useState<import("@/types/domain").User | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [roleTarget, setRoleTarget] = useState<import("@/types/domain").User | null>(null);
  const [newRole, setNewRole] = useState<string>("");
  const [changingRole, setChangingRole] = useState(false);

  useEffect(() => {
    departmentsService.list().then((d) => setDepartments(d.map((dept) => ({ slug: dept.slug, label: dept.label })))).catch(() => {});
  }, []);

  const loadData = async () => {
    const res = await employeesService.list({
      search: search || undefined,
      department: deptFilter === "all" ? undefined : deptFilter,
      status: statusFilter === "all" ? undefined : statusFilter,
      page, pageSize: 20,
    });
    setUsers(res.data);
    setTotal(res.total);
    setTotalPages(res.totalPages);
  };

  useEffect(() => { loadData(); }, [search, deptFilter, statusFilter, page]);

  const handleActivate = async (u: import("@/types/domain").User) => {
    try {
      const newStatus = u.status === "active" ? "inactive" : "active";
      await employeesService.update(u.profileId, { status: newStatus });
      await auditService.log(newStatus === "active" ? "activate" : "deactivate", "profiles", u.profileId, { name: u.name });
      toast.success(newStatus === "active" ? t("toast.activated") : t("toast.deactivated"));
      loadData();
    } catch { toast.error(t("toast.error")); }
  };

  const handleRoleChange = async () => {
    if (!roleTarget || !newRole) return;
    setChangingRole(true);
    try {
      const session = await import("@/integrations/supabase/client").then(m => m.supabase.auth.getSession());
      const token = session.data.session?.access_token;
      if (!token) throw new Error("Not authenticated");
      await changeUserRole({
        data: { targetUserId: roleTarget.id, newRole },
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(lang === "pt" ? `Papel alterado para ${newRole}` : `Role changed to ${newRole}`);
      setRoleTarget(null);
      setNewRole("");
      loadData();
    } catch (err: any) {
      toast.error(err.message ?? t("toast.error"));
    } finally {
      setChangingRole(false);
    }
  };

  const canManageRoles = hasPermission("admin:roles");
  const ROLES: import("@/types/domain").AppRole[] = ["admin", "manager", "editor", "employee"];
  const ROLE_LABELS: Record<string, { pt: string; en: string }> = {
    admin: { pt: "Administrador", en: "Administrator" },
    manager: { pt: "Gestor", en: "Manager" },
    editor: { pt: "Editor", en: "Editor" },
    employee: { pt: "Colaborador", en: "Employee" },
  };

  return (
    <>
      <DataTableShell
        title={t("adm.users")}
        description={lang === "pt" ? "Gerenciar contas, perfis e permissões" : "Manage accounts, profiles and permissions"}
        searchPlaceholder={lang === "pt" ? "Buscar colaborador..." : "Search employee..."}
        searchValue={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        totalItems={total}
        filters={
          <div className="flex flex-wrap gap-2">
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[120px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{lang === "pt" ? "Todos" : "All"}</SelectItem>
                <SelectItem value="active">{lang === "pt" ? "Ativo" : "Active"}</SelectItem>
                <SelectItem value="inactive">{lang === "pt" ? "Inativo" : "Inactive"}</SelectItem>
                <SelectItem value="suspended">{lang === "pt" ? "Suspenso" : "Suspended"}</SelectItem>
              </SelectContent>
            </Select>
            {departments.length > 0 && (
              <Select value={deptFilter} onValueChange={(v) => { setDeptFilter(v); setPage(1); }}>
                <SelectTrigger className="w-[140px]"><SelectValue placeholder={lang === "pt" ? "Depto" : "Dept"} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{lang === "pt" ? "Todos" : "All"}</SelectItem>
                  {departments.map((d) => (
                    <SelectItem key={d.slug} value={d.slug}>{d.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        }
      >
        {users.length === 0 ? (
          <EmptyState
            title={lang === "pt" ? "Nenhum colaborador encontrado" : "No employees found"}
            description={lang === "pt"
              ? "Os colaboradores são criados automaticamente ao fazer cadastro no sistema. Utilize o seed de dados para popular o ambiente."
              : "Employees are created automatically upon registration. Use the data seed to populate the environment."}
            icon={Users}
          />
        ) : (
          <div className="space-y-2">
            {users.map((u) => (
              <Card key={u.id}>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {u.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="truncate text-sm font-medium text-foreground">{u.preferredName || u.name}</h4>
                      <StatusBadge status={u.status} lang={lang as "pt" | "en"} />
                      <Badge variant="outline" className="text-[10px] capitalize">{u.role}</Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{u.position} · {u.department}</p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
                      <span>{u.email}</span>
                      <span>·</span>
                      <span>{u.employeeId}</span>
                      {u.location && <><span>·</span><span>{u.location}</span></>}
                      {u.skills.length > 0 && <><span>·</span><span>{u.skills.slice(0, 3).join(", ")}</span></>}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    {canManageRoles && u.id !== currentUser?.id && (
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setRoleTarget(u); setNewRole(u.role); }}
                        title={lang === "pt" ? "Alterar papel" : "Change role"}>
                        <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleActivate(u)}
                      title={u.status === "active" ? (lang === "pt" ? "Desativar" : "Deactivate") : (lang === "pt" ? "Ativar" : "Activate")}>
                      {u.status === "active" ? <Archive className="h-3.5 w-3.5 text-muted-foreground" /> : <CheckCircle className="h-3.5 w-3.5 text-chart-2" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingUser(u); setShowForm(true); }}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              {lang === "pt" ? "Anterior" : "Previous"}
            </Button>
            <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              {lang === "pt" ? "Próxima" : "Next"}
            </Button>
          </div>
        )}
      </DataTableShell>

      {/* Edit User Dialog */}
      <UserEditDialog
        open={showForm}
        onOpenChange={setShowForm}
        user={editingUser}
        departments={departments}
        onSaved={loadData}
        lang={lang as "pt" | "en"}
        t={t}
      />

      {/* Role Change Dialog */}
      <Dialog open={!!roleTarget} onOpenChange={(o) => !o && setRoleTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              {lang === "pt" ? "Alterar Papel" : "Change Role"}
            </DialogTitle>
          </DialogHeader>
          {roleTarget && (
            <div className="space-y-4">
              <div className="rounded-lg border p-3">
                <p className="text-sm font-medium text-foreground">{roleTarget.name}</p>
                <p className="text-xs text-muted-foreground">{roleTarget.email}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {lang === "pt" ? "Papel atual:" : "Current role:"}{" "}
                  <Badge variant="outline" className="text-[10px] capitalize">{roleTarget.role}</Badge>
                </p>
              </div>
              <div className="space-y-2">
                <Label>{lang === "pt" ? "Novo papel" : "New role"}</Label>
                <Select value={newRole} onValueChange={setNewRole}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {ROLE_LABELS[r][lang as "pt" | "en"]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {newRole === "admin" && (
                <p className="rounded-md bg-destructive/10 p-2 text-xs text-destructive">
                  {lang === "pt"
                    ? "⚠️ Administradores têm acesso total ao sistema, incluindo gerenciamento de papéis."
                    : "⚠️ Administrators have full system access, including role management."}
                </p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleTarget(null)}>{t("crud.cancel")}</Button>
            <Button
              onClick={handleRoleChange}
              disabled={changingRole || newRole === roleTarget?.role}
            >
              {changingRole ? "..." : (lang === "pt" ? "Confirmar" : "Confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── User Edit Dialog ────────────────────────────────────────────────────────

function UserEditDialog({
  open, onOpenChange, user, departments, onSaved, lang, t,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  user: import("@/types/domain").User | null;
  departments: { slug: string; label: string }[];
  onSaved: () => void;
  lang: "pt" | "en";
  t: (k: string) => string;
}) {
  const [name, setName] = useState("");
  const [preferredName, setPreferredName] = useState("");
  const [position, setPosition] = useState("");
  const [deptSlug, setDeptSlug] = useState("");
  const [phone, setPhone] = useState("");
  const [extension, setExtension] = useState("");
  const [location, setLocation] = useState("");
  const [unit, setUnit] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");
  const [tags, setTags] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name); setPreferredName(user.preferredName);
      setPosition(user.position); setDeptSlug(user.departmentSlug);
      setPhone(user.phone ?? ""); setExtension(user.extension);
      setLocation(user.location); setUnit(user.unit);
      setBio(user.bio); setSkills(user.skills.join(", "));
      setTags(user.tags.join(", "));
    }
  }, [user, open]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const dept = departments.find((d) => d.slug === deptSlug);
      await employeesService.update(user.profileId, {
        name, preferredName, position,
        departmentSlug: deptSlug,
        department: dept?.label ?? user.department,
        phone: phone || undefined,
        extension, location, unit, bio,
        skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      });
      await auditService.log("edit", "profiles", user.profileId, { name });
      toast.success(t("toast.updated"));
      onSaved();
      onOpenChange(false);
    } catch { toast.error(t("toast.error")); } finally { setSaving(false); }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("crud.edit")} — {user.name}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label>{lang === "pt" ? "Nome completo" : "Full name"}</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{lang === "pt" ? "Nome preferido" : "Preferred name"}</Label>
            <Input value={preferredName} onChange={(e) => setPreferredName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{lang === "pt" ? "Cargo" : "Job title"}</Label>
            <Input value={position} onChange={(e) => setPosition(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{lang === "pt" ? "Departamento" : "Department"}</Label>
            <Select value={deptSlug} onValueChange={setDeptSlug}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {departments.map((d) => (
                  <SelectItem key={d.slug} value={d.slug}>{d.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{lang === "pt" ? "Telefone" : "Phone"}</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{lang === "pt" ? "Ramal" : "Extension"}</Label>
            <Input value={extension} onChange={(e) => setExtension(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{lang === "pt" ? "Localização" : "Location"}</Label>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{lang === "pt" ? "Unidade" : "Unit"}</Label>
            <Input value={unit} onChange={(e) => setUnit(e.target.value)} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>{lang === "pt" ? "Sobre" : "Bio"}</Label>
            <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} />
          </div>
          <div className="space-y-2">
            <Label>{lang === "pt" ? "Competências" : "Skills"}</Label>
            <Input value={skills} onChange={(e) => setSkills(e.target.value)} placeholder={lang === "pt" ? "Separadas por vírgula" : "Comma-separated"} />
          </div>
          <div className="space-y-2">
            <Label>Tags</Label>
            <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder={lang === "pt" ? "Separadas por vírgula" : "Comma-separated"} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("crud.cancel")}</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "..." : t("crud.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Institutional CRUD Tab ──────────────────────────────────────────────────

const instCategories: InstitutionalCategory[] = ["onboarding", "compliance", "ethics", "cipa", "lgpd", "quality", "departmental", "general"];

function InstitutionalCrudTab({ t, lang }: { t: (k: string) => string; lang: "pt" | "en" }) {
  const [pages, setPages] = useState<InstitutionalPage[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [editPage, setEditPage] = useState<InstitutionalPage | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    institutionalPagesService
      .list({
        search: search || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
        category: categoryFilter === "all" ? undefined : categoryFilter,
        pageSize: 100,
      })
      .then((res) => setPages(res.data))
      .catch(() => setPages([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search, statusFilter, categoryFilter]);

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await institutionalPagesService.delete(deletingId);
      await auditService.log("delete", "institutional_page", deletingId);
      toast.success(t("toast.deleted"));
      load();
    } catch { toast.error(t("toast.error")); }
    setDeletingId(null);
  };

  const handlePublish = async (id: string) => {
    try {
      await institutionalPagesService.publish(id);
      await auditService.log("publish", "institutional_page", id);
      toast.success(t("toast.published"));
      load();
    } catch { toast.error(t("toast.error")); }
  };

  const handleArchive = async (id: string) => {
    try {
      await institutionalPagesService.archive(id);
      await auditService.log("archive", "institutional_page", id);
      toast.success(t("toast.archived"));
      load();
    } catch { toast.error(t("toast.error")); }
  };

  return (
    <>
      <DataTableShell
        title={t("inst.title")}
        description={lang === "pt" ? "Gerenciar páginas institucionais" : "Manage institutional pages"}
        searchPlaceholder={lang === "pt" ? "Buscar páginas..." : "Search pages..."}
        searchValue={search}
        onSearchChange={setSearch}
        onCreateClick={() => setShowCreate(true)}
        createLabel={lang === "pt" ? "Nova Página" : "New Page"}
        totalItems={pages.length}
        filters={
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] bg-secondary border-0"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("crud.status")}</SelectItem>
                <SelectItem value="draft">{lang === "pt" ? "Rascunho" : "Draft"}</SelectItem>
                <SelectItem value="review">{lang === "pt" ? "Em Revisão" : "In Review"}</SelectItem>
                <SelectItem value="published">{lang === "pt" ? "Publicado" : "Published"}</SelectItem>
                <SelectItem value="archived">{lang === "pt" ? "Arquivado" : "Archived"}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[160px] bg-secondary border-0"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{lang === "pt" ? "Categoria" : "Category"}</SelectItem>
                {instCategories.map((c) => (
                  <SelectItem key={c} value={c}>{t(`inst.cat.${c}`)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      >
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : pages.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title={lang === "pt" ? "Nenhuma página institucional" : "No institutional pages"}
            description={lang === "pt"
              ? "Crie páginas sobre onboarding, compliance, ética, LGPD e outras informações institucionais."
              : "Create pages about onboarding, compliance, ethics, LGPD and other institutional information."}
          />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">{lang === "pt" ? "Título" : "Title"}</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">{lang === "pt" ? "Categoria" : "Category"}</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("crud.status")}</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">{lang === "pt" ? "Idioma" : "Language"}</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">{t("crud.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {pages.map((page) => (
                  <tr key={page.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div>
                        <span className="font-medium text-foreground">{page.title}</span>
                        {page.isFeatured && <Star className="ml-1.5 inline h-3 w-3 text-amber-500" />}
                      </div>
                      <span className="text-xs text-muted-foreground">/{page.slug}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-[10px]">{t(`inst.cat.${page.category}`)}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={page.status} lang={lang} />
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-[10px]">{page.language.toUpperCase()}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditPage(page)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        {(page.status === "draft" || page.status === "review") && (
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-chart-2" onClick={() => handlePublish(page.id)}>
                            <Send className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {page.status === "published" && (
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={() => handleArchive(page.id)}>
                            <Archive className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeletingId(page.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DataTableShell>

      {(showCreate || editPage) && (
        <InstitutionalEditDialog
          page={editPage}
          open={showCreate || !!editPage}
          onOpenChange={(open) => { if (!open) { setShowCreate(false); setEditPage(null); } }}
          onSaved={() => { setShowCreate(false); setEditPage(null); load(); }}
          t={t}
          lang={lang}
        />
      )}

      <ConfirmDialog
        open={!!deletingId}
        onOpenChange={(o) => !o && setDeletingId(null)}
        title={t("crud.confirmDelete")}
        description={t("crud.confirmDeleteDesc")}
        confirmLabel={t("crud.delete")}
        onConfirm={handleDelete}
        variant="destructive"
      />
    </>
  );
}

function InstitutionalEditDialog({
  page, open, onOpenChange, onSaved, t, lang,
}: {
  page: InstitutionalPage | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSaved: () => void;
  t: (k: string) => string;
  lang: "pt" | "en";
}) {
  const isEdit = !!page;
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [contentHtml, setContentHtml] = useState("");
  const [category, setCategory] = useState<InstitutionalCategory>("general");
  const [tags, setTags] = useState("");
  const [language, setLanguage] = useState("pt");
  const [status, setStatus] = useState<ContentStatus>("draft");
  const [visibility, setVisibility] = useState("public");
  const [ownerDepartment, setOwnerDepartment] = useState("");
  const [responsibleUser, setResponsibleUser] = useState("");
  const [author, setAuthor] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (page) {
      setTitle(page.title); setSummary(page.summary);
      setContentHtml(page.contentHtml); setCategory(page.category as InstitutionalCategory);
      setTags(page.tags.join(", ")); setLanguage(page.language);
      setStatus(page.status as ContentStatus); setVisibility(page.visibility);
      setOwnerDepartment(page.ownerDepartment); setResponsibleUser(page.responsibleUser);
      setAuthor(page.author); setIsFeatured(page.isFeatured);
    } else {
      setTitle(""); setSummary(""); setContentHtml(""); setCategory("general");
      setTags(""); setLanguage("pt"); setStatus("draft"); setVisibility("public");
      setOwnerDepartment(""); setResponsibleUser(""); setAuthor(""); setIsFeatured(false);
    }
  }, [page, open]);

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const input = {
        title: title.trim(),
        summary: summary.trim(),
        contentHtml,
        category,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        language: language as "pt" | "en",
        status,
        visibility: visibility as any,
        ownerDepartment,
        responsibleUser,
        author,
        isFeatured,
        publishedAt: status === "published" ? new Date().toISOString() : page?.publishedAt ?? null,
      };

      if (isEdit) {
        await institutionalPagesService.update(page.id, input);
        await auditService.log("update", "institutional_page", page.id);
      } else {
        const created = await institutionalPagesService.create({ ...input, title: input.title });
        await auditService.log("create", "institutional_page", created.id);
      }
      toast.success(isEdit ? t("toast.updated") : t("toast.created"));
      onSaved();
    } catch {
      toast.error(t("toast.error"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? (lang === "pt" ? "Editar Página" : "Edit Page") : (lang === "pt" ? "Nova Página Institucional" : "New Institutional Page")}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label>{lang === "pt" ? "Título" : "Title"} *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>{lang === "pt" ? "Resumo" : "Summary"}</Label>
            <Textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={2} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>{lang === "pt" ? "Conteúdo (HTML)" : "Content (HTML)"}</Label>
            <Textarea value={contentHtml} onChange={(e) => setContentHtml(e.target.value)} rows={6} className="font-mono text-xs" />
          </div>
          <div className="space-y-2">
            <Label>{lang === "pt" ? "Categoria" : "Category"}</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as InstitutionalCategory)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {instCategories.map((c) => (
                  <SelectItem key={c} value={c}>{t(`inst.cat.${c}`)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t("crud.status")}</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as ContentStatus)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">{lang === "pt" ? "Rascunho" : "Draft"}</SelectItem>
                <SelectItem value="review">{lang === "pt" ? "Em Revisão" : "In Review"}</SelectItem>
                <SelectItem value="published">{lang === "pt" ? "Publicado" : "Published"}</SelectItem>
                <SelectItem value="archived">{lang === "pt" ? "Arquivado" : "Archived"}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{lang === "pt" ? "Idioma" : "Language"}</Label>
            <Select value={language} onValueChange={(v) => setLanguage(v as "pt" | "en")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pt">Português</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{lang === "pt" ? "Visibilidade" : "Visibility"}</Label>
            <Select value={visibility} onValueChange={(v) => setVisibility(v as "public" | "department" | "restricted")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="public">{lang === "pt" ? "Público" : "Public"}</SelectItem>
                <SelectItem value="department">{lang === "pt" ? "Departamento" : "Department"}</SelectItem>
                <SelectItem value="restricted">{lang === "pt" ? "Restrito" : "Restricted"}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{lang === "pt" ? "Departamento Responsável" : "Owner Department"}</Label>
            <Input value={ownerDepartment} onChange={(e) => setOwnerDepartment(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{lang === "pt" ? "Responsável" : "Responsible"}</Label>
            <Input value={responsibleUser} onChange={(e) => setResponsibleUser(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{lang === "pt" ? "Autor" : "Author"}</Label>
            <Input value={author} onChange={(e) => setAuthor(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Tags</Label>
            <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder={lang === "pt" ? "Separadas por vírgula" : "Comma-separated"} />
          </div>
          <div className="flex items-center gap-3 pt-2">
            <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
            <Label>{lang === "pt" ? "Destaque" : "Featured"}</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("crud.cancel")}</Button>
          <Button onClick={handleSave} disabled={saving || !title.trim()}>
            {saving ? "..." : t("crud.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
