import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  FileText, Download, ArrowLeft, Calendar, Tag, User,
  Building2, Globe, Clock, Star, FileSpreadsheet, FileIcon, Presentation,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useI18n } from "@/hooks/use-i18n";
import { documentsService } from "@/services/data.service";
import type { IntranetDocument } from "@/types/domain";

export const Route = createFileRoute("/_authenticated/documentos/$slug")({
  component: DocumentDetailPage,
  head: () => ({
    meta: [
      { title: "Documento — Intranet 2.0" },
      { name: "description", content: "Detalhes do documento." },
    ],
  }),
});

const fileIcons: Record<string, any> = {
  pdf: FileText,
  docx: FileIcon,
  xlsx: FileSpreadsheet,
  pptx: Presentation,
};

function DocumentDetailPage() {
  const { slug } = Route.useParams();
  const { t, lang } = useI18n();
  const [doc, setDoc] = useState<IntranetDocument | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    documentsService.getBySlug(slug)
      .then(setDoc)
      .catch(() => setDoc(null))
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

  if (!doc) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <FileText className="h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-lg font-bold text-foreground">
            {lang === "pt" ? "Documento não encontrado" : "Document not found"}
          </h2>
          <Link to="/documentos" className="mt-4">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" /> {lang === "pt" ? "Voltar à biblioteca" : "Back to library"}
            </Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  const IconComp = fileIcons[doc.file?.type ?? ""] || FileText;

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        {/* Back */}
        <Link to="/documentos">
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> {lang === "pt" ? "Voltar à biblioteca" : "Back to library"}
          </Button>
        </Link>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main content */}
          <div className="space-y-6 lg:col-span-2">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <StatusBadge status={doc.status} lang={lang as "pt" | "en"} />
                <Badge variant="outline" className="text-xs">{t(`docs.${doc.category}`)}</Badge>
                {doc.isFeatured && <Badge variant="secondary" className="gap-1 text-xs"><Star className="h-3 w-3" /> {lang === "pt" ? "Destaque" : "Featured"}</Badge>}
                <Badge variant="outline" className="text-xs">{doc.language === "pt" ? "🇧🇷 Português" : "🇬🇧 English"}</Badge>
              </div>
              <h1 className="text-2xl font-bold text-foreground">{doc.title}</h1>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{doc.description}</p>
            </div>

            {/* File card */}
            {doc.file && (
              <Card>
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <IconComp className="h-7 w-7 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">{doc.file.name}</p>
                    <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="uppercase font-medium">{doc.file.type}</span>
                      <span>·</span>
                      <span>{doc.file.sizeFormatted}</span>
                      <span>·</span>
                      <span>{t("docs.version")} {doc.version}</span>
                    </div>
                  </div>
                  <a href={doc.file.url} target="_blank" rel="noopener noreferrer" download>
                    <Button className="gap-2 shrink-0">
                      <Download className="h-4 w-4" /> {t("docs.download")}
                    </Button>
                  </a>
                </CardContent>
              </Card>
            )}

            {/* Tags */}
            {doc.tags.length > 0 && (
              <div className="space-y-2">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Tag className="h-4 w-4" /> Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {doc.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">#{tag}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Version History */}
            {doc.history.length > 0 && (
              <div className="space-y-3">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Clock className="h-4 w-4" /> {lang === "pt" ? "Histórico de Versões" : "Version History"}
                </h3>
                <div className="space-y-2">
                  {doc.history.slice().reverse().map((entry, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-lg border border-border p-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-foreground">
                        v{entry.version}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-foreground">{entry.changes}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {entry.author} · {new Date(entry.date).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar metadata */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-5 space-y-4">
                <h3 className="text-sm font-semibold text-foreground">
                  {lang === "pt" ? "Informações" : "Information"}
                </h3>
                <Separator />
                <div className="space-y-3 text-sm">
                  {doc.author && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{lang === "pt" ? "Autor" : "Author"}</p>
                        <p className="text-foreground">{doc.author}</p>
                      </div>
                    </div>
                  )}
                  {doc.responsibleUser && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{lang === "pt" ? "Responsável" : "Responsible"}</p>
                        <p className="text-foreground">{doc.responsibleUser}</p>
                      </div>
                    </div>
                  )}
                  {doc.departmentSlug && (
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{lang === "pt" ? "Departamento" : "Department"}</p>
                        <p className="text-foreground capitalize">{doc.departmentSlug}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{lang === "pt" ? "Visibilidade" : "Visibility"}</p>
                      <p className="text-foreground capitalize">{doc.visibility}</p>
                    </div>
                  </div>
                  {doc.effectiveDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{lang === "pt" ? "Data de Vigência" : "Effective Date"}</p>
                        <p className="text-foreground">{new Date(doc.effectiveDate).toLocaleDateString("pt-BR")}</p>
                      </div>
                    </div>
                  )}
                  {doc.expiryDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{lang === "pt" ? "Data de Expiração" : "Expiry Date"}</p>
                        <p className="text-foreground">{new Date(doc.expiryDate).toLocaleDateString("pt-BR")}</p>
                      </div>
                    </div>
                  )}
                  <Separator />
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{lang === "pt" ? "Atualizado em" : "Updated on"}</p>
                      <p className="text-foreground">{new Date(doc.updatedAt).toLocaleDateString("pt-BR")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{lang === "pt" ? "Criado em" : "Created on"}</p>
                      <p className="text-foreground">{new Date(doc.createdAt).toLocaleDateString("pt-BR")}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </AppLayout>
  );
}
