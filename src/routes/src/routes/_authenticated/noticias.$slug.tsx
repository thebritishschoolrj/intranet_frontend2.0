import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, User, Tag, Clock, Pin, Star, Paperclip } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AppLayout } from "@/components/layout/AppLayout";
import { useI18n } from "@/hooks/use-i18n";
import { newsService } from "@/services/data.service";
import { supabase } from "@/integrations/supabase/client";
import type { NewsArticle, FileAttachment } from "@/types/domain";

export const Route = createFileRoute("/src/routes/_authenticated/noticias/$slug")({
  component: NewsDetailPage,
  head: () => ({
    meta: [
      { title: "Notícia — Intranet" },
      { name: "description", content: "Detalhes da notícia" },
    ],
  }),
});

const categoryColors: Record<string, string> = {
  aviso: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  evento: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  comunicado: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  campanha: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};

function NewsDetailPage() {
  const { t } = useI18n();
  const { slug } = Route.useParams();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    newsService.getBySlug(slug)
      .then(async (art) => {
        if (art) {
          // Load attachments from file_attachments table
          const { data: attachments } = await supabase
            .from("file_attachments")
            .select("*")
            .eq("entity_type", "news")
            .eq("entity_id", art.id);
          if (attachments && attachments.length > 0) {
            art.attachments = attachments.map((a) => ({
              id: a.id,
              name: a.name,
              type: a.file_type as FileAttachment["type"],
              size: a.size,
              sizeFormatted: a.size_formatted,
              url: a.url,
              language: a.language as "pt" | "en",
              uploadedAt: a.created_at,
              uploadedBy: a.uploaded_by ?? "unknown",
            }));
          }
        }
        setArticle(art);
      })
      .catch(() => setArticle(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </AppLayout>
    );
  }

  if (!article) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <h2 className="text-lg font-bold text-foreground">Notícia não encontrada</h2>
          <Link to="/noticias">
            <Button variant="outline" className="mt-4 gap-2">
              <ArrowLeft className="h-4 w-4" /> {t("news.backToList")}
            </Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-3xl space-y-6">
        <Link to="/noticias">
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
            <ArrowLeft className="h-4 w-4" /> {t("news.backToList")}
          </Button>
        </Link>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={`text-xs ${categoryColors[article.category] ?? ""}`}>
              {t(`news.${article.category}`)}
            </Badge>
            {article.pinned && (
              <Badge variant="secondary" className="gap-1 text-xs">
                <Pin className="h-3 w-3" /> {t("news.pinned")}
              </Badge>
            )}
            {article.isFeatured && (
              <Badge variant="secondary" className="gap-1 text-xs">
                <Star className="h-3 w-3" /> {t("news.featured")}
              </Badge>
            )}
          </div>

          <h1 className="text-2xl font-bold leading-tight text-foreground md:text-3xl">
            {article.title}
          </h1>

          <p className="text-base leading-relaxed text-muted-foreground">
            {article.excerpt}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <User className="h-4 w-4" />
              {article.author}
            </div>
            {article.publishedAt && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {new Date(article.publishedAt).toLocaleDateString("pt-BR", {
                  day: "numeric", month: "long", year: "numeric",
                })}
              </div>
            )}
            {article.expiresAt && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {t("news.expiresAt")}: {new Date(article.expiresAt).toLocaleDateString("pt-BR")}
              </div>
            )}
          </div>

          {article.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <Tag className="h-3.5 w-3.5 text-muted-foreground" />
              {article.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-[10px]">{tag}</Badge>
              ))}
            </div>
          )}
        </div>

        <Separator />

        <Card>
          <CardContent className="prose prose-sm max-w-none p-6 text-foreground dark:prose-invert">
            <div dangerouslySetInnerHTML={{ __html: article.content }} />
          </CardContent>
        </Card>

        {article.attachments.length > 0 && (
          <Card>
            <CardContent className="p-5">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                <Paperclip className="h-4 w-4" /> Anexos
              </h3>
              <div className="space-y-2">
                {article.attachments.map((att) => (
                  <a
                    key={att.id}
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-lg border border-border p-3 text-sm transition-colors hover:bg-accent"
                  >
                    <span className="font-medium text-foreground">{att.name}</span>
                    <span className="text-xs text-muted-foreground">{att.sizeFormatted}</span>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </AppLayout>
  );
}
