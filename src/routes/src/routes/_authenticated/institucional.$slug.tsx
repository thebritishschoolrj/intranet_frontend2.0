import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, User, Tag, Clock, Paperclip, Building2, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AppLayout } from "@/components/layout/AppLayout";
import { useI18n } from "@/hooks/use-i18n";
import { institutionalPagesService, storageService } from "@/services/data.service";
import type { InstitutionalPage } from "@/types/domain";

export const Route = createFileRoute("/src/routes/_authenticated/institucional/$slug")({
  component: InstitutionalDetailPage,
  head: () => ({
    meta: [
      { title: "Institucional — Intranet" },
      { name: "description", content: "Página institucional" },
    ],
  }),
});

function InstitutionalDetailPage() {
  const { t, lang } = useI18n();
  const { slug } = Route.useParams();
  const [page, setPage] = useState<InstitutionalPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [attachments, setAttachments] = useState<any[]>([]);

  useEffect(() => {
    setLoading(true);
    institutionalPagesService
      .getBySlug(slug)
      .then((p) => {
        setPage(p);
        if (p) {
          storageService.getAttachments("institutional_page", p.id).then(setAttachments).catch(() => setAttachments([]));
        }
      })
      .catch(() => setPage(null))
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

  if (!page) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <h2 className="text-lg font-bold text-foreground">
            {lang === "pt" ? "Página não encontrada" : "Page not found"}
          </h2>
          <Link to="/institucional">
            <Button variant="outline" className="mt-4 gap-2">
              <ArrowLeft className="h-4 w-4" /> {t("inst.backToList")}
            </Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-3xl space-y-6">
        <Link to="/institucional">
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
            <ArrowLeft className="h-4 w-4" /> {t("inst.backToList")}
          </Button>
        </Link>

        {/* Header */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-xs">{t(`inst.cat.${page.category}`)}</Badge>
            {page.isFeatured && (
              <Badge variant="secondary" className="gap-1 text-xs">
                <Star className="h-3 w-3" /> {lang === "pt" ? "Destaque" : "Featured"}
              </Badge>
            )}
          </div>

          {page.featuredImage && (
            <img
              src={page.featuredImage}
              alt={page.title}
              className="w-full rounded-xl object-cover max-h-64"
            />
          )}

          <h1 className="text-2xl font-bold leading-tight text-foreground md:text-3xl">
            {page.title}
          </h1>

          {page.summary && (
            <p className="text-base leading-relaxed text-muted-foreground">{page.summary}</p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {page.author && (
              <div className="flex items-center gap-1.5">
                <User className="h-4 w-4" /> {page.author}
              </div>
            )}
            {page.publishedAt && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {new Date(page.publishedAt).toLocaleDateString(lang === "pt" ? "pt-BR" : "en-US", {
                  day: "numeric", month: "long", year: "numeric",
                })}
              </div>
            )}
            {page.ownerDepartment && (
              <div className="flex items-center gap-1.5">
                <Building2 className="h-4 w-4" /> {page.ownerDepartment}
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {lang === "pt" ? "Atualizado em" : "Updated on"}{" "}
              {new Date(page.updatedAt).toLocaleDateString(lang === "pt" ? "pt-BR" : "en-US")}
            </div>
          </div>

          {page.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <Tag className="h-3.5 w-3.5 text-muted-foreground" />
              {page.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-[10px]">{tag}</Badge>
              ))}
            </div>
          )}
        </div>

        <Separator />

        {/* Content */}
        <Card>
          <CardContent className="prose prose-sm max-w-none p-6 text-foreground dark:prose-invert">
            <div dangerouslySetInnerHTML={{ __html: page.contentHtml }} />
          </CardContent>
        </Card>

        {/* Attachments */}
        {attachments.length > 0 && (
          <Card>
            <CardContent className="p-5">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                <Paperclip className="h-4 w-4" /> {lang === "pt" ? "Anexos" : "Attachments"}
              </h3>
              <div className="space-y-2">
                {attachments.map((att: any) => (
                  <a
                    key={att.id}
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-lg border border-border p-3 text-sm transition-colors hover:bg-accent"
                  >
                    <span className="font-medium text-foreground">{att.name}</span>
                    <span className="text-xs text-muted-foreground">{att.size_formatted}</span>
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
