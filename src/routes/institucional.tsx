import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  UserPlus, Shield, MessageSquareWarning, HardHat, Lock, Award,
  Building2, FileText, ArrowRight, Search, Star,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AppLayout } from "@/components/layout/AppLayout";
import { useI18n } from "@/hooks/use-i18n";
import { institutionalPagesService } from "@/services/data.service";
import type { InstitutionalPage, InstitutionalCategory } from "@/types/domain";

export const Route = createFileRoute("/institucional")({
  component: InstitutionalListPage,
  head: () => ({
    meta: [
      { title: "Institucional — Intranet" },
      { name: "description", content: "Páginas institucionais: onboarding, compliance, ética e mais." },
    ],
  }),
});

const categoryIcons: Record<string, typeof Shield> = {
  onboarding: UserPlus,
  compliance: Shield,
  ethics: MessageSquareWarning,
  cipa: HardHat,
  lgpd: Lock,
  quality: Award,
  departmental: Building2,
  general: FileText,
};

const categoryColors: Record<string, string> = {
  onboarding: "bg-blue-500",
  compliance: "bg-emerald-500",
  ethics: "bg-amber-500",
  cipa: "bg-orange-500",
  lgpd: "bg-violet-500",
  quality: "bg-teal-500",
  departmental: "bg-indigo-500",
  general: "bg-slate-500",
};

const categories: InstitutionalCategory[] = [
  "onboarding", "compliance", "ethics", "cipa", "lgpd", "quality", "departmental", "general",
];

function InstitutionalListPage() {
  const { t, lang } = useI18n();
  const [pages, setPages] = useState<InstitutionalPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    setLoading(true);
    institutionalPagesService
      .list({
        status: "published",
        search: search || undefined,
        category: categoryFilter === "all" ? undefined : categoryFilter,
        pageSize: 50,
        sortBy: "title",
        sortOrder: "asc",
      })
      .then((res) => setPages(res.data))
      .catch(() => setPages([]))
      .finally(() => setLoading(false));
  }, [search, categoryFilter]);

  const featured = pages.filter((p) => p.isFeatured);
  const regular = pages.filter((p) => !p.isFeatured);

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("inst.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("inst.subtitle")}</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={lang === "pt" ? "Buscar páginas..." : "Search pages..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-secondary border-0"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px] bg-secondary border-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{lang === "pt" ? "Todas as categorias" : "All categories"}</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>{t(`inst.cat.${cat}`)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : pages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="h-12 w-12 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">{t("crud.noResults")}</p>
          </div>
        ) : (
          <>
            {/* Featured */}
            {featured.length > 0 && (
              <section className="space-y-3">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Star className="h-4 w-4 text-amber-500" /> {t("inst.featured")}
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {featured.map((page) => (
                    <PageCard key={page.id} page={page} lang={lang} t={t} />
                  ))}
                </div>
              </section>
            )}

            {/* Regular */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {regular.map((page, i) => (
                <motion.div
                  key={page.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <PageCard page={page} lang={lang} t={t} />
                </motion.div>
              ))}
            </div>
          </>
        )}
      </motion.div>
    </AppLayout>
  );
}

function PageCard({ page, lang, t }: { page: InstitutionalPage; lang: "pt" | "en"; t: (k: string) => string }) {
  const Icon = categoryIcons[page.category] ?? FileText;
  const color = categoryColors[page.category] ?? "bg-slate-500";

  return (
    <Link to="/institucional/$slug" params={{ slug: page.slug }}>
      <Card className="group h-full cursor-pointer transition-all hover:shadow-lg">
        <CardContent className="flex flex-col items-center p-6 text-center">
          <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${color}`}>
            <Icon className="h-7 w-7 text-white" />
          </div>
          <h3 className="mt-4 text-sm font-semibold text-foreground">{page.title}</h3>
          <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">{page.summary}</p>
          <Badge variant="outline" className="mt-3 text-[10px]">
            {t(`inst.cat.${page.category}`)}
          </Badge>
          <div className="mt-3 flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
            {lang === "pt" ? "Acessar" : "View"} <ArrowRight className="h-3 w-3" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
