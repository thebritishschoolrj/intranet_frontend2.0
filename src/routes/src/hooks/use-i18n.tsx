import { createContext, useContext, useState, type ReactNode } from "react";

type Lang = "pt" | "en";

interface I18nContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
}

const translations: Record<string, Record<Lang, string>> = {
  // Header
  "header.title": { pt: "Intranet", en: "Intranet" },
  "header.subtitle": { pt: "Portal Corporativo", en: "Corporate Portal" },
  "header.search": { pt: "Buscar na intranet...", en: "Search intranet..." },
  "header.user": { pt: "Colaborador", en: "Employee" },

  // Navigation
  "nav.dashboard": { pt: "Painel", en: "Dashboard" },
  "nav.news": { pt: "Notícias", en: "News" },
  "nav.documents": { pt: "Documentos", en: "Documents" },
  "nav.procedures": { pt: "Procedimentos", en: "Procedures" },
  "nav.employees": { pt: "Colaboradores", en: "Employees" },
  "nav.departments": { pt: "Departamentos", en: "Departments" },
  "nav.institutional": { pt: "Institucional", en: "Institutional" },
  "nav.admin": { pt: "Administração", en: "Administration" },

  // Quick Access
  "quick.cipa": { pt: "CIPA", en: "CIPA" },
  "quick.home": { pt: "Início", en: "Home" },
  "quick.loi": { pt: "LOI", en: "LOI" },
  "quick.calendar": { pt: "Calendário", en: "Calendar" },
  "quick.quality": { pt: "Qualidade", en: "Quality" },
  "quick.finance": { pt: "Financeiro", en: "Finance" },
  "quick.it": { pt: "TI", en: "IT" },
  "quick.hr": { pt: "RH", en: "HR" },
  "quick.purchasing": { pt: "Compras", en: "Purchasing" },

  // Highlights
  "highlights.title": { pt: "Destaques", en: "Highlights" },
  "highlights.campanha": { pt: "Campanha Prevenção", en: "Prevention Campaign" },
  "highlights.cultura": { pt: "Cultura Organizacional", en: "Organizational Culture" },
  "highlights.atendimento": { pt: "Atendimento e Recepção", en: "Reception & Service" },
  "highlights.dpo": { pt: "DPO", en: "DPO" },
  "highlights.crea": { pt: "CREA", en: "CREA" },
  "highlights.networking": { pt: "Networking", en: "Networking" },
  "highlights.flyclass": { pt: "Admin da Fly Class", en: "Fly Class Admin" },
  "highlights.mainboard": { pt: "Main Board", en: "Main Board" },
  "highlights.prevencao": { pt: "Admin da Prevenção", en: "Prevention Admin" },

  // Notices
  "notices.title": { pt: "Avisos", en: "Notices" },
  "notices.weekly.title": { pt: "Weekly Check-in", en: "Weekly Check-in" },
  "notices.weekly.desc": { pt: "Não perca a reunião semanal toda sexta-feira às 14h.", en: "Don't miss the weekly meeting every Friday at 2 PM." },
  "notices.weekly.cta": { pt: "Acessar Sala", en: "Join Room" },
  "notices.training.title": { pt: "Treinamento de Segurança", en: "Safety Training" },
  "notices.training.desc": { pt: "Novo treinamento obrigatório disponível na plataforma.", en: "New mandatory training available on the platform." },
  "notices.training.cta": { pt: "Ver Detalhes", en: "View Details" },
  "notices.campaign.title": { pt: "Campanha Solidária", en: "Charity Campaign" },
  "notices.campaign.desc": { pt: "Participe da campanha de doações deste mês.", en: "Participate in this month's donation campaign." },
  "notices.campaign.cta": { pt: "Participar", en: "Participate" },

  // Strategic
  "strategic.title": { pt: "Direção Estratégica", en: "Strategic Direction" },
  "strategic.policies": { pt: "Políticas e Procedimentos", en: "Policies & Procedures" },
  "strategic.sustainability": { pt: "DS Sustentabilidade", en: "DS Sustainability" },
  "strategic.metrics": { pt: "DI Informações e Métricas", en: "DI Information & Metrics" },
  "strategic.calendar": { pt: "Calendário Acadêmico", en: "Academic Calendar" },

  // Admin
  "admin.title": { pt: "Seção Administrativa", en: "Administrative Section" },

  // Organogram
  "organogram.title": { pt: "Organograma", en: "Organogram" },
  "organogram.leaders": { pt: "Líderes", en: "Leaders" },
  "organogram.chart": { pt: "Organograma", en: "Org Chart" },
  "organogram.sites": { pt: "Nossos Sites", en: "Our Sites" },

  // Systems
  "systems.title": { pt: "Sistemas", en: "Systems" },
  "systems.viewAll": { pt: "Ver todos", en: "View all" },

  // Other areas
  "areas.title": { pt: "Outras Áreas", en: "Other Areas" },

  // Birthdays
  "birthdays.title": { pt: "Aniversariantes do Mês", en: "Birthdays of the Month" },
  "birthdays.viewAll": { pt: "Ver Todos", en: "View All" },

  // Department page
  "dept.back": { pt: "Voltar ao início", en: "Back to home" },
  "dept.info": { pt: "Informações", en: "Information" },
  "dept.responsible": { pt: "Responsável", en: "Responsible" },
  "dept.email": { pt: "E-mail", en: "Email" },
  "dept.extension": { pt: "Ramal", en: "Extension" },
  "dept.hours": { pt: "Horário", en: "Hours" },
  "dept.services": { pt: "Serviços", en: "Services" },
  "dept.contact": { pt: "Entrar em contato", en: "Get in touch" },
  "dept.others": { pt: "Outros Departamentos", en: "Other Departments" },
  "dept.notFound": { pt: "Departamento não encontrado", en: "Department not found" },

  // News page
  "news.title": { pt: "Notícias e Comunicados", en: "News & Announcements" },
  "news.all": { pt: "Todas", en: "All" },
  "news.aviso": { pt: "Avisos", en: "Notices" },
  "news.evento": { pt: "Eventos", en: "Events" },
  "news.comunicado": { pt: "Comunicados", en: "Announcements" },
  "news.campanha": { pt: "Campanhas", en: "Campaigns" },
  "news.readMore": { pt: "Leia mais", en: "Read more" },
  "news.pinned": { pt: "Fixado", en: "Pinned" },
  "news.featured": { pt: "Destaques", en: "Featured" },
  "news.latest": { pt: "Mais Recentes", en: "Latest" },
  "news.backToList": { pt: "Voltar às notícias", en: "Back to news" },
  "news.publishedOn": { pt: "Publicado em", en: "Published on" },
  "news.by": { pt: "por", en: "by" },
  "news.tags": { pt: "Tags", en: "Tags" },
  "news.expiresAt": { pt: "Expira em", en: "Expires on" },
  "news.scheduledFor": { pt: "Agendado para", en: "Scheduled for" },
  "news.review": { pt: "Em Revisão", en: "In Review" },
  "news.sendToReview": { pt: "Enviar para Revisão", en: "Send to Review" },
  "news.noFeatured": { pt: "Nenhum destaque no momento", en: "No featured news at the moment" },

  // Documents page
  "docs.title": { pt: "Biblioteca de Documentos", en: "Document Library" },
  "docs.all": { pt: "Todos", en: "All" },
  "docs.manual": { pt: "Manuais", en: "Manuals" },
  "docs.formulario": { pt: "Formulários", en: "Forms" },
  "docs.politica": { pt: "Políticas", en: "Policies" },
  "docs.procedimento": { pt: "Procedimentos", en: "Procedures" },
  "docs.template": { pt: "Templates", en: "Templates" },
  "docs.download": { pt: "Baixar", en: "Download" },
  "docs.version": { pt: "Versão", en: "Version" },
  "docs.updated": { pt: "Atualizado em", en: "Updated on" },
  "docs.responsible": { pt: "Responsável", en: "Responsible" },
  "docs.effectiveDate": { pt: "Data de Vigência", en: "Effective Date" },
  "docs.expiryDate": { pt: "Data de Expiração", en: "Expiry Date" },
  "docs.featured": { pt: "Destaque", en: "Featured" },

  // Employees page
  "employees.title": { pt: "Diretório de Colaboradores", en: "Employee Directory" },
  "employees.search": { pt: "Buscar por nome, email, cargo ou matrícula...", en: "Search by name, email, title or ID..." },
  "employees.department": { pt: "Departamento", en: "Department" },
  "employees.position": { pt: "Cargo", en: "Position" },
  "employees.allDepts": { pt: "Todos os departamentos", en: "All departments" },
  "employees.location": { pt: "Localização", en: "Location" },
  "employees.skills": { pt: "Competências", en: "Skills" },
  "employees.hireDate": { pt: "Data de Admissão", en: "Hire Date" },
  "employees.manager": { pt: "Gestor", en: "Manager" },

  // Procedures page
  "proc.title": { pt: "Procedimentos Operacionais", en: "Standard Operating Procedures" },
  "proc.vigente": { pt: "Vigente", en: "Active" },
  "proc.em_revisao": { pt: "Em Revisão", en: "Under Review" },
  "proc.obsoleto": { pt: "Obsoleto", en: "Obsolete" },
  "proc.version": { pt: "Versão", en: "Version" },
  "proc.effective": { pt: "Vigência", en: "Effective" },
  "proc.attachments": { pt: "Anexos", en: "Attachments" },
  "proc.history": { pt: "Histórico de Versões", en: "Version History" },
  "proc.backToList": { pt: "Voltar aos procedimentos", en: "Back to procedures" },
  "proc.responsible": { pt: "Responsável", en: "Responsible" },
  "proc.category": { pt: "Categoria", en: "Category" },
  "proc.operacional": { pt: "Operacional", en: "Operational" },
  "proc.administrativo": { pt: "Administrativo", en: "Administrative" },
  "proc.seguranca": { pt: "Segurança", en: "Security" },
  "proc.qualidade": { pt: "Qualidade", en: "Quality" },
  "proc.compliance": { pt: "Compliance", en: "Compliance" },
  "proc.active": { pt: "Ativo", en: "Active" },
  "proc.inactive": { pt: "Inativo", en: "Inactive" },
  "proc.code": { pt: "Código", en: "Code" },
  "proc.department": { pt: "Departamento", en: "Department" },

  // Departments listing page
  "depts.title": { pt: "Departamentos", en: "Departments" },
  "depts.subtitle": { pt: "Navegue pelos departamentos da organização", en: "Browse organization departments" },

  // Institutional
  "inst.title": { pt: "Páginas Institucionais", en: "Institutional Pages" },
  "inst.subtitle": { pt: "Conteúdo corporativo e informações institucionais", en: "Corporate content and institutional information" },
  "inst.backToList": { pt: "Voltar ao institucional", en: "Back to institutional" },
  "inst.featured": { pt: "Destaques", en: "Featured" },
  "inst.cat.onboarding": { pt: "Onboarding", en: "Onboarding" },
  "inst.cat.compliance": { pt: "Compliance", en: "Compliance" },
  "inst.cat.ethics": { pt: "Canal de Ética", en: "Ethics Channel" },
  "inst.cat.cipa": { pt: "CIPA", en: "CIPA" },
  "inst.cat.lgpd": { pt: "LGPD", en: "LGPD" },
  "inst.cat.quality": { pt: "Qualidade", en: "Quality" },
  "inst.cat.departmental": { pt: "Departamental", en: "Departmental" },
  "inst.cat.general": { pt: "Geral", en: "General" },
  "inst.onboarding": { pt: "Onboarding", en: "Onboarding" },
  "inst.onboarding.desc": { pt: "Guia de integração para novos colaboradores", en: "Integration guide for new employees" },
  "inst.compliance": { pt: "Compliance", en: "Compliance" },
  "inst.compliance.desc": { pt: "Normas, regulamentos e políticas de conformidade", en: "Rules, regulations and compliance policies" },
  "inst.ethics": { pt: "Canal de Ética", en: "Ethics Channel" },
  "inst.ethics.desc": { pt: "Denúncias e relatos de forma segura e anônima", en: "Reports and complaints safely and anonymously" },
  "inst.cipa": { pt: "CIPA", en: "CIPA" },
  "inst.cipa.desc": { pt: "Comissão Interna de Prevenção de Acidentes", en: "Internal Accident Prevention Commission" },
  "inst.lgpd": { pt: "LGPD", en: "LGPD" },
  "inst.lgpd.desc": { pt: "Lei Geral de Proteção de Dados", en: "General Data Protection Law" },
  "inst.quality": { pt: "Qualidade", en: "Quality" },
  "inst.quality.desc": { pt: "Sistema de gestão da qualidade e certificações", en: "Quality management system and certifications" },

  // Admin page
  "adm.title": { pt: "Painel Administrativo", en: "Admin Panel" },
  "adm.users": { pt: "Gestão de Usuários", en: "User Management" },
  "adm.users.desc": { pt: "Gerenciar contas, perfis e permissões", en: "Manage accounts, profiles and permissions" },
  "adm.content": { pt: "Gestão de Conteúdo", en: "Content Management" },
  "adm.content.desc": { pt: "Publicar e gerenciar notícias e avisos", en: "Publish and manage news and notices" },
  "adm.depts": { pt: "Departamentos", en: "Departments" },
  "adm.depts.desc": { pt: "Configurar departamentos e responsáveis", en: "Configure departments and managers" },
  "adm.docs": { pt: "Documentos", en: "Documents" },
  "adm.docs.desc": { pt: "Gerenciar biblioteca de documentos", en: "Manage document library" },
  "adm.roles": { pt: "Controle de Acesso", en: "Access Control" },
  "adm.roles.desc": { pt: "Configurar perfis e permissões RBAC", en: "Configure RBAC profiles and permissions" },
  "adm.stats": { pt: "Estatísticas", en: "Statistics" },
  "adm.stats.desc": { pt: "Métricas de uso e engajamento", en: "Usage and engagement metrics" },

  // Dashboard
  "dash.welcome": { pt: "Bem-vindo de volta", en: "Welcome back" },
  "dash.totalEmployees": { pt: "Total de Colaboradores", en: "Total Employees" },
  "dash.departments": { pt: "Departamentos", en: "Departments" },
  "dash.activeNews": { pt: "Notícias Ativas", en: "Active News" },
  "dash.documents": { pt: "Documentos", en: "Documents" },
  "dash.recentNews": { pt: "Notícias Recentes", en: "Recent News" },
  "dash.quickActions": { pt: "Ações Rápidas", en: "Quick Actions" },
  "dash.upcomingBirthdays": { pt: "Próximos Aniversários", en: "Upcoming Birthdays" },
  "dash.publishedNews": { pt: "Notícias Publicadas", en: "Published News" },
  "dash.publishedDocs": { pt: "Docs Publicados", en: "Published Docs" },
  "dash.activeProcedures": { pt: "Procedimentos Ativos", en: "Active Procedures" },
  "dash.publishedPages": { pt: "Páginas Publicadas", en: "Published Pages" },
  "dash.pendingWorkflows": { pt: "Pendências", en: "Pending Actions" },
  "dash.pendingNewsReview": { pt: "Notícias em revisão", en: "News in review" },
  "dash.pendingDraftProcs": { pt: "Procedimentos rascunho", en: "Draft procedures" },
  "dash.pendingArchived": { pt: "Conteúdo arquivado", en: "Archived content" },
  "dash.pendingUnpubPages": { pt: "Páginas não publicadas", en: "Unpublished pages" },
  "dash.latestNews": { pt: "Últimas Notícias", en: "Latest News" },
  "dash.featuredNews": { pt: "Notícias em Destaque", en: "Featured News" },
  "dash.recentProcedures": { pt: "Procedimentos Recentes", en: "Recent Procedures" },
  "dash.recentDocuments": { pt: "Documentos Recentes", en: "Recent Documents" },
  "dash.instHighlights": { pt: "Institucional", en: "Institutional" },
  "dash.viewAll": { pt: "Ver todos", en: "View all" },
  "dash.noBirthdays": { pt: "Nenhum aniversariante próximo", en: "No upcoming birthdays" },
  "dash.overview": { pt: "Visão Geral", en: "Overview" },
  "dash.adminPanel": { pt: "Painel Administrativo", en: "Admin Panel" },

  // Pagination
  "pagination.prev": { pt: "Anterior", en: "Previous" },
  "pagination.next": { pt: "Próxima", en: "Next" },
  "pagination.records": { pt: "registro(s)", en: "record(s)" },

  // Footer
  "footer.text": { pt: "Desenvolvido por ICT Team", en: "Developed by ICT Team" },

  // Login
  "login.title": { pt: "Entrar", en: "Sign In" },
  "login.subtitle": { pt: "Acesse o portal corporativo com suas credenciais.", en: "Access the corporate portal with your credentials." },
  "login.email": { pt: "E-mail", en: "Email" },
  "login.password": { pt: "Senha", en: "Password" },
  "login.submit": { pt: "Entrar", en: "Sign In" },
  "login.loading": { pt: "Entrando...", en: "Signing in..." },
  "login.error": { pt: "Credenciais inválidas.", en: "Invalid credentials." },
  "login.heroTitle": { pt: "Seu portal de informações e serviços internos.", en: "Your internal information and services portal." },
  "login.heroDesc": { pt: "Acesse notícias, documentos, procedimentos e serviços da organização em um só lugar.", en: "Access news, documents, procedures and organizational services in one place." },
  "login.demoTitle": { pt: "Credenciais de demonstração", en: "Demo credentials" },
  "login.logout": { pt: "Sair", en: "Sign Out" },

  // CRUD
  "crud.create": { pt: "Criar", en: "Create" },
  "crud.edit": { pt: "Editar", en: "Edit" },
  "crud.delete": { pt: "Excluir", en: "Delete" },
  "crud.save": { pt: "Salvar", en: "Save" },
  "crud.cancel": { pt: "Cancelar", en: "Cancel" },
  "crud.publish": { pt: "Publicar", en: "Publish" },
  "crud.archive": { pt: "Arquivar", en: "Archive" },
  "crud.confirm": { pt: "Confirmar", en: "Confirm" },
  "crud.confirmDelete": { pt: "Tem certeza que deseja excluir?", en: "Are you sure you want to delete?" },
  "crud.confirmDeleteDesc": { pt: "Esta ação não pode ser desfeita. O item será permanentemente removido.", en: "This action cannot be undone. The item will be permanently removed." },
  "crud.confirmPublish": { pt: "Confirmar publicação?", en: "Confirm publication?" },
  "crud.confirmPublishDesc": { pt: "O conteúdo ficará visível para todos os colaboradores autorizados.", en: "The content will be visible to all authorized employees." },
  "crud.confirmArchive": { pt: "Confirmar arquivamento?", en: "Confirm archiving?" },
  "crud.confirmArchiveDesc": { pt: "O conteúdo será removido das listagens ativas mas poderá ser restaurado.", en: "The content will be removed from active listings but can be restored." },
  "crud.confirmStatusChange": { pt: "Confirmar alteração de status?", en: "Confirm status change?" },
  "crud.confirmStatusChangeDesc": { pt: "O status do colaborador será alterado.", en: "The employee status will be changed." },
  "crud.status": { pt: "Status", en: "Status" },
  "crud.actions": { pt: "Ações", en: "Actions" },
  "crud.noResults": { pt: "Nenhum resultado encontrado.", en: "No results found." },
  "crud.noResultsDesc": { pt: "Tente ajustar os filtros ou criar um novo item.", en: "Try adjusting filters or creating a new item." },
  "crud.savePublish": { pt: "Salvar e Publicar", en: "Save & Publish" },
  "crud.saving": { pt: "Salvando...", en: "Saving..." },

  // Toast messages
  "toast.saved": { pt: "Salvo com sucesso", en: "Saved successfully" },
  "toast.published": { pt: "Publicado com sucesso", en: "Published successfully" },
  "toast.archived": { pt: "Arquivado com sucesso", en: "Archived successfully" },
  "toast.deleted": { pt: "Excluído com sucesso", en: "Deleted successfully" },
  "toast.error": { pt: "Ocorreu um erro. Tente novamente.", en: "An error occurred. Please try again." },
  "toast.updated": { pt: "Atualizado com sucesso", en: "Updated successfully" },
  "toast.created": { pt: "Criado com sucesso", en: "Created successfully" },
  "toast.activated": { pt: "Ativado com sucesso", en: "Activated successfully" },
  "toast.deactivated": { pt: "Desativado com sucesso", en: "Deactivated successfully" },
  "toast.reviewSent": { pt: "Enviado para revisão", en: "Sent to review" },
  "toast.permissionDenied": { pt: "Sem permissão para esta ação", en: "Permission denied for this action" },

  // Common labels
  "common.all": { pt: "Todos", en: "All" },
  "common.allFemale": { pt: "Todas", en: "All" },
  "common.language": { pt: "Idioma", en: "Language" },
  "common.category": { pt: "Categoria", en: "Category" },
  "common.department": { pt: "Departamento", en: "Department" },
  "common.visibility": { pt: "Visibilidade", en: "Visibility" },
  "common.public": { pt: "Público", en: "Public" },
  "common.restricted": { pt: "Restrito", en: "Restricted" },
  "common.title": { pt: "Título", en: "Title" },
  "common.description": { pt: "Descrição", en: "Description" },
  "common.summary": { pt: "Resumo", en: "Summary" },
  "common.content": { pt: "Conteúdo", en: "Content" },
  "common.tags": { pt: "Tags", en: "Tags" },
  "common.tagsHint": { pt: "Separadas por vírgula", en: "Comma-separated" },
  "common.responsible": { pt: "Responsável", en: "Responsible" },
  "common.author": { pt: "Autor", en: "Author" },
  "common.featured": { pt: "Destaque", en: "Featured" },
  "common.publishDate": { pt: "Data de publicação", en: "Publish date" },
  "common.expiryDate": { pt: "Data de expiração", en: "Expiry date" },
  "common.effectiveDate": { pt: "Data de vigência", en: "Effective date" },
  "common.select": { pt: "Selecionar", en: "Select" },
  "common.search": { pt: "Buscar...", en: "Search..." },
  "common.fileUpload": { pt: "Arraste arquivos aqui ou clique para anexar", en: "Drag files here or click to attach" },
  "common.fileHint": { pt: "PDF, DOCX, XLSX, PPTX (max 10MB)", en: "PDF, DOCX, XLSX, PPTX (max 10MB)" },
  "common.accessRestricted": { pt: "Acesso Restrito", en: "Access Restricted" },
  "common.noPermission": { pt: "Você não tem permissão para acessar esta página.", en: "You don't have permission to access this page." },
};

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("pt");

  const t = (key: string): string => {
    return translations[key]?.[lang] ?? key;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
