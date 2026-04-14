import { Cake, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/hooks/use-i18n";

const birthdays = [
  { name: "Maria Lima Motta", dept: "Departamento Adm", date: "12/04" },
  { name: "Pedro José Campos", dept: "Departamento Engenharia", date: "13/04" },
  { name: "Ana Feliciana", dept: "Departamento Saúde", date: "14/04" },
];

export function BirthdaysSection() {
  const { t } = useI18n();

  return (
    <div>
      <h3 className="mb-3 text-sm font-bold italic text-foreground">{t("birthdays.title")}</h3>
      <div className="rounded-lg border border-border bg-card shadow-sm">
        <div className="flex flex-col divide-y divide-border">
          {birthdays.map((person) => (
            <div key={person.name} className="flex items-center gap-3 px-3 py-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy/10">
                <Cake className="h-4 w-4 text-navy" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-foreground">{person.name}</p>
                <p className="text-[10px] text-muted-foreground">{person.dept}</p>
              </div>
              <div className="shrink-0 text-right">
                <span className="text-[10px] text-muted-foreground">Data:</span>
                <p className="text-xs font-bold text-corporate-red">{person.date}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-border p-1.5">
          <Button variant="ghost" size="sm" className="w-full text-[10px] text-muted-foreground h-7">
            {t("birthdays.viewAll")} <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
