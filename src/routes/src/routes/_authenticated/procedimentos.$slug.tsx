import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, User, Tag, Paperclip, History, Shield, Clock, Building2, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AppLayout } from "@/components/layout/AppLayout";
import { useI18n } from "@/hooks/use-i18n";
import { proceduresService } from "@/services/data.service";
import type { Procedure } from "@/types/domain";

export const Route = createFileRoute("/src/routes/_authenticated/procedimentos/$slug")({
  component: ProcedureDetailPage,
  head: () => ({
    meta: [
      { title: "Procedimento — Intranet" },
      { name: "description", content: "Detalhes do procedimento operacional" },
    ],
  }),
});

const statusColors: Record<string, string> = {
  vigente: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  em_revisao: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  obsoleto: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

function ProcedureDetailPage() {
  const { t } = useI18n();
  const { slug } = Route.useParams();
  const [proc, setProc] = useState<Procedure | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    proceduresService.getBySlug(slug)
      .then(setProc)
      .catch(() => setProc(null))
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

  if (!proc) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <h2 className="text-lg font-bold text-foreground">Procedimento não encontrado</h2>
          <Link to="/procedimentos">
            <Button variant="outline" className="mt-4 gap-2">
              <ArrowLeft className="h-4 w-4" /> {t("proc.backToList")}
            </Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-3xl space-y-6">
        <Link to="/procedimentos">
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
            <ArrowLeft className="h-4 w-4" /> {t("proc.backToList")}
          </Button>
        </Link>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="font-mono text-xs">{proc.code}</Badge>
            <Badge variant="outline" className={`text-xs ${statusColors[proc.status] ?? ""}`}>
              {t(`proc.${proc.status}`)}
            </Badge>
            <Badge variant="outline" className="text-xs">{t(`proc.${proc.category}`)}</Badge>
            {!proc.isActive && (
              <Badge variant="destructive" className="text-xs">{t("proc.inactive")}</Badge>
            )}
          </div>

          <h1 className="text-2xl font-bold leading-tight text-foreground md:text-3xl">
            {proc.title}
          </h1>

          <p className="text-base leading-relaxed text-muted-foreground">
            {proc.description}
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span className="font-medium">{t("proc.responsible")}:</span> {proc.responsibleUser || proc.author}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 className="h-4 w-4" />
              <span className="font-medium">{t("proc.department")}:</span> {proc.departmentSlug}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4" />
              <span className="font-medium">{t("proc.version")}:</span> v{proc.version}
            </div>
            {proc.effectiveDate && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">{t("proc.effective")}:</span> {new Date(proc.effectiveDate).toLocaleDateString("pt-BR")}
              </div>
            )}
          </div>

          {proc.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <Tag className="h-3.5 w-3.5 text-muted-foreground" />
              {proc.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-[10px]">{tag}</Badge>
              ))}
            </div>
          )}
        </div>

        <Separator />

        {/* Attachments */}
        {proc.attachments.length > 0 && (
          <Card>
            <CardContent className="p-5">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                <Paperclip className="h-4 w-4" /> {t("proc.attachments")}
              </h3>
              <div className="space-y-2">
                {proc.attachments.map((att) => (
                  <a
                    key={att.id}
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-lg border border-border p-3 text-sm transition-colors hover:bg-accent"
                  >
                    <Paperclip className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-foreground">{att.name}</span>
                    <Badge variant="outline" className="ml-auto text-[10px]">{att.type.toUpperCase()}</Badge>
                    <span className="text-xs text-muted-foreground">{att.sizeFormatted}</span>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Version History */}
        {proc.history.length > 0 && (
          <Card>
            <CardContent className="p-5">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
                <History className="h-4 w-4" /> {t("proc.history")}
              </h3>
              <div className="space-y-4">
                {proc.history.map((h, j) => (
                  <div key={j} className="flex items-start gap-3">
                    <div className="mt-1.5 flex flex-col items-center">
                      <div className={`h-3 w-3 rounded-full ${j === 0 ? "bg-primary" : "bg-muted-foreground/30"}`} />
                      {j < proc.history.length - 1 && <div className="h-full w-px bg-border" />}
                    </div>
                    <div className="pb-4">
                      <p className="text-sm font-medium text-foreground">v{h.version}</p>
                      <p className="text-xs text-muted-foreground">{h.changes}</p>
                      <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span>{h.author}</span>
                        <span>·</span>
                        <span>{h.date}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </AppLayout>
  );
}
