import {
  ClipboardCheck, UserCheck, ShoppingCart, Users, Calculator,
  Briefcase, Scroll, Wrench, Send, DollarSign, Settings,
  Monitor, HardDrive, Utensils, Building, UserPlus, Package,
  type LucideIcon,
} from "lucide-react";

export interface Department {
  icon: LucideIcon;
  label: string;
  slug: string;
  description: string;
  responsavel: string;
  email: string;
  ramal: string;
  horario: string;
  servicos: string[];
}

export const departments: Department[] = [
  { icon: ClipboardCheck, label: "Auditoria Interna", slug: "auditoria-interna", description: "Responsável pela avaliação independente dos processos internos, assegurando conformidade e eficiência operacional.", responsavel: "Carlos Mendes", email: "auditoria@empresa.com", ramal: "2001", horario: "08h–17h", servicos: ["Auditoria de processos", "Análise de conformidade", "Relatórios de riscos", "Consultoria interna"] },
  { icon: UserCheck, label: "Admissões", slug: "admissoes", description: "Gerencia todo o processo de admissão de novos colaboradores, desde a documentação até a integração.", responsavel: "Fernanda Lima", email: "admissoes@empresa.com", ramal: "2002", horario: "08h–17h", servicos: ["Processo admissional", "Documentação", "Exames admissionais", "Integração de novos colaboradores"] },
  { icon: ShoppingCart, label: "Compras", slug: "compras", description: "Responsável pela aquisição de materiais, equipamentos e serviços necessários para a operação.", responsavel: "Roberto Silva", email: "compras@empresa.com", ramal: "2003", horario: "08h–17h", servicos: ["Cotações", "Emissão de pedidos", "Gestão de fornecedores", "Controle de estoque"] },
  { icon: Users, label: "Contratos", slug: "contratos", description: "Gestão e administração de contratos com fornecedores, parceiros e prestadores de serviço.", responsavel: "Juliana Costa", email: "contratos@empresa.com", ramal: "2004", horario: "08h–17h", servicos: ["Elaboração de contratos", "Renovações", "Aditivos contratuais", "Gestão de SLAs"] },
  { icon: Calculator, label: "Contabilidade", slug: "contabilidade", description: "Controle e registro de todas as operações financeiras e contábeis da organização.", responsavel: "Marcos Oliveira", email: "contabilidade@empresa.com", ramal: "2005", horario: "08h–17h", servicos: ["Balanço patrimonial", "DRE", "Obrigações fiscais", "Conciliação bancária"] },
  { icon: Briefcase, label: "Departamento Pessoal", slug: "departamento-pessoal", description: "Administração de folha de pagamento, benefícios e obrigações trabalhistas.", responsavel: "Ana Paula Santos", email: "dp@empresa.com", ramal: "2006", horario: "08h–17h", servicos: ["Folha de pagamento", "Férias e 13º", "Benefícios", "Rescisões"] },
  { icon: Scroll, label: "Cartório", slug: "cartorio", description: "Responsável pela gestão documental, autenticações e registros oficiais.", responsavel: "Lucia Ferreira", email: "cartorio@empresa.com", ramal: "2007", horario: "08h–17h", servicos: ["Autenticação de documentos", "Registro de atas", "Arquivo documental", "Certificações"] },
  { icon: Wrench, label: "Trabalho", slug: "trabalho", description: "Gestão de segurança do trabalho, normas regulamentadoras e saúde ocupacional.", responsavel: "Eduardo Martins", email: "trabalho@empresa.com", ramal: "2008", horario: "08h–17h", servicos: ["Segurança do trabalho", "PPRA/PCMSO", "Treinamentos NR", "EPIs"] },
  { icon: Send, label: "Expedição", slug: "expedicao", description: "Controle de envio e recebimento de correspondências, materiais e encomendas.", responsavel: "José Almeida", email: "expedicao@empresa.com", ramal: "2009", horario: "08h–17h", servicos: ["Envio de correspondências", "Recebimento de materiais", "Logística interna", "Malote"] },
  { icon: DollarSign, label: "Financeiro", slug: "financeiro", description: "Gestão de contas a pagar, contas a receber, fluxo de caixa e planejamento financeiro.", responsavel: "Patricia Rocha", email: "financeiro@empresa.com", ramal: "2010", horario: "08h–17h", servicos: ["Contas a pagar", "Contas a receber", "Fluxo de caixa", "Orçamento anual"] },
  { icon: Settings, label: "Gestão", slug: "gestao", description: "Coordenação estratégica e operacional das atividades administrativas.", responsavel: "Ricardo Gomes", email: "gestao@empresa.com", ramal: "2011", horario: "08h–17h", servicos: ["Planejamento estratégico", "Gestão de projetos", "Indicadores de desempenho", "Melhoria contínua"] },
  { icon: Monitor, label: "TI-ADM", slug: "ti-adm", description: "Suporte e infraestrutura de tecnologia para os setores administrativos.", responsavel: "Diego Nascimento", email: "ti-adm@empresa.com", ramal: "2012", horario: "08h–17h", servicos: ["Suporte técnico", "Infraestrutura de rede", "Sistemas administrativos", "Segurança da informação"] },
  { icon: HardDrive, label: "TI-Educacional", slug: "ti-educacional", description: "Suporte tecnológico para ambientes educacionais e plataformas de ensino.", responsavel: "Camila Duarte", email: "ti-edu@empresa.com", ramal: "2013", horario: "08h–17h", servicos: ["Plataformas de ensino", "Laboratórios de informática", "Suporte a professores", "AVA"] },
  { icon: Package, label: "Manutenção", slug: "manutencao", description: "Manutenção preventiva e corretiva de instalações, equipamentos e infraestrutura.", responsavel: "Antônio Pereira", email: "manutencao@empresa.com", ramal: "2014", horario: "07h–17h", servicos: ["Manutenção predial", "Manutenção elétrica", "Manutenção hidráulica", "Ordens de serviço"] },
  { icon: Utensils, label: "Nutrição", slug: "nutricao", description: "Planejamento e gestão dos serviços de alimentação e nutrição.", responsavel: "Mariana Souza", email: "nutricao@empresa.com", ramal: "2015", horario: "06h–16h", servicos: ["Cardápio semanal", "Controle de qualidade", "Dietas especiais", "Gestão do refeitório"] },
  { icon: Building, label: "Portaria", slug: "portaria", description: "Controle de acesso, segurança patrimonial e recepção de visitantes.", responsavel: "Sérgio Barbosa", email: "portaria@empresa.com", ramal: "2016", horario: "24h", servicos: ["Controle de acesso", "Recepção de visitantes", "Monitoramento CFTV", "Ronda patrimonial"] },
  { icon: UserPlus, label: "Recursos Humanos", slug: "recursos-humanos", description: "Desenvolvimento organizacional, recrutamento, seleção e gestão de pessoas.", responsavel: "Beatriz Cardoso", email: "rh@empresa.com", ramal: "2017", horario: "08h–17h", servicos: ["Recrutamento e seleção", "Treinamento e desenvolvimento", "Avaliação de desempenho", "Clima organizacional"] },
  { icon: Package, label: "Serviços Gerais", slug: "servicos-gerais", description: "Coordenação dos serviços de limpeza, conservação e apoio operacional.", responsavel: "Maria das Graças", email: "servicos@empresa.com", ramal: "2018", horario: "06h–22h", servicos: ["Limpeza e conservação", "Jardinagem", "Controle de pragas", "Apoio a eventos"] },
];
