import { Target, FileText, BookOpen, Calendar } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";

export function StrategicDirection() {
  const { t } = useI18n();

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-lg bg-navy p-3">
        <div className="mb-2 flex items-center gap-1.5">
          <Target className="h-4 w-4 text-navy-foreground" />
          <h3 className="text-xs font-bold text-navy-foreground">{t("strategic.title")}</h3>
        </div>
        <nav className="flex flex-col gap-1">
          {[
            { icon: FileText, key: "strategic.policies" },
            { icon: BookOpen, key: "strategic.sustainability" },
            { icon: FileText, key: "strategic.metrics" },
          ].map(({ icon: Icon, key }) => (
            <button key={key} className="flex items-center gap-1.5 rounded px-1.5 py-1 text-left text-[10px] text-navy-foreground/80 transition-colors hover:bg-navy-foreground/10 hover:text-navy-foreground">
              <Icon className="h-3 w-3 shrink-0" />
              <span>{t(key)}</span>
            </button>
          ))}
        </nav>
      </div>
      <div className="rounded-lg bg-navy p-3">
        <div className="mb-1.5 flex items-center gap-1.5">
          <Calendar className="h-4 w-4 text-navy-foreground" />
          <h3 className="text-xs font-bold text-navy-foreground">{t("strategic.calendar")}</h3>
        </div>
        <div className="flex items-center justify-center rounded bg-navy-foreground/10 p-2">
          <div className="text-center">
            <div className="text-xl font-bold text-navy-foreground">ABR</div>
            <div className="text-[10px] text-navy-foreground/60">2026</div>
          </div>
        </div>
      </div>
    </div>
  );
}
