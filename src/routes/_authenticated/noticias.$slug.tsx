import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, User, Tag, Clock, Pin, Star, Paperclip, FileText } from "lucide-react";
import { NewsReactions } from "@/components/news/NewsReactions";
import { NewsComments } from "@/components/news/NewsComments";
import { NewsAcknowledgment } from "@/components/news/NewsAcknowledgment";
import { NewsReadAnalytics } from "@/components/news/NewsReadAnalytics";
import { NewsGallery } from "@/components/news/NewsGallery";
import { PriorityBadge } from "@/components/news/PriorityBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/layout/AppLayout";
import { useI18n } from "@/hooks/use-i18n";
import { useAuth } from "@/contexts/auth-context";
import { newsService } from "@/services/data.service";
import { supabase } from "@/integrations/supabase/client";
import type { NewsArticle, FileAttachment } from "@/types/domain";

export const Route = createFileRoute("/_authenticated/noticias/$slug")({
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

const categoryDots: Record<string, string> = {
  aviso: "bg-amber-500",
  evento: "bg-blue-500",
  comunicado: "bg-emerald-500",
  campanha: "bg-violet-500",
};

function NewsDetailPage() {
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const { slug } = Route.useParams();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadArticle = async () => {
      setLoading(true);
      setError(null);

      try {
        const art = await newsService.getBySlug(slug);

        if (!art) {
          setArticle(null);
          return;
        }

        // Track view
        if (user) {
          supabase.from("news_views" as any).upsert(
            { news_id: art.id, user_id: user.id, viewed_at: new Date().toISOString() } as any,
            { onConflict: "news_id,user_id" }
          ).then(() => {});
        }

        const { data: attachments, error: attachmentsError } = await supabase
          .from("file_attachments")
          .select("*")
          .eq("entity_type", "news")
          .eq("entity_id", art.id);

        if (attachmentsError) {
          throw new Error(attachmentsError.message);
        }

        setArticle({
          ...art,
          attachments: (attachments ?? []).map((a) => ({
            id: a.id,
            name: a.name,
            type: a.file_type as FileAttachment["type"],
            size: a.size,
            sizeFormatted: a.size_formatted,
            url: a.url,
            language: a.language as "pt" | "en",
            uploadedAt: a.created_at,
            uploadedBy: a.uploaded_by ?? "unknown",
          })),
        });
      } catch (err) {
        console.error("Failed to load news detail", err);
        setArticle(null);
        setError(err instanceof Error ? err.message : "Falha ao carregar a notícia.");
      } finally {
        setLoading(false);
      }
    };

    void loadArticle();
  }, [slug, user]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
        </div>
      </AppLayout>
    );
  }

  if (!article) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <h2 className="text-lg font-bold text-foreground">
            {error ? "Falha ao carregar a notícia" : "Notícia não encontrada"}
          </h2>
          {error && import.meta.env.DEV && (
            <p className="mt-2 max-w-xl text-center text-sm text-muted-foreground">{error}</p>
          )}
          <Link to="/noticias">
            <Button variant="ghost" size="sm" className="mt-4 gap-2 text-muted-foreground">
              <ArrowLeft className="h-4 w-4" /> {t("news.backToList")}
            </Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  const dotColor = categoryDots[article.category] ?? "bg-muted-foreground";

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mx-auto max-w-3xl space-y-6"
      >
        {/* Back navigation */}
        <Link to="/noticias">
          <button className="mb-8 flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" />
            {t("news.backToList")}
          </button>
        </Link>

        {/* Mandatory read banner */}
        <NewsAcknowledgment newsId={article.id} isMandatory={article.isMandatory} />
        {article.isMandatory && <div className="h-6" />}

        {/* ─── Header ─────────────────────────────────────────── */}
        <header className="mb-8">
          {/* Status indicators */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className={`inline-block h-1.5 w-1.5 rounded-full ${dotColor}`} />
            <span className="text-[11px] font-medium text-muted-foreground">
              {t(`news.${article.category}`)}
            </span>
            <PriorityBadge priority={article.priority} />
            {article.pinned && (
              <span className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
                <Pin className="h-3 w-3" /> {t("news.pinned")}
              </span>
            )}
            {article.isFeatured && (
              <span className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
                <Star className="h-3 w-3" /> {t("news.featured")}
              </span>
            )}
            {article.isMandatory && (
              <Badge variant="outline" className="h-4 px-1.5 text-[9px] font-semibold border-primary/30 text-primary">
                {lang === "pt" ? "Obrigatório" : "Mandatory"}
              </Badge>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold leading-tight tracking-tight text-foreground md:text-[28px]">
            {article.title}
          </h1>

          {/* Excerpt / lead */}
          {article.excerpt && (
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              {article.excerpt}
            </p>
          )}

          {/* Meta line */}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground/80">
            <span>{article.author}</span>
            {article.publishedAt && (
              <>
                <span className="text-border">·</span>
                <span>
                  {new Date(article.publishedAt).toLocaleDateString(
                    lang === "pt" ? "pt-BR" : "en-US",
                    { day: "numeric", month: "long", year: "numeric" }
                  )}
                </span>
              </>
            )}
            {article.expiresAt && (
              <>
                <span className="text-border">·</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {t("news.expiresAt")}: {new Date(article.expiresAt).toLocaleDateString(lang === "pt" ? "pt-BR" : "en-US")}
                </span>
              </>
            )}
          </div>

          {/* Tags */}
          {article.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              {article.tags.map((tag) => (
                <span key={tag} className="text-[11px] text-muted-foreground">#{tag}</span>
              ))}
            </div>
          )}

          {/* Reactions — inline with header */}
          <div className="mt-5">
            <NewsReactions newsId={article.id} />
          </div>
        </header>

        {/* ─── Cover Image ─────────────────────────────────────── */}
        {article.coverImage && (
          <div className="overflow-hidden rounded-lg">
            <img
              src={article.coverImage}
              alt={article.title}
              className="w-full object-cover"
              style={{ maxHeight: 400 }}
            />
          </div>
        )}

        {/* ─── Content ────────────────────────────────────────── */}
        <article className="prose prose-sm max-w-none text-foreground dark:prose-invert prose-headings:font-semibold prose-headings:tracking-tight prose-p:leading-relaxed prose-p:text-[15px] prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-lg">
          <div dangerouslySetInnerHTML={{ __html: article.content }} />
        </article>

        {/* ─── Gallery ─────────────────────────────────────── */}
        <NewsGallery newsId={article.id} />

        {/* ─── Attachments ────────────────────────────────────── */}
        {article.attachments.length > 0 && (
          <section className="mt-10">
            <h3 className="mb-3 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              <Paperclip className="h-3.5 w-3.5" />
              {lang === "pt" ? "Anexos" : "Attachments"}
            </h3>
            <div className="space-y-1.5">
              {article.attachments.map((att) => (
                <a
                  key={att.id}
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 rounded-lg border border-border px-4 py-3 transition-colors hover:bg-accent/40"
                >
                  <FileText className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
                  <div className="min-w-0 flex-1">
                    <span className="text-[13px] font-medium text-foreground group-hover:text-primary transition-colors truncate block">
                      {att.name}
                    </span>
                  </div>
                  <span className="shrink-0 text-[11px] text-muted-foreground">{att.sizeFormatted}</span>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* ─── Read Analytics (admin/manager) ─────────────────── */}
        <div className="mt-10">
          <NewsReadAnalytics newsId={article.id} isMandatory={article.isMandatory} />
        </div>

        {/* ─── Comments ───────────────────────────────────────── */}
        <div className="mt-10">
          <NewsComments newsId={article.id} />
        </div>
      </motion.div>
    </AppLayout>
  );
}
