// ─── Status Badge ────────────────────────────────────────────────────────────
// Reusable badge for content status, procedure status, and user status.

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusType = "draft" | "review" | "published" | "archived" | "vigente" | "em_revisao" | "obsoleto" | "active" | "inactive" | "suspended";

const statusConfig: Record<StatusType, { label: string; labelEn: string; className: string }> = {
  draft: { label: "Rascunho", labelEn: "Draft", className: "bg-muted text-muted-foreground border-border" },
  review: { label: "Em Revisão", labelEn: "In Review", className: "bg-chart-4/15 text-chart-4 border-chart-4/30" },
  published: { label: "Publicado", labelEn: "Published", className: "bg-chart-2/15 text-chart-2 border-chart-2/30" },
  archived: { label: "Arquivado", labelEn: "Archived", className: "bg-muted text-muted-foreground border-border" },
  vigente: { label: "Vigente", labelEn: "Active", className: "bg-chart-2/15 text-chart-2 border-chart-2/30" },
  em_revisao: { label: "Em Revisão", labelEn: "Under Review", className: "bg-chart-1/15 text-chart-1 border-chart-1/30" },
  obsoleto: { label: "Obsoleto", labelEn: "Obsolete", className: "bg-destructive/15 text-destructive border-destructive/30" },
  active: { label: "Ativo", labelEn: "Active", className: "bg-chart-2/15 text-chart-2 border-chart-2/30" },
  inactive: { label: "Inativo", labelEn: "Inactive", className: "bg-muted text-muted-foreground border-border" },
  suspended: { label: "Suspenso", labelEn: "Suspended", className: "bg-destructive/15 text-destructive border-destructive/30" },
};

interface StatusBadgeProps {
  status: StatusType;
  lang?: "pt" | "en";
  className?: string;
}

export function StatusBadge({ status, lang = "pt", className }: StatusBadgeProps) {
  const config = statusConfig[status];
  if (!config) return null;

  return (
    <Badge
      variant="outline"
      className={cn("text-[10px] font-semibold", config.className, className)}
    >
      {lang === "pt" ? config.label : config.labelEn}
    </Badge>
  );
}
