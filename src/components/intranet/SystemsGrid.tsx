import { Monitor, FileSpreadsheet, Database, ShoppingCart, Wrench, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/hooks/use-i18n";

const systems = [
  { icon: Monitor, label: "Smart System" },
  { icon: FileSpreadsheet, label: "Espaço Digital" },
  { icon: Database, label: "GCDACA" },
  { icon: ShoppingCart, label: "Compras" },
  { icon: Wrench, label: "Manutenção" },
];

export function SystemsGrid() {
  const { t } = useI18n();

  return (
    <div>
      <h3 className="mb-1 text-sm font-bold text-white">{t("systems.title")}</h3>
      <p className="mb-4 text-[10px] text-white/45">Acesse os sistemas corporativos</p>

      <div className="grid grid-cols-5 gap-2.5">
        {systems.map(({ icon: Icon, label }) => (
          <button
            key={label}
            className="group flex flex-col items-center gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.06] p-4 transition-all hover:bg-white/[0.14] hover:border-white/20"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 transition-colors group-hover:bg-white/20">
              <Icon className="h-5 w-5 text-white/85 group-hover:text-white" />
            </div>
            <span className="text-center text-[10px] font-semibold text-white/75 group-hover:text-white/95">{label}</span>
          </button>
        ))}
      </div>

      <Button
        variant="outline"
        size="sm"
        className="mt-4 w-full border-white/15 text-[11px] text-white/60 hover:bg-white/10 hover:text-white h-8 rounded-lg"
      >
        {t("systems.viewAll")} <ArrowRight className="ml-1 h-3 w-3" />
      </Button>
    </div>
  );
}
