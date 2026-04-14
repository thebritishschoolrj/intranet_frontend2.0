import type { User } from "@/types/intranet";

export const mockEmployees: User[] = [
  { id: "1", name: "Carlos Mendes", email: "carlos.mendes@empresa.com", role: "admin", department: "Auditoria Interna", position: "Gerente de Auditoria", birthday: "15/03", joinedAt: "2019-06-01" },
  { id: "2", name: "Fernanda Lima", email: "fernanda.lima@empresa.com", role: "editor", department: "Admissões", position: "Coordenadora de Admissões", birthday: "22/07", joinedAt: "2020-02-15" },
  { id: "3", name: "Roberto Silva", email: "roberto.silva@empresa.com", role: "editor", department: "Compras", position: "Gerente de Compras", birthday: "08/11", joinedAt: "2018-03-10" },
  { id: "4", name: "Juliana Costa", email: "juliana.costa@empresa.com", role: "viewer", department: "Contratos", position: "Analista de Contratos", birthday: "14/04", joinedAt: "2021-08-01" },
  { id: "5", name: "Ana Paula Santos", email: "ana.santos@empresa.com", role: "editor", department: "Departamento Pessoal", position: "Coordenadora de DP", birthday: "30/09", joinedAt: "2017-01-20" },
  { id: "6", name: "Diego Nascimento", email: "diego.nascimento@empresa.com", role: "admin", department: "TI-ADM", position: "Coordenador de TI", birthday: "05/12", joinedAt: "2019-11-01" },
  { id: "7", name: "Beatriz Cardoso", email: "beatriz.cardoso@empresa.com", role: "editor", department: "Recursos Humanos", position: "Gerente de RH", birthday: "18/06", joinedAt: "2016-04-15" },
  { id: "8", name: "Patricia Rocha", email: "patricia.rocha@empresa.com", role: "editor", department: "Financeiro", position: "Gerente Financeira", birthday: "25/01", joinedAt: "2018-09-01" },
  { id: "9", name: "Ricardo Gomes", email: "ricardo.gomes@empresa.com", role: "admin", department: "Gestão", position: "Diretor Administrativo", birthday: "12/08", joinedAt: "2015-01-05" },
  { id: "10", name: "Camila Duarte", email: "camila.duarte@empresa.com", role: "viewer", department: "TI-Educacional", position: "Analista de Sistemas", birthday: "03/05", joinedAt: "2022-03-01" },
  { id: "11", name: "Marcos Oliveira", email: "marcos.oliveira@empresa.com", role: "editor", department: "Contabilidade", position: "Contador Chefe", birthday: "20/10", joinedAt: "2017-07-10" },
  { id: "12", name: "Mariana Souza", email: "mariana.souza@empresa.com", role: "viewer", department: "Nutrição", position: "Nutricionista Chefe", birthday: "11/02", joinedAt: "2020-05-15" },
];
