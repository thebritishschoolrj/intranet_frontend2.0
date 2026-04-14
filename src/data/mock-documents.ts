import type { Document } from "@/types/intranet";

export const mockDocuments: Document[] = [
  { id: "1", title: "Manual do Colaborador", description: "Guia completo com normas, direitos e deveres dos colaboradores.", category: "manual", fileUrl: "#", fileType: "pdf", fileSize: "2.4 MB", version: "3.1", updatedAt: "2026-03-15", author: "RH" },
  { id: "2", title: "Política de Segurança da Informação", description: "Diretrizes para uso seguro de sistemas e proteção de dados.", category: "politica", fileUrl: "#", fileType: "pdf", fileSize: "1.8 MB", version: "2.0", updatedAt: "2026-02-20", author: "TI-ADM" },
  { id: "3", title: "Formulário de Solicitação de Férias", description: "Formulário padrão para solicitação e aprovação de férias.", category: "formulario", fileUrl: "#", fileType: "docx", fileSize: "45 KB", version: "1.2", updatedAt: "2026-01-10", author: "DP" },
  { id: "4", title: "Procedimento de Compras", description: "Fluxo completo para solicitação e aprovação de compras.", category: "procedimento", departmentSlug: "compras", fileUrl: "#", fileType: "pdf", fileSize: "890 KB", version: "4.0", updatedAt: "2026-03-01", author: "Compras" },
  { id: "5", title: "Template de Apresentação Institucional", description: "Modelo padrão para apresentações corporativas.", category: "template", fileUrl: "#", fileType: "pptx", fileSize: "5.2 MB", version: "2.1", updatedAt: "2026-02-15", author: "Marketing" },
  { id: "6", title: "Política de Privacidade (LGPD)", description: "Política de proteção de dados pessoais conforme LGPD.", category: "politica", fileUrl: "#", fileType: "pdf", fileSize: "1.2 MB", version: "1.5", updatedAt: "2026-03-20", author: "Jurídico" },
  { id: "7", title: "Manual de Integração", description: "Material de onboarding para novos colaboradores.", category: "manual", fileUrl: "#", fileType: "pdf", fileSize: "3.1 MB", version: "2.3", updatedAt: "2026-01-25", author: "RH" },
  { id: "8", title: "Formulário de Ordem de Serviço", description: "Formulário para abertura de chamados de manutenção.", category: "formulario", departmentSlug: "manutencao", fileUrl: "#", fileType: "xlsx", fileSize: "120 KB", version: "1.0", updatedAt: "2026-02-05", author: "Manutenção" },
];
