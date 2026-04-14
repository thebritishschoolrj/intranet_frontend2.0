import { ChevronRight, Star } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";

const highlightKeys = [
  "highlights.campanha",
  "highlights.cultura",
  "highlights.atendimento",
  "highlights.dpo",
  "highlights.crea",
  "highlights.networking",
  "highlights.flyclass",
  "highlights.mainboard",
  "highlights.prevencao",
];

export function HighlightsSidebar() {
  const { t } = useI18n();

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center gap-1.5 rounded bg-navy px-2.5 py-1.5">
        <Star className="h-3.5 w-3.5 text-navy-foreground" />
        <span className="text-xs font-bold text-navy-foreground">{t("highlights.title")}</span>
      </div>
      <nav className="flex flex-col">
        {highlightKeys.map((key) => (
          <button
            key={key}
            className="flex items-center justify-between border-b border-border/50 px-2 py-1.5 text-left text-[11px] text-foreground transition-colors hover:bg-accent last:border-0"
          >
            <span className="text-corporate-red font-medium">{t(key)}</span>
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
          </button>
        ))}
      </nav>
    </div>
  );
}
