import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useI18n } from "@/hooks/use-i18n";
import { ArrowLeft, Mail, Phone, Clock, ChevronRight, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { departmentsService } from "@/services/data.service";

interface DepartmentData {
  slug: string;
  label: string;
  description: string | null;
  responsavel: string | null;
  email: string | null;
  ramal: string | null;
  horario: string | null;
  servicos: string[] | null;
}

export const Route = createFileRoute("/src/routes/_authenticated/departamento/$slug")({
  component: DepartmentPage,
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} — Intranet` },
      { name: "description", content: "Departamento da organização" },
    ],
  }),
  notFoundComponent: () => (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <h1 className="text-2xl font-bold text-foreground">Departamento não encontrado</h1>
      <Link to="/" className="mt-4 text-primary underline">Voltar ao início</Link>
    </div>
  ),
});

function DepartmentPage() {
  const { slug } = Route.useParams();
  const { t } = useI18n();
  const [dept, setDept] = useState<DepartmentData | null>(null);
  const [allDepts, setAllDepts] = useState<DepartmentData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      departmentsService.getBySlug(slug),
      departmentsService.list(),
    ])
      .then(([d, all]) => {
        setDept(d as DepartmentData | null);
        setAllDepts(all as DepartmentData[]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </AppLayout>
    );
  }

  if (!dept) {
    throw notFound();
  }

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        {/* Hero */}
        <div className="-mx-4 -mt-4 rounded-b-2xl bg-primary px-6 py-8 md:-mx-6 md:-mt-6">
          <Link to="/departamentos" className="mb-4 inline-flex items-center gap-1.5 text-sm text-primary-foreground/70 transition-colors hover:text-primary-foreground">
            <ArrowLeft className="h-4 w-4" />
            {t("dept.back")}
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-foreground/10">
              <Building2 className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary-foreground">{dept.label}</h1>
              <p className="mt-1 max-w-xl text-sm text-primary-foreground/70">{dept.description}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm md:col-span-1">
            <h2 className="mb-4 text-sm font-bold text-foreground">{t("dept.info")}</h2>
            <div className="flex flex-col gap-4">
              {[
                { icon: Building2, labelKey: "dept.responsible", value: dept.responsavel ?? "—" },
                { icon: Mail, labelKey: "dept.email", value: dept.email ?? "—" },
                { icon: Phone, labelKey: "dept.extension", value: dept.ramal ?? "—" },
                { icon: Clock, labelKey: "dept.hours", value: dept.horario ?? "—" },
              ].map(({ icon: ItemIcon, labelKey, value }) => (
                <div key={labelKey} className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent">
                    <ItemIcon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t(labelKey)}</p>
                    <p className="text-sm font-medium text-foreground">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 shadow-sm md:col-span-2">
            <h2 className="mb-4 text-sm font-bold text-foreground">{t("dept.services")}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {(dept.servicos ?? []).map((servico) => (
                <div key={servico} className="flex items-center gap-3 rounded-lg border border-border bg-secondary/50 p-3 transition-colors hover:bg-accent">
                  <ChevronRight className="h-4 w-4 shrink-0 text-primary" />
                  <span className="text-sm text-foreground">{servico}</span>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <Button className="w-full sm:w-auto">
                <Mail className="mr-2 h-4 w-4" />
                {t("dept.contact")}
              </Button>
            </div>
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-sm font-bold text-foreground">{t("dept.others")}</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-6">
            {allDepts
              .filter((d) => d.slug !== slug)
              .slice(0, 6)
              .map(({ label, slug: otherSlug }) => (
                <Link
                  key={otherSlug}
                  to="/departamento/$slug"
                  params={{ slug: otherSlug }}
                  className="group flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-3 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent transition-colors group-hover:bg-primary/10">
                    <Building2 className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                  </div>
                  <span className="text-center text-[10px] font-medium leading-tight text-muted-foreground group-hover:text-foreground">{label}</span>
                </Link>
              ))}
          </div>
        </div>
      </motion.div>
    </AppLayout>
  );
}
