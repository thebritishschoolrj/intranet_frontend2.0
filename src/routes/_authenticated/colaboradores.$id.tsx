import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  ArrowLeft, Mail, Phone, MapPin, Building2, Calendar,
  Briefcase, User as UserIcon, Tag, Globe, Clock, Hash,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useI18n } from "@/hooks/use-i18n";
import { employeesService } from "@/services/data.service";
import type { User } from "@/types/domain";

export const Route = createFileRoute("/_authenticated/colaboradores/$id")({
  component: EmployeeProfilePage,
  head: () => ({
    meta: [
      { title: "Perfil do Colaborador — Intranet 2.0" },
      { name: "description", content: "Perfil detalhado do colaborador." },
    ],
  }),
});

function EmployeeProfilePage() {
  const { id } = Route.useParams();
  const { t, lang } = useI18n();
  const [employee, setEmployee] = useState<User | null>(null);
  const [manager, setManager] = useState<User | null>(null);
  const [teammates, setTeammates] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    employeesService.getById(id)
      .then(async (emp) => {
        setEmployee(emp);
        if (emp?.managerId) {
          employeesService.getByProfileId(emp.managerId).then(setManager).catch(() => {});
        }
        if (emp?.departmentSlug) {
          employeesService.getByDepartment(emp.departmentSlug)
            .then((list) => setTeammates(list.filter((t) => t.id !== emp.id).slice(0, 6)))
            .catch(() => {});
        }
      })
      .catch(() => setEmployee(null))
      .finally(() => setLoading(false));
  }, [id]);

  const getInitials = (name: string) => name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </AppLayout>
    );
  }

  if (!employee) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <UserIcon className="h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-lg font-bold text-foreground">
            {lang === "pt" ? "Colaborador não encontrado" : "Employee not found"}
          </h2>
          <Link to="/colaboradores" className="mt-4">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" /> {lang === "pt" ? "Voltar ao diretório" : "Back to directory"}
            </Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <Link to="/colaboradores">
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> {lang === "pt" ? "Voltar ao diretório" : "Back to directory"}
          </Button>
        </Link>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main profile */}
          <div className="space-y-6 lg:col-span-2">
            {/* Header card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                    {getInitials(employee.name)}
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                      <h1 className="text-xl font-bold text-foreground">{employee.name}</h1>
                      <StatusBadge status={employee.status} lang={lang as "pt" | "en"} />
                      <Badge variant="outline" className="text-xs capitalize">{employee.role}</Badge>
                    </div>
                    {employee.preferredName && (
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {lang === "pt" ? "Nome preferido" : "Preferred name"}: <span className="font-medium text-foreground">{employee.preferredName}</span>
                      </p>
                    )}
                    <p className="mt-1 text-sm text-muted-foreground">{employee.position}</p>
                    <div className="mt-2 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Building2 className="h-3.5 w-3.5" /> {employee.department}
                      </span>
                      {employee.location && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5" /> {employee.location}
                        </span>
                      )}
                      {employee.unit && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Hash className="h-3.5 w-3.5" /> {employee.unit}
                        </span>
                      )}
                    </div>
                    {/* Actions */}
                    <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                      <a href={`mailto:${employee.email}`}>
                        <Button size="sm" className="gap-1.5">
                          <Mail className="h-3.5 w-3.5" /> Email
                        </Button>
                      </a>
                      {employee.phone && (
                        <a href={`tel:${employee.phone}`}>
                          <Button variant="outline" size="sm" className="gap-1.5">
                            <Phone className="h-3.5 w-3.5" /> {employee.phone}
                          </Button>
                        </a>
                      )}
                      {employee.extension && (
                        <Button variant="outline" size="sm" className="gap-1.5 cursor-default">
                          <Phone className="h-3.5 w-3.5" /> {lang === "pt" ? "Ramal" : "Ext"} {employee.extension}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bio */}
            {employee.bio && (
              <Card>
                <CardContent className="p-5 space-y-2">
                  <h3 className="text-sm font-semibold text-foreground">{lang === "pt" ? "Sobre" : "About"}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{employee.bio}</p>
                </CardContent>
              </Card>
            )}

            {/* Skills */}
            {employee.skills.length > 0 && (
              <Card>
                <CardContent className="p-5 space-y-3">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Briefcase className="h-4 w-4" /> {lang === "pt" ? "Competências" : "Skills"}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {employee.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Manager */}
            {manager && (
              <Card>
                <CardContent className="p-5 space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">
                    {lang === "pt" ? "Gestor" : "Manager"}
                  </h3>
                  <Link to="/colaboradores/$id" params={{ id: manager.id }}>
                    <div className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-accent cursor-pointer">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                        {getInitials(manager.name)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{manager.name}</p>
                        <p className="text-xs text-muted-foreground">{manager.position}</p>
                      </div>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Teammates */}
            {teammates.length > 0 && (
              <Card>
                <CardContent className="p-5 space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">
                    {lang === "pt" ? "Colegas de Departamento" : "Department Colleagues"}
                  </h3>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {teammates.map((tm) => (
                      <Link key={tm.id} to="/colaboradores/$id" params={{ id: tm.id }}>
                        <div className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-accent cursor-pointer">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-foreground">
                            {getInitials(tm.name)}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">{tm.preferredName || tm.name}</p>
                            <p className="truncate text-xs text-muted-foreground">{tm.position}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-5 space-y-4">
                <h3 className="text-sm font-semibold text-foreground">
                  {lang === "pt" ? "Informações" : "Information"}
                </h3>
                <Separator />
                <div className="space-y-3 text-sm">
                  <InfoRow icon={Hash} label={lang === "pt" ? "Matrícula" : "Employee ID"} value={employee.employeeId} />
                  <InfoRow icon={Mail} label="Email" value={employee.email} />
                  {employee.phone && <InfoRow icon={Phone} label={lang === "pt" ? "Telefone" : "Phone"} value={employee.phone} />}
                  {employee.extension && <InfoRow icon={Phone} label={lang === "pt" ? "Ramal" : "Extension"} value={employee.extension} />}
                  <InfoRow icon={Building2} label={lang === "pt" ? "Departamento" : "Department"} value={employee.department} />
                  {employee.location && <InfoRow icon={MapPin} label={lang === "pt" ? "Localização" : "Location"} value={employee.location} />}
                  {employee.unit && <InfoRow icon={Building2} label={lang === "pt" ? "Unidade" : "Unit"} value={employee.unit} />}
                  <InfoRow icon={Globe} label={lang === "pt" ? "Idioma" : "Language"} value={employee.preferredLanguage === "pt" ? "Português" : "English"} />
                  {employee.joinedAt && (
                    <InfoRow icon={Calendar} label={lang === "pt" ? "Data de Admissão" : "Hire Date"} value={new Date(employee.joinedAt).toLocaleDateString("pt-BR")} />
                  )}
                  {employee.birthday && (
                    <InfoRow icon={Calendar} label={lang === "pt" ? "Aniversário" : "Birthday"} value={employee.birthday} />
                  )}
                </div>

                {employee.tags.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Tags</p>
                      <div className="flex flex-wrap gap-1">
                        {employee.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-[10px]">#{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </AppLayout>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-foreground truncate">{value}</p>
      </div>
    </div>
  );
}
