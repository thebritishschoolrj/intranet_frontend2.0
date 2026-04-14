import type { Procedure } from "@/types/intranet";

export const mockProcedures: Procedure[] = [
  {
    id: "1", code: "PRC-001", title: "Processo de Admissão de Colaboradores",
    description: "Descreve o fluxo completo desde a aprovação da vaga até a integração do novo colaborador.",
    departmentSlug: "admissoes", version: "3.0", status: "vigente",
    effectiveDate: "2025-01-15", updatedAt: "2025-12-20", author: "Fernanda Lima",
    attachments: [{ name: "Checklist Admissional.pdf", url: "#", type: "pdf" }, { name: "Formulário de Integração.docx", url: "#", type: "docx" }],
    history: [
      { version: "3.0", date: "2025-12-20", author: "Fernanda Lima", changes: "Atualização do fluxo de documentação digital" },
      { version: "2.1", date: "2024-06-10", author: "Fernanda Lima", changes: "Inclusão de etapa de onboarding digital" },
      { version: "2.0", date: "2023-03-01", author: "Ana Santos", changes: "Revisão geral do procedimento" },
    ],
  },
  {
    id: "2", code: "PRC-002", title: "Procedimento de Compras Diretas",
    description: "Define os critérios e fluxo para compras de baixo valor sem necessidade de licitação.",
    departmentSlug: "compras", version: "4.1", status: "vigente",
    effectiveDate: "2025-03-01", updatedAt: "2026-02-15", author: "Roberto Silva",
    attachments: [{ name: "Formulário de Requisição.xlsx", url: "#", type: "xlsx" }],
    history: [
      { version: "4.1", date: "2026-02-15", author: "Roberto Silva", changes: "Atualização dos limites de valor" },
      { version: "4.0", date: "2025-03-01", author: "Roberto Silva", changes: "Nova política de aprovação" },
    ],
  },
  {
    id: "3", code: "PRC-003", title: "Gestão de Incidentes de Segurança da Informação",
    description: "Procedimento para identificação, classificação e resposta a incidentes de segurança.",
    departmentSlug: "ti-adm", version: "2.0", status: "vigente",
    effectiveDate: "2025-06-01", updatedAt: "2025-11-10", author: "Diego Nascimento",
    attachments: [{ name: "Matriz de Classificação.pdf", url: "#", type: "pdf" }, { name: "Template de Relatório.docx", url: "#", type: "docx" }],
    history: [
      { version: "2.0", date: "2025-11-10", author: "Diego Nascimento", changes: "Inclusão de resposta a ransomware" },
      { version: "1.0", date: "2024-06-01", author: "Diego Nascimento", changes: "Versão inicial" },
    ],
  },
  {
    id: "4", code: "PRC-004", title: "Processo de Desligamento",
    description: "Fluxo completo para desligamento voluntário e involuntário de colaboradores.",
    departmentSlug: "departamento-pessoal", version: "2.2", status: "em_revisao",
    effectiveDate: "2024-08-01", updatedAt: "2026-03-01", author: "Ana Paula Santos",
    attachments: [{ name: "Checklist de Desligamento.pdf", url: "#", type: "pdf" }],
    history: [
      { version: "2.2", date: "2026-03-01", author: "Ana Paula Santos", changes: "Em revisão para adequação à nova legislação" },
      { version: "2.1", date: "2025-02-15", author: "Ana Paula Santos", changes: "Inclusão de entrevista de desligamento" },
    ],
  },
];
