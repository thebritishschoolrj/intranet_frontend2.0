import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import {
  Newspaper, Pin, TrendingUp, ChevronRight, AlertTriangle, AlertCircle,
  CheckCircle2, Search, Clock, Eye, Megaphone, CalendarDays, ThumbsUp,
  MessageSquare, Cake, UserPlus, ExternalLink, BookOpen, FileText,
  Users, Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AppLayout } from "@/components/layout/AppLayout";
import { useI18n } from "@/hooks/use-i18n";
import { newsService } from "@/services/data.service";
import type { NewsArticle } from "@/types/domain";

export const Route = createFileRoute("/_authenticated/noticias")({
  component: NewsPage,
  head: () => ({
    meta: [
      { title: "Notícias — Intranet 2.0" },
      { name: "description", content: "Notícias e comunicados internos da organização." },
    ],
  }),
});

const categories = ["all", "aviso", "evento", "comunicado", "campanha"] as const;

const categoryColors: Record<string, { dot: string; bg: string; text: string }> = {
  aviso:      { dot: "bg-amber-500",   bg: "bg-amber-500/10",  text: "text-amber-700 dark:text-amber-400" },
  evento:     { dot: "bg-blue-500",    bg: "bg-blue-500/10",   text: "text-blue-700 dark:text-blue-400" },
  comunicado: { dot: "bg-emerald-500", bg: "bg-emerald-500/10", text: "text-emerald-700 dark:text-emerald-400" },
  campanha:   { dot: "bg-violet-500",  bg: "bg-violet-500/10",  text: "text-violet-700 dark:text-violet-400" },
};

function formatRelative(date: string | null, lang: string) {
  if (!date) return "";
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return lang === "pt" ? "Hoje" : "Today";
  if (diffDays === 1) return lang === "pt" ? "Ontem" : "Yesterday";
  if (diffDays < 7) return lang === "pt" ? `${diffDays} dias atrás` : `${diffDays} days ago`;
  return new Date(date).toLocaleDateString(lang === "pt" ? "pt-BR" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

// Mock data for sidebar widgets
const mockBirthdays = [
  { name: "Juliana Costa", department: "Contratos", day: "14" },
  { name: "Ana Paula Santos", department: "Depto. Pessoal", day: "18" },
  { name: "Beatriz Cardoso", department: "RH", day: "22" },
];

const mockNewHires = [
  { name: "Lucas Fernandes", position: "Analista de Dados", department: "TI" },
  { name: "Marina Alves", position: "Designer UX", department: "Marketing" },
];

const quickLinks = [
  { icon: FileText, label: { pt: "Documentos", en: "Documents" }, href: "/documentos" },
  { icon: BookOpen, label: { pt: "Procedimentos", en: "Procedures" }, href: "/procedimentos" },
  { icon: Users, label: { pt: "Colaboradores", en: "Employees" }, href: "/colaboradores" },
];

function NewsPage() {
  const location = useLocation();

  if (location.pathname.startsWith("/noticias/")) {
    return <Outlet />;
  }

  return <NewsListView />;
}

function NewsListView() {
  const { t, lang } = useI18n();
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [featured, setFeatured] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const data = await newsService.listFeatured();
        setFeatured(data);
      } catch (err) {
        console.error("Failed to load featured news", err);
        setFeatured([]);
      }
    };
    void loadFeatured();
  }, []);

  useEffect(() => {
    const loadNews = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await newsService.list({
          category: filter === "all" ? undefined : filter,
          search: search || undefined,
          status: "published",
          pageSize: 20,
          page,
          sortBy: "published_at",
          sortOrder: "desc",
        });
        setArticles(res.data);
        setTotalPages(res.totalPages);
      } catch (err) {
        console.error("Failed to load news list", err);
        setArticles([]);
        setTotalPages(1);
        setError(err instanceof Error ? err.message : "Falha ao carregar notícias.");
      } finally {
        setLoading(false);
      }
    };
    void loadNews();
  }, [filter, search, page]);

  const urgentItems = useMemo(
    () => articles.filter((a) => a.priority === "urgent" || a.priority === "important"),
    [articles]
  );
  const mandatoryItems = useMemo(
    () => articles.filter((a) => a.isMandatory),
    [articles]
  );

  return (
    <AppLayout>
      <div className="space-y-5">
        {/* ─── Page Header ──────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Megaphone className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-foreground">
                {t("news.title")}
              </h1>
              <p className="text-xs text-muted-foreground">
                {lang === "pt" ? "Central de comunicação interna" : "Internal communication hub"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={lang === "pt" ? "Buscar..." : "Search..."}
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="h-8 pl-8 text-xs bg-card border-border"
              />
            </div>
          </div>
        </motion.div>

        {/* ─── Category Filters ─────────────────────────────────────── */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1">
          {categories.map((cat) => {
            const isActive = filter === cat;
            const color = cat !== "all" ? categoryColors[cat] : null;
            return (
              <button
                key={cat}
                onClick={() => { setFilter(cat); setPage(1); }}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? "bg-foreground text-background shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {color && !isActive && <span className={`inline-block h-1.5 w-1.5 rounded-full ${color.dot}`} />}
                {cat === "all" ? t("news.all") : t(`news.${cat}`)}
              </button>
            );
          })}
        </div>

        {/* ─── Main Two-Column Grid ─────────────────────────────────── */}
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          {/* ─── Center: Feed ───────────────────────────────────────── */}
          <div className="min-w-0 space-y-4">
            {/* Featured posts - same style as regular feed with a badge */}
            {featured.length > 0 && featured.slice(0, 3).map((article, i) => (
              <FeedPost key={`feat-${article.id}`} article={article} index={i} lang={lang} t={t} isFeatured />
            ))}

            {/* Feed list */}
            {loading ? (
              <div className="flex justify-center py-16">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
              </div>
            ) : error ? (
              <Card className="border-destructive/20 bg-destructive/5">
                <CardContent className="p-4 text-sm text-destructive">
                  <p>{lang === "pt" ? "Falha ao carregar notícias." : "Failed to load news."}</p>
                  {import.meta.env.DEV && <p className="mt-1 font-mono text-xs">{error}</p>}
                </CardContent>
              </Card>
            ) : articles.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <Newspaper className="mb-3 h-10 w-10 opacity-30" />
                  <p className="text-sm font-medium">{lang === "pt" ? "Nenhuma notícia encontrada" : "No news found"}</p>
                  <p className="mt-1 text-xs">{lang === "pt" ? "Tente ajustar os filtros" : "Try adjusting filters"}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {articles.map((article, i) => (
                  <FeedPost key={article.id} article={article} index={i} lang={lang} t={t} />
                ))}
              </div>
            )}

            {!loading && totalPages > 1 && page < totalPages && (
              <div className="flex justify-center pt-2 pb-4">
                <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} className="gap-2">
                  {lang === "pt" ? "Carregar mais comunicados" : "Load more posts"}
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>

          {/* ─── Right Sidebar ──────────────────────────────────────── */}
          <aside className="hidden space-y-4 lg:block">
            {/* Urgent / Important */}
            {urgentItems.length > 0 && (
              <Card className="border-destructive/25 bg-destructive/[0.02]">
                <CardHeader className="pb-2 pt-3.5 px-4">
                  <CardTitle className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-destructive">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {lang === "pt" ? "Atenção Imediata" : "Immediate Attention"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-3.5">
                  {urgentItems.slice(0, 3).map((item, i) => (
                    <div key={item.id}>
                      <Link to="/noticias/$slug" params={{ slug: item.slug }}>
                        <div className="group rounded-md px-2 py-2 transition-colors hover:bg-accent/50 cursor-pointer">
                          <div className="flex items-start gap-2">
                            <div className={`mt-1 h-2 w-2 shrink-0 rounded-full ${item.priority === "urgent" ? "bg-destructive" : "bg-amber-500"}`} />
                            <div>
                              <p className="text-[12px] font-semibold leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2">
                                {item.title}
                              </p>
                              <p className="mt-0.5 text-[10px] text-muted-foreground">
                                {formatRelative(item.publishedAt, lang)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </Link>
                      {i < Math.min(urgentItems.length, 3) - 1 && <Separator className="my-1 opacity-50" />}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Mandatory reads */}
            {mandatoryItems.length > 0 && (
              <Card>
                <CardHeader className="pb-2 pt-3.5 px-4">
                  <CardTitle className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                    {lang === "pt" ? "Leitura Obrigatória" : "Mandatory Read"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-3.5">
                  {mandatoryItems.slice(0, 3).map((item) => (
                    <Link key={item.id} to="/noticias/$slug" params={{ slug: item.slug }}>
                      <div className="group rounded-md px-2 py-2 transition-colors hover:bg-accent/50 cursor-pointer">
                        <p className="text-[12px] font-medium leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2">
                          {item.title}
                        </p>
                        <p className="mt-0.5 text-[10px] text-muted-foreground">
                          {formatRelative(item.publishedAt, lang)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Birthdays */}
            <Card>
              <CardHeader className="pb-2 pt-3.5 px-4">
                <CardTitle className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  <Cake className="h-3.5 w-3.5 text-pink-500" />
                  {lang === "pt" ? "Aniversariantes" : "Birthdays"}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-3.5 space-y-2">
                {mockBirthdays.map((person) => (
                  <div key={person.name} className="flex items-center gap-2.5">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="bg-pink-500/10 text-pink-600 dark:text-pink-400 text-[10px] font-bold">
                        {getInitials(person.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12px] font-medium text-foreground">{person.name}</p>
                      <p className="text-[10px] text-muted-foreground">{person.department} · {lang === "pt" ? "Dia" : "Day"} {person.day}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* New employees */}
            <Card>
              <CardHeader className="pb-2 pt-3.5 px-4">
                <CardTitle className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  <UserPlus className="h-3.5 w-3.5 text-emerald-500" />
                  {lang === "pt" ? "Novos Colaboradores" : "New Employees"}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-3.5 space-y-2">
                {mockNewHires.map((person) => (
                  <div key={person.name} className="flex items-center gap-2.5">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                        {getInitials(person.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12px] font-medium text-foreground">{person.name}</p>
                      <p className="text-[10px] text-muted-foreground">{person.position} · {person.department}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick links */}
            <Card>
              <CardHeader className="pb-2 pt-3.5 px-4">
                <CardTitle className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  <ExternalLink className="h-3.5 w-3.5" />
                  {lang === "pt" ? "Acesso Rápido" : "Quick Links"}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-3.5 space-y-0.5">
                {quickLinks.map((link) => (
                  <Link key={link.href} to={link.href}>
                    <div className="flex items-center gap-2.5 rounded-md px-2 py-2 text-[12px] font-medium text-foreground transition-colors hover:bg-accent/50 cursor-pointer">
                      <link.icon className="h-3.5 w-3.5 text-muted-foreground" />
                      {link.label[lang as "pt" | "en"]}
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>

            {/* Stats */}
            <Card className="bg-muted/30 border-border/40">
              <CardContent className="p-3.5">
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>
                    {lang === "pt"
                      ? `${articles.length} comunicados exibidos`
                      : `${articles.length} items displayed`}
                  </span>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </AppLayout>
  );
}

/* ─── Feed Post Card (Professional corporate style) ───────────────────────── */

function FeedPost({ article, index, lang, t, isFeatured = false }: { article: NewsArticle; index: number; lang: string; t: (key: string) => string; isFeatured?: boolean }) {
  const isUrgent = article.priority === "urgent";
  const isImportant = article.priority === "important";
  const isElevated = isUrgent || isImportant || article.isMandatory;
  const color = categoryColors[article.category] ?? { dot: "bg-muted-foreground", bg: "bg-muted", text: "text-muted-foreground" };

  // Simulated engagement data (would come from DB in production)
  const reactionCount = Math.floor(article.title.length % 20) + 3;
  const commentCount = Math.floor(article.title.length % 8);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.25 }}
    >
      <Card className={`group relative overflow-hidden transition-all hover:shadow-sm ${
        isUrgent
          ? "border-destructive/40"
          : isImportant
          ? "border-amber-500/40"
          : article.isMandatory
          ? "border-primary/40"
          : "border-border/60"
      }`}>
        {/* Priority accent bar - more prominent */}
        {isElevated && (
          <div className={`absolute left-0 top-0 bottom-0 w-1 ${
            isUrgent ? "bg-destructive" : article.isMandatory ? "bg-primary" : "bg-amber-500"
          }`} />
        )}

        <CardContent className={`p-0 ${isElevated ? "pl-1" : ""}`}>
          {/* ── Header: Author + Meta + Priority ───────────────────── */}
          <div className="px-5 pt-5 pb-3">
            {isFeatured && (
              <div className="mb-3 flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-primary" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                  {t("news.featured")}
                </span>
              </div>
            )}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarFallback className={`text-xs font-semibold ${
                    isElevated ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                  }`}>
                    {getInitials(article.author)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-foreground truncate">{article.author}</p>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span>{formatRelative(article.publishedAt, lang)}</span>
                    <span className="text-border">·</span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className={`inline-block h-1.5 w-1.5 rounded-full ${color.dot}`} />
                      <span className={color.text}>{t(`news.${article.category}`)}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Priority badges - cleaner, more professional */}
              <div className="flex items-center gap-1.5 shrink-0">
                {isUrgent && (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-destructive">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {lang === "pt" ? "Urgente" : "Urgent"}
                  </span>
                )}
                {!isUrgent && isImportant && (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {lang === "pt" ? "Importante" : "Important"}
                  </span>
                )}
                {article.isMandatory && (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-primary">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {lang === "pt" ? "Obrigatório" : "Required"}
                  </span>
                )}
                {article.pinned && <Pin className="h-3.5 w-3.5 text-muted-foreground" />}
              </div>
            </div>
          </div>

          {/* ── Content: Title + Summary ───────────────────────────── */}
          <Link to="/noticias/$slug" params={{ slug: article.slug }}>
            <div className="px-5 pb-3 cursor-pointer">
              <h3 className={`font-bold text-foreground group-hover:text-primary transition-colors leading-tight ${
                isElevated ? "text-lg" : "text-[17px]"
              }`}>
                {article.title}
              </h3>

              {article.excerpt && (
                <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground/80 line-clamp-2">
                  {article.excerpt}
                </p>
              )}
            </div>
          </Link>

          {/* ── Cover image (post-style, edge-to-edge) ─────────── */}
          {article.coverImage && (
            <Link to="/noticias/$slug" params={{ slug: article.slug }}>
              <div className="cursor-pointer overflow-hidden">
                <img
                  src={article.coverImage}
                  alt={article.title}
                  className="w-full object-cover transition-transform duration-300 group-hover:scale-[1.01]"
                  style={{ maxHeight: 340 }}
                  loading="lazy"
                />
              </div>
            </Link>
          )}

          {/* ── Footer: Stats + Actions ────────────────────────────── */}
          <div className="px-5 pb-4 pt-1">
            {/* Stats row - minimal */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
                <ThumbsUp className="h-3.5 w-3.5 text-primary" />
                <span>{reactionCount}</span>
              </div>
              {commentCount > 0 && (
                <span className="text-[12px] text-muted-foreground">
                  {commentCount} {lang === "pt" ? (commentCount === 1 ? "comentário" : "comentários") : (commentCount === 1 ? "comment" : "comments")}
                </span>
              )}
            </div>

            {/* Actions - clean, professional */}
            <Separator className="mb-2" />
            <div className="flex items-center gap-1">
              <button className="flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground">
                <ThumbsUp className="h-4 w-4" />
                {lang === "pt" ? "Reagir" : "React"}
              </button>
              <button className="flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground">
                <MessageSquare className="h-4 w-4" />
                {lang === "pt" ? "Comentar" : "Comment"}
              </button>
              <Link to="/noticias/$slug" params={{ slug: article.slug }} className="flex flex-1">
                <button className="flex w-full items-center justify-center gap-2 rounded-md py-2 text-[13px] font-medium text-primary transition-colors hover:bg-primary/5">
                  {lang === "pt" ? "Ler comunicado" : "Read post"}
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}