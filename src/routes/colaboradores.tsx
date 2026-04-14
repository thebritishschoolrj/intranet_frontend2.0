import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Search, Mail, Phone, MapPin, Building2, Grid3X3, List,
  Users, Briefcase, ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useI18n } from "@/hooks/use-i18n";
import { employeesService, departmentsService } from "@/services/data.service";
import type { User } from "@/types/domain";

export const Route = createFileRoute("/colaboradores")({
  component: EmployeesPage,
  head: () => ({
    meta: [
      { title: "Colaboradores — Intranet 2.0" },
      { name: "description", content: "Diretório de colaboradores da organização." },
    ],
  }),
});

function EmployeesPage() {
  const { t, lang } = useI18n();
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [employees, setEmployees] = useState<User[]>([]);
  const [departments, setDepartments] = useState<{ slug: string; label: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    departmentsService.list().then((depts) => {
      setDepartments(depts.map((d) => ({ slug: d.slug, label: d.label })));
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    employeesService
      .list({
        search: search || undefined,
        department: deptFilter === "all" ? undefined : deptFilter,
        status: statusFilter === "all" ? undefined : statusFilter,
        page,
        pageSize: 24,
      })
      .then((res) => {
        setEmployees(res.data);
        setTotal(res.total);
        setTotalPages(res.totalPages);
      })
      .catch(() => setEmployees([]))
      .finally(() => setLoading(false));
  }, [search, deptFilter, statusFilter, page]);

  const getInitials = (name: string) => name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t("employees.title")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {total} {lang === "pt" ? "colaboradores" : "employees"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant={viewMode === "grid" ? "default" : "outline"} size="icon" className="h-8 w-8" onClick={() => setViewMode("grid")}>
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button variant={viewMode === "list" ? "default" : "outline"} size="icon" className="h-8 w-8" onClick={() => setViewMode("list")}>
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <div className="relative flex-1 sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("employees.search")}
              className="pl-9"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <Select value={deptFilter} onValueChange={(v) => { setDeptFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder={t("employees.department")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("employees.allDepts")}</SelectItem>
              {departments.map((d) => (
                <SelectItem key={d.slug} value={d.slug}>{d.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{lang === "pt" ? "Todos" : "All"}</SelectItem>
              <SelectItem value="active">{lang === "pt" ? "Ativo" : "Active"}</SelectItem>
              <SelectItem value="inactive">{lang === "pt" ? "Inativo" : "Inactive"}</SelectItem>
              <SelectItem value="suspended">{lang === "pt" ? "Suspenso" : "Suspended"}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : employees.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="h-12 w-12 text-muted-foreground" />
            <p className="mt-3 text-sm font-medium text-foreground">{t("crud.noResults")}</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {employees.map((emp, i) => (
              <motion.div key={emp.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Link to="/colaboradores/$id" params={{ id: emp.id }}>
                  <Card className="h-full transition-all hover:shadow-md hover:border-primary/30 cursor-pointer">
                    <CardContent className="flex flex-col items-center p-5 text-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                        {getInitials(emp.name)}
                      </div>
                      <h3 className="mt-3 text-sm font-semibold text-foreground">{emp.preferredName || emp.name}</h3>
                      <p className="mt-0.5 text-xs text-muted-foreground">{emp.position}</p>
                      <Badge variant="outline" className="mt-2 text-[10px]">{emp.department}</Badge>
                      <StatusBadge status={emp.status} lang={lang as "pt" | "en"} className="mt-1" />
                      {emp.location && (
                        <p className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground">
                          <MapPin className="h-3 w-3" /> {emp.location}
                        </p>
                      )}
                      <div className="mt-3 flex items-center gap-2">
                        <a href={`mailto:${emp.email}`} className="flex h-8 w-8 items-center justify-center rounded-full bg-accent transition-colors hover:bg-accent/80" onClick={(e) => e.stopPropagation()}>
                          <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                        </a>
                        {emp.phone && (
                          <a href={`tel:${emp.phone}`} className="flex h-8 w-8 items-center justify-center rounded-full bg-accent transition-colors hover:bg-accent/80" onClick={(e) => e.stopPropagation()}>
                            <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {employees.map((emp, i) => (
              <motion.div key={emp.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
                <Link to="/colaboradores/$id" params={{ id: emp.id }}>
                  <Card className="transition-shadow hover:shadow-md cursor-pointer">
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                        {getInitials(emp.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="truncate text-sm font-medium text-foreground">{emp.preferredName || emp.name}</h4>
                          <StatusBadge status={emp.status} lang={lang as "pt" | "en"} />
                          <Badge variant="outline" className="text-[10px] capitalize">{emp.role}</Badge>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">{emp.position}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-1"><Building2 className="h-3 w-3" /> {emp.department}</span>
                          {emp.location && <><span>·</span><span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {emp.location}</span></>}
                          <span>·</span>
                          <span>{emp.email}</span>
                          {emp.extension && <><span>·</span><span>{lang === "pt" ? "Ramal" : "Ext"} {emp.extension}</span></>}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              {lang === "pt" ? "Anterior" : "Previous"}
            </Button>
            <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              {lang === "pt" ? "Próxima" : "Next"}
            </Button>
          </div>
        )}
      </motion.div>
    </AppLayout>
  );
}
