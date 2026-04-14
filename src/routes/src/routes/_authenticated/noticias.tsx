import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Newspaper, Pin, Star, TrendingUp, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { AppLayout } from "@/components/layout/AppLayout";
import { useI18n } from "@/hooks/use-i18n";
import { newsService } from "@/services/data.service";
import type { NewsArticle } from "@/types/domain";

export const Route = createFileRoute("/src/routes/_authenticated/noticias")({
  component: NewsPage,
  head: () => ({
    meta: [
      { title: "Notícias — Intranet 2.0" },
      { name: "description", content: "Notícias e comunicados internos da organização." },
    ],
  }),
});

const categories = ["all", "aviso", "evento", "comunicado", "campanha"] as const;

const categoryColors: Record<string, string> = {
  aviso: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  evento: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  comunicado: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  campanha: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};

function formatDate(date: string | null, lang: string) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString(lang === "pt" ? "pt-BR" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function NewsPage() {
  const { t, lang } = useI18n();
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [featured, setFeatured] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    newsService.listFeatured().then(setFeatured).catch(() => setFeatured([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    newsService
      .list({
        category: filter === "all" ? undefined : filter,
        search: search || undefined,
        status: "published",
        pageSize: 20,
        page,
        sortBy: "published_at",
        sortOrder: "desc",
      })
      .then((res) => {
        setArticles(res.data);
        setTotalPages(res.totalPages);
      })
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, [filter, search, page]);

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl px-4 py-6 md:py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            {t("news.title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {lang === "pt" ? "Comunicados, avisos e eventos internos" : "Internal announcements, notices and events"}
          </p>
        </div>

        {/* Filters row */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => { setFilter(cat); setPage(1); }}
                className={`whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  filter === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                }`}
              >
                {cat === "all" ? t("news.all") : t(`news.${cat}`)}
              </button>
            ))}
          </div>
          <Input
            placeholder={lang === "pt" ? "Buscar notícias..." : "Search news..."}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full sm:max-w-[240px]"
          />
        </div>

        {/* Featured */}
        {featured.length > 0 && (
          <div className="mb-8 rounded-lg border border-border bg-card p-5">
            <h2 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              {t("news.featured")}
            </h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {featured.slice(0, 3).map((article) => (
                <Link key={article.id} to="/noticias/$slug" params={{ slug: article.slug }}>
                  <div className="group rounded-md border border-border bg-background p-4 transition-colors hover:border-primary/30 hover:bg-accent/50">
                    <Badge variant="outline" className={`mb-2 text-[10px] ${categoryColors[article.category] ?? ""}`}>
                      {t(`news.${article.category}`)}
                    </Badge>
                    <h3 className="text-sm font-semibold leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <span className="mt-2 block text-xs text-muted-foreground">
                      {formatDate(article.publishedAt, lang)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Feed */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-muted-foreground">
            <Newspaper className="mb-3 h-10 w-10" />
            <p className="text-sm">{lang === "pt" ? "Nenhuma notícia encontrada" : "No news found"}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {articles.map((article, i) => (
              <FeedCard key={article.id} article={article} index={i} lang={lang} t={t} />
            ))}

            {totalPages > 1 && page < totalPages && (
              <div className="pt-4 text-center">
                <Button
                  variant="outline"
                  onClick={() => setPage(page + 1)}
                >
                  {lang === "pt" ? "Carregar mais" : "Load more"}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function FeedCard({ article, index, lang, t }: { article: NewsArticle; index: number; lang: string; t: (key: string) => string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
    >
      <Link to="/noticias/$slug" params={{ slug: article.slug }}>
        <article className="group rounded-lg border border-border bg-card p-5 transition-all hover:border-primary/20 hover:shadow-sm cursor-pointer">
          {/* Top row: category + indicators */}
          <div className="mb-2 flex items-center gap-2">
            <Badge variant="outline" className={`text-[10px] ${categoryColors[article.category] ?? ""}`}>
              {t(`news.${article.category}`)}
            </Badge>
            {article.pinned && (
              <span className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
                <Pin className="h-3 w-3" /> {lang === "pt" ? "Fixado" : "Pinned"}
              </span>
            )}
            {article.isFeatured && (
              <span className="flex items-center gap-1 text-[10px] font-medium text-chart-4">
                <Star className="h-3 w-3" /> {t("news.featured")}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-base font-semibold leading-snug text-foreground group-hover:text-primary transition-colors md:text-lg">
            {article.title}
          </h3>

          {/* Excerpt */}
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground line-clamp-2">
            {article.excerpt}
          </p>

          {/* Meta row */}
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span>{article.author}</span>
            <span className="text-border">•</span>
            <span>{formatDate(article.publishedAt, lang)}</span>
            {article.tags.length > 0 && (
              <>
                <span className="text-border">•</span>
                <span className="flex gap-1.5">
                  {article.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="text-primary/70">#{tag}</span>
                  ))}
                </span>
              </>
            )}
          </div>

          {/* Read more hint */}
          <div className="mt-3 flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
            {lang === "pt" ? "Ler mais" : "Read more"} <ChevronRight className="h-3 w-3" />
          </div>
        </article>
      </Link>
    </motion.div>
  );
}
