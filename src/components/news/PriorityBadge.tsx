import type { NewsPriority } from "@/types/domain";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const config: Record<NewsPriority, { label: string; icon: typeof Info; className: string }> = {
  normal: { label: "Normal", icon: Info, className: "bg-muted text-muted-foreground" },
  important: { label: "Importante", icon: AlertCircle, className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  urgent: { label: "Urgente", icon: AlertTriangle, className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
};

interface Props {
  priority: NewsPriority;
  showNormal?: boolean;
}

export function PriorityBadge({ priority, showNormal = false }: Props) {
  if (priority === "normal" && !showNormal) return null;
  const { label, icon: Icon, className } = config[priority];
  return (
    <Badge variant="outline" className={`gap-1 text-[10px] font-semibold ${className}`}>
      <Icon className="h-3 w-3" /> {label}
    </Badge>
  );
}
