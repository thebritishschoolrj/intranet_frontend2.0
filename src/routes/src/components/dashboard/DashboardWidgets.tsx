import { Link } from "@tanstack/react-router";
import {
  Users, Building2, Newspaper, FileText, ClipboardList, BookOpen,
  TrendingUp, AlertCircle, Clock, Eye, ArrowRight, Cake, Star,
  FileWarning, FilePen, Archive, FileX,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/hooks/use-i18n";
import { useAuth } from "@/contexts/auth-context";
import type {
  DashboardMetrics, PendingWorkflows, DashboardNewsItem,
  DashboardProcedureItem, DashboardDocItem, DashboardPageItem,
  BirthdayItem,
} from "@/services/dashboard.service";

// ─── Metric Cards ────────────────────────────────────────────────────────────

const metricConfig = [
  { key: "totalEmployees" as const, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10", labelKey: "dash.totalEmployees" },
  { key: "departmentsCount" as const, icon: Building2, color: "text-emerald-500", bg: "bg-emerald-500/10", labelKey: "dash.departments" },
  { key: "publishedNews" as const, icon: Newspaper, color: "text-amber-500", bg: "bg-amber-500/10", labelKey: "dash.publishedNews" },
  { key: "publishedDocs" as const, icon: FileText, color: "text-violet-500", bg: "bg-violet-500/10", labelKey: "dash.publishedDocs" },
  { key: "activeProcedures" as const, icon: ClipboardList, color: "text-cyan-500", bg: "bg-cyan-500/10", labelKey: "dash.activeProcedures" },
  { key: "publishedPages" as const, icon: BookOpen, color: "text-rose-500", bg: "bg-rose-500/10", labelKey: "dash.publishedPages" },
] as const;

export function MetricCards({ metrics, isLoading }: { metrics: DashboardMetrics | null; isLoading: boolean }) {
  const { t } = useI18n();

  if (isLoading || !metrics) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}><CardContent className="p-4"><Skeleton className="h-16 w-full" /></CardContent></Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {metricConfig.map(({ key, icon: Icon, color, bg, labelKey }) => (
        <Card key={key} className="transition-shadow hover:shadow-md">
          <CardContent className="flex items-center gap-3 p-4">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${bg}`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold text-foreground">{metrics[key]}</p>
              <p className="truncate text-xs text-muted-foreground">{t(labelKey)}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Pending Workflows (admin/editor/manager) ───────────────────────────────

export function PendingWorkflowsCard({ pending, isLoading }: { pending: PendingWorkflows | null; isLoading: boolean }) {
  const { t } = useI18n();

  if (isLoading || !pending) {
    return <Card><CardContent className="p-4"><Skeleton className="h-24 w-full" /></CardContent></Card>;
  }

  const total = pending.newsInReview + pending.draftProcedures + pending.archivedContent + pending.unpublishedPages;

  const items = [
    { label: t("dash.pendingNewsReview"), count: pending.newsInReview, icon: FilePen, href: "/noticias" },
    { label: t("dash.pendingDraftProcs"), count: pending.draftProcedures, icon: FileWarning, href: "/procedimentos" },
    { label: t("dash.pendingArchived"), count: pending.archivedContent, icon: Archive, href: "/documentos" },
    { label: t("dash.pendingUnpubPages"), count: pending.unpublishedPages, icon: FileX, href: "/institucional" },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          {t("dash.pendingWorkflows")}
          {total > 0 && (
            <Badge variant="destructive" className="ml-auto text-[10px]">{total}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        {items.map((item) => (
          <Link key={item.href} to={item.href} className="flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent">
            <span className="flex items-center gap-2 text-muted-foreground">
              <item.icon className="h-4 w-4" />
              {item.label}
            </span>
            <Badge variant={item.count > 0 ? "secondary" : "outline"} className="text-xs">
              {item.count}
            </Badge>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}

// ─── Latest News ─────────────────────────────────────────────────────────────

const categoryColors: Record<string, string> = {
  aviso: "bg-amber-500/10 text-amber-700",
  evento: "bg-blue-500/10 text-blue-700",
  comunicado: "bg-emerald-500/10 text-emerald-700",
  campanha: "bg-rose-500/10 text-rose-700",
};

export function LatestNewsCard({ news, isLoading }: { news: DashboardNewsItem[]; isLoading: boolean }) {
  const { t } = useI18n();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2">
            <Newspaper className="h-4 w-4 text-primary" />
            {t("dash.latestNews")}
          </span>
          <Link to="/noticias">
            <Button variant="ghost" size="sm" className="h-7 text-xs">
              {t("dash.viewAll")} <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 pt-0">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
        ) : news.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">{t("crud.noResults")}</p>
        ) : (
          news.map((item) => (
            <Link
              key={item.id}
              to="/noticias/$slug"
              params={{ slug: item.slug }}
              className="flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-accent"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground line-clamp-1">{item.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-1">{item.excerpt}</p>
              </div>
              <Badge className={`shrink-0 text-[10px] ${categoryColors[item.category] ?? ""}`}>
                {t(`news.${item.category}`)}
              </Badge>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}

// ─── Featured News ───────────────────────────────────────────────────────────

export function FeaturedNewsCard({ news, isLoading }: { news: DashboardNewsItem[]; isLoading: boolean }) {
  const { t } = useI18n();

  if (isLoading) return <Card><CardContent className="p-4"><Skeleton className="h-32 w-full" /></CardContent></Card>;
  if (news.length === 0) return null;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Star className="h-4 w-4 text-amber-500" />
          {t("dash.featuredNews")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {news.map((item) => (
          <Link
            key={item.id}
            to="/noticias/$slug"
            params={{ slug: item.slug }}
            className="group block rounded-lg border border-border p-3 transition-all hover:border-primary/30 hover:shadow-sm"
          >
            <div className="flex items-start gap-3">
              {item.coverImage && (
                <img src={item.coverImage} alt="" className="h-14 w-20 shrink-0 rounded-md object-cover" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground group-hover:text-primary line-clamp-2">{item.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{item.author}</p>
              </div>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}

// ─── Recent Procedures ───────────────────────────────────────────────────────

const statusBadge: Record<string, string> = {
  vigente: "bg-emerald-500/10 text-emerald-700",
  em_revisao: "bg-amber-500/10 text-amber-700",
  obsoleto: "bg-muted text-muted-foreground",
};

export function RecentProceduresCard({ procedures, isLoading }: { procedures: DashboardProcedureItem[]; isLoading: boolean }) {
  const { t } = useI18n();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-primary" />
            {t("dash.recentProcedures")}
          </span>
          <Link to="/procedimentos">
            <Button variant="ghost" size="sm" className="h-7 text-xs">
              {t("dash.viewAll")} <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 pt-0">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)
        ) : procedures.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">{t("crud.noResults")}</p>
        ) : (
          procedures.map((item) => (
            <Link
              key={item.id}
              to="/procedimentos/$slug"
              params={{ slug: item.slug }}
              className="flex items-center justify-between rounded-lg px-3 py-2 transition-colors hover:bg-accent"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground line-clamp-1">{item.title}</p>
                <p className="text-[11px] text-muted-foreground">{item.code}</p>
              </div>
              <Badge className={`shrink-0 text-[10px] ${statusBadge[item.status] ?? ""}`}>
                {t(`proc.${item.status}`)}
              </Badge>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}

// ─── Recent Documents ────────────────────────────────────────────────────────

export function RecentDocumentsCard({ docs, isLoading }: { docs: DashboardDocItem[]; isLoading: boolean }) {
  const { t } = useI18n();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            {t("dash.recentDocuments")}
          </span>
          <Link to="/documentos">
            <Button variant="ghost" size="sm" className="h-7 text-xs">
              {t("dash.viewAll")} <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 pt-0">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)
        ) : docs.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">{t("crud.noResults")}</p>
        ) : (
          docs.map((item) => (
            <Link
              key={item.id}
              to="/documentos/$slug"
              params={{ slug: item.slug }}
              className="flex items-center justify-between rounded-lg px-3 py-2 transition-colors hover:bg-accent"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground line-clamp-1">{item.title}</p>
                <p className="text-[11px] text-muted-foreground">{t(`docs.${item.category}`)}</p>
              </div>
              {item.fileType && (
                <Badge variant="outline" className="shrink-0 text-[10px] uppercase">{item.fileType}</Badge>
              )}
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}

// ─── Institutional Highlights ────────────────────────────────────────────────

export function InstitutionalHighlightsCard({ pages, isLoading }: { pages: DashboardPageItem[]; isLoading: boolean }) {
  const { t } = useI18n();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            {t("dash.instHighlights")}
          </span>
          <Link to="/institucional">
            <Button variant="ghost" size="sm" className="h-7 text-xs">
              {t("dash.viewAll")} <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 pt-0">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)
        ) : pages.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">{t("crud.noResults")}</p>
        ) : (
          pages.map((item) => (
            <Link
              key={item.id}
              to="/institucional/$slug"
              params={{ slug: item.slug }}
              className="flex items-center justify-between rounded-lg px-3 py-2 transition-colors hover:bg-accent"
            >
              <p className="text-sm font-medium text-foreground line-clamp-1">{item.title}</p>
              <Badge variant="outline" className="shrink-0 text-[10px]">{t(`inst.cat.${item.category}`)}</Badge>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}

// ─── Birthdays ───────────────────────────────────────────────────────────────

export function BirthdaysCard({ birthdays, isLoading }: { birthdays: BirthdayItem[]; isLoading: boolean }) {
  const { t } = useI18n();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Cake className="h-4 w-4 text-pink-500" />
          {t("dash.upcomingBirthdays")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 pt-0">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)
        ) : birthdays.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">{t("dash.noBirthdays")}</p>
        ) : (
          birthdays.map((b, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg px-3 py-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-500/10">
                <Cake className="h-4 w-4 text-pink-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{b.name}</p>
                <p className="text-[11px] text-muted-foreground">{b.department}</p>
              </div>
              <span className="shrink-0 text-xs font-semibold text-primary">{b.birthday}</span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

// ─── Quick Access Links ──────────────────────────────────────────────────────

export function QuickAccessCard() {
  const { t } = useI18n();

  const links = [
    { label: t("nav.news"), icon: Newspaper, href: "/noticias" },
    { label: t("nav.documents"), icon: FileText, href: "/documentos" },
    { label: t("nav.procedures"), icon: ClipboardList, href: "/procedimentos" },
    { label: t("nav.employees"), icon: Users, href: "/colaboradores" },
    { label: t("nav.departments"), icon: Building2, href: "/departamentos" },
    { label: t("nav.institutional"), icon: BookOpen, href: "/institucional" },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <TrendingUp className="h-4 w-4 text-primary" />
          {t("dash.quickActions")}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2 pt-0 sm:grid-cols-3">
        {links.map((link) => (
          <Link
            key={link.href}
            to={link.href}
            className="flex flex-col items-center gap-2 rounded-lg border border-border p-3 transition-all hover:border-primary/30 hover:bg-accent hover:shadow-sm"
          >
            <link.icon className="h-5 w-5 text-primary" />
            <span className="text-center text-xs font-medium text-foreground">{link.label}</span>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
