import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { useI18n } from "@/hooks/use-i18n";
import { departmentsService } from "@/services/data.service";
import { Building2 } from "lucide-react";

export function AdminSection() {
  const { t } = useI18n();
  const [departments, setDepartments] = useState<{ slug: string; label: string }[]>([]);

  useEffect(() => {
    departmentsService.list()
      .then((data) => setDepartments(data.map((d) => ({ slug: d.slug, label: d.label }))))
      .catch(() => {});
  }, []);

  return (
    <div>
      <h2 className="mb-1 text-lg font-bold text-white">{t("admin.title")}</h2>
      <p className="mb-5 text-[11px] text-white/50">Acesso rápido aos departamentos administrativos</p>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9">
        {departments.map(({ label, slug }) => (
          <Link
            key={slug}
            to="/departamento/$slug"
            params={{ slug }}
            className="group flex flex-col items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.06] px-2 py-3 transition-all hover:bg-white/[0.14] hover:border-white/20"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white/10 transition-colors group-hover:bg-white/20">
              <Building2 className="h-4 w-4 text-white/80 group-hover:text-white" />
            </div>
            <span className="text-center text-[9px] font-semibold leading-tight text-white/70 group-hover:text-white/95">
              {label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
