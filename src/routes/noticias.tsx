import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Newspaper, Pin, Calendar, Star, Tag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AppLayout } from "@/components/layout/AppLayout";
import { useI18n } from "@/hooks/use-i18n";
import { newsService } from "@/services/data.service";
import type { NewsArticle } from "@/types/domain";

export const Route = createFileRoute("/noticias")({
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
        pageSize: 12,
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
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("news.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {lang === "pt" ? "Fique por dentro das novidades e comunicados internos" : "Stay up to date with internal news and announcements"}
          </p>
        </div>

        {/* Featured Section */}
        {featured.length > 0 && (
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
              <Star className="h-5 w-5 text-chart-4" /> {t("news.featured")}
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {featured.map((article, i) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link to="/noticias/$slug" params={{ slug: article.slug }}>
                    <Card className="group h-full cursor-pointer border-chart-4/30 bg-chart-4/5 transition-shadow hover:shadow-lg">
                      <CardContent className="flex h-full flex-col p-5">
                        <div className="mb-3 flex items-center gap-2">
                          <Badge variant="outline" className={`text-[10px] ${categoryColors[article.category] ?? ""}`}>
                            {t(`news.${article.category}`)}
                          </Badge>
                          <Badge variant="secondary" className="gap-1 text-[10px]">
                            <Star className="h-2.5 w-2.5" /> {t("news.featured")}
                          </Badge>
                        </div>
                        <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{article.title}</h3>
                        <p className="mt-2 flex-1 text-xs leading-relaxed text-muted-foreground line-clamp-3">{article.excerpt}</p>
                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString("pt-BR") : "—"}
                          </div>
                          <span className="text-xs font-medium text-primary">{t("news.readMore")} →</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-xs">
            <Input
              placeholder={lang === "pt" ? "Buscar notícias..." : "Search news..."}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="bg-secondary border-0"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={filter === cat ? "default" : "outline"}
                size="sm"
                className="text-xs"
                onClick={() => { setFilter(cat); setPage(1); }}
              >
                {cat === "all" ? t("news.all") : t(`news.${cat}`)}
              </Button>
            ))}
          </div>
        </div>

        {/* Articles Grid */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">{t("news.latest")}</h2>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : articles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Newspaper className="mb-3 h-10 w-10" />
              <p className="text-sm">{lang === "pt" ? "Nenhuma notícia encontrada" : "No news found"}</p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {articles.map((article, i) => (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link to="/noticias/$slug" params={{ slug: article.slug }}>
                      <Card className="group h-full cursor-pointer transition-shadow hover:shadow-lg">
                        <CardContent className="flex h-full flex-col p-5">
                          <div className="mb-3 flex items-center gap-2">
                            <Badge variant="outline" className={`text-[10px] ${categoryColors[article.category] ?? ""}`}>
                              {t(`news.${article.category}`)}
                            </Badge>
                            {article.pinned && (
                              <Badge variant="secondary" className="gap-1 text-[10px]">
                                <Pin className="h-2.5 w-2.5" /> {t("news.pinned")}
                              </Badge>
                            )}
                          </div>
                          <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{article.title}</h3>
                          <p className="mt-2 flex-1 text-xs leading-relaxed text-muted-foreground line-clamp-3">{article.excerpt}</p>
                          <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString("pt-BR") : "—"}
                            </div>
                            <span className="text-xs font-medium text-primary">{t("news.readMore")} →</span>
                          </div>
                          {article.tags.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {article.tags.slice(0, 3).map((tag) => (
                                <span key={tag} className="text-[9px] text-muted-foreground">#{tag}</span>
                              ))}
                            </div>
                          )}
                          <p className="mt-1 text-[10px] text-muted-foreground">{article.author}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-center gap-2">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                    {lang === "pt" ? "Anterior" : "Previous"}
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {page} / {totalPages}
                  </span>
                  <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                    {lang === "pt" ? "Próxima" : "Next"}
                  </Button>
                </div>
              )}
            </>
          )}
        </section>
      </motion.div>
    </AppLayout>
  );
}
