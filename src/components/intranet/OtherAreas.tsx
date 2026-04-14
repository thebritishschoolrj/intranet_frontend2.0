import { useI18n } from "@/hooks/use-i18n";
import {
  GraduationCap,
  Leaf,
  Award,
  Briefcase,
  Scale,
  BookOpen,
  FileText,
  UserPlus,
  BadgeCheck,
  School,
  HeartPulse,
  ScrollText,
  Gift,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface AreaItem {
  label: string;
  icon: LucideIcon;
}

interface AreaGroup {
  title: string;
  accent: string;
  items: AreaItem[];
}

const groups: AreaGroup[] = [
  {
    title: "Educação",
    accent: "bg-blue-500",
    items: [
      { label: "Ensino", icon: GraduationCap },
      { label: "Educação Manual", icon: FileText },
      { label: "Colégio Módulo", icon: School },
      { label: "Currículo", icon: ScrollText },
    ],
  },
  {
    title: "Institucional",
    accent: "bg-emerald-500",
    items: [
      { label: "Sustentabilidade", icon: Leaf },
      { label: "Certificado", icon: Award },
      { label: "Credenciamento", icon: BadgeCheck },
    ],
  },
  {
    title: "Jurídico & RH",
    accent: "bg-amber-500",
    items: [
      { label: "Jurídico", icon: Scale },
      { label: "Descrição de Cargo", icon: Briefcase },
      { label: "Benefícios", icon: Gift },
    ],
  },
  {
    title: "Pessoas & Saúde",
    accent: "bg-rose-500",
    items: [
      { label: "Onboarding", icon: UserPlus },
      { label: "Saúde e Prevenção", icon: HeartPulse },
      { label: "Livros", icon: BookOpen },
    ],
  },
];

export function OtherAreas() {
  const { t } = useI18n();

  return (
    <div>
      <h3 className="mb-4 text-sm font-bold italic text-foreground">{t("areas.title")}</h3>

      <div className="grid grid-cols-2 gap-3">
        {groups.map((group) => (
          <div
            key={group.title}
            className="rounded-lg border border-border/60 bg-card p-3 shadow-sm"
          >
            <div className="mb-2.5 flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${group.accent}`} />
              <h4 className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                {group.title}
              </h4>
            </div>

            <ul className="space-y-0.5">
              {group.items.map(({ label, icon: Icon }) => (
                <li key={label}>
                  <button className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-accent/60">
                    <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="text-[11px] font-medium text-foreground">{label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
