import { Users, Network, Building2 } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";

export function Organogram() {
  const { t } = useI18n();

  const items = [
    { icon: Users, key: "organogram.leaders", desc: "Conheça os líderes" },
    { icon: Network, key: "organogram.chart", desc: "Estrutura organizacional" },
    { icon: Building2, key: "organogram.sites", desc: "Nossas unidades" },
  ];

  return (
    <div>
      <h3 className="mb-1 text-sm font-bold text-white">{t("organogram.title")}</h3>
      <p className="mb-4 text-[10px] text-white/45">Estrutura e liderança da organização</p>

      <div className="grid grid-cols-3 gap-2.5">
        {items.map(({ icon: Icon, key, desc }) => (
          <button
            key={key}
            className="group flex flex-col items-center gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.06] p-4 transition-all hover:bg-white/[0.14] hover:border-white/20"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 transition-colors group-hover:bg-white/20">
              <Icon className="h-5 w-5 text-white/85 group-hover:text-white" />
            </div>
            <div className="text-center">
              <span className="block text-[11px] font-semibold text-white/85">{t(key)}</span>
              <span className="block mt-0.5 text-[9px] text-white/40">{desc}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
