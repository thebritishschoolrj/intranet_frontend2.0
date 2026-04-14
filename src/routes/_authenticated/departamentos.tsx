import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Building2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AppLayout } from "@/components/layout/AppLayout";
import { useI18n } from "@/hooks/use-i18n";
import { departmentsService } from "@/services/data.service";

export const Route = createFileRoute("/_authenticated/departamentos")({
  component: DepartmentsListPage,
  head: () => ({
    meta: [
      { title: "Departamentos — Intranet 2.0" },
      { name: "description", content: "Lista de departamentos da organização." },
    ],
  }),
});

function DepartmentsListPage() {
  const { t } = useI18n();
  const [departments, setDepartments] = useState<Array<{ slug: string; label: string; description: string | null; responsavel: string | null }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    departmentsService.list()
      .then(setDepartments)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("depts.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("depts.subtitle")}</p>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}><CardContent className="p-5"><div className="h-20 animate-pulse rounded-lg bg-muted" /></CardContent></Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {departments.map((dept, i) => (
              <motion.div
                key={dept.slug}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Link to="/departamento/$slug" params={{ slug: dept.slug }}>
                  <Card className="group h-full cursor-pointer transition-all hover:shadow-lg hover:border-primary/30">
                    <CardContent className="flex items-start gap-4 p-5">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                        <Building2 className="h-5 w-5 text-primary group-hover:text-primary-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{dept.label}</h3>
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{dept.description}</p>
                        <p className="mt-1.5 text-[10px] text-muted-foreground">{dept.responsavel}</p>
                      </div>
                      <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </AppLayout>
  );
}
