
-- ─── Enums ───────────────────────────────────────────────────────────────────
CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'editor', 'employee');
CREATE TYPE public.user_status AS ENUM ('active', 'inactive', 'suspended');
CREATE TYPE public.content_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE public.procedure_status AS ENUM ('vigente', 'em_revisao', 'obsoleto');
CREATE TYPE public.visibility_type AS ENUM ('public', 'department', 'restricted');
CREATE TYPE public.news_category AS ENUM ('aviso', 'evento', 'comunicado', 'campanha');
CREATE TYPE public.document_category AS ENUM ('manual', 'formulario', 'politica', 'procedimento', 'template');

-- ─── Timestamp trigger function ──────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ─── Departments ─────────────────────────────────────────────────────────────
CREATE TABLE public.departments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  description TEXT DEFAULT '',
  responsavel TEXT DEFAULT '',
  email TEXT DEFAULT '',
  ramal TEXT DEFAULT '',
  horario TEXT DEFAULT '',
  servicos TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Departments readable by authenticated" ON public.departments FOR SELECT TO authenticated USING (true);
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON public.departments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ─── Profiles ────────────────────────────────────────────────────────────────
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  employee_id TEXT NOT NULL,
  department_id UUID REFERENCES public.departments(id),
  department TEXT NOT NULL DEFAULT '',
  department_slug TEXT NOT NULL DEFAULT '',
  position TEXT NOT NULL DEFAULT '',
  status public.user_status NOT NULL DEFAULT 'active',
  preferred_language TEXT NOT NULL DEFAULT 'pt',
  avatar_url TEXT,
  phone TEXT,
  birthday TEXT,
  joined_at DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ─── User Roles ──────────────────────────────────────────────────────────────
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ─── Security definer functions for role checks ─────────────────────────────
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.has_any_role(_user_id UUID, _roles public.app_role[])
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = ANY(_roles))
$$;

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS public.app_role
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1
$$;

-- ─── RLS for profiles ────────────────────────────────────────────────────────
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can insert profiles" ON public.profiles FOR INSERT TO authenticated WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin'::public.app_role]));
CREATE POLICY "Admins can delete profiles" ON public.profiles FOR DELETE TO authenticated USING (public.has_any_role(auth.uid(), ARRAY['admin'::public.app_role]));

-- ─── RLS for user_roles ──────────────────────────────────────────────────────
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update roles" ON public.user_roles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete roles" ON public.user_roles FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ─── News ────────────────────────────────────────────────────────────────────
CREATE TABLE public.news (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  category public.news_category NOT NULL DEFAULT 'comunicado',
  author TEXT NOT NULL DEFAULT '',
  published_at TIMESTAMPTZ,
  cover_image TEXT,
  pinned BOOLEAN NOT NULL DEFAULT false,
  status public.content_status NOT NULL DEFAULT 'draft',
  visibility public.visibility_type NOT NULL DEFAULT 'public',
  department_access TEXT[] DEFAULT '{}',
  language TEXT NOT NULL DEFAULT 'pt',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published news readable by all authenticated" ON public.news FOR SELECT TO authenticated USING (
  status = 'published' OR created_by = auth.uid()
  OR public.has_any_role(auth.uid(), ARRAY['admin'::public.app_role, 'manager'::public.app_role, 'editor'::public.app_role])
);
CREATE POLICY "Editors+ can create news" ON public.news FOR INSERT TO authenticated WITH CHECK (
  public.has_any_role(auth.uid(), ARRAY['admin'::public.app_role, 'manager'::public.app_role, 'editor'::public.app_role])
);
CREATE POLICY "Editors+ can update news" ON public.news FOR UPDATE TO authenticated USING (
  created_by = auth.uid() OR public.has_any_role(auth.uid(), ARRAY['admin'::public.app_role, 'manager'::public.app_role])
);
CREATE POLICY "Admins can delete news" ON public.news FOR DELETE TO authenticated USING (public.has_any_role(auth.uid(), ARRAY['admin'::public.app_role]));
CREATE TRIGGER update_news_updated_at BEFORE UPDATE ON public.news FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ─── Documents ───────────────────────────────────────────────────────────────
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category public.document_category NOT NULL DEFAULT 'manual',
  department_slug TEXT,
  file_name TEXT,
  file_type TEXT,
  file_size BIGINT,
  file_size_formatted TEXT,
  file_url TEXT,
  version TEXT NOT NULL DEFAULT '1.0',
  status public.content_status NOT NULL DEFAULT 'draft',
  visibility public.visibility_type NOT NULL DEFAULT 'public',
  department_access TEXT[] DEFAULT '{}',
  language TEXT NOT NULL DEFAULT 'pt',
  author TEXT NOT NULL DEFAULT '',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published docs readable by authenticated" ON public.documents FOR SELECT TO authenticated USING (
  status = 'published' OR created_by = auth.uid()
  OR public.has_any_role(auth.uid(), ARRAY['admin'::public.app_role, 'manager'::public.app_role, 'editor'::public.app_role])
);
CREATE POLICY "Editors+ can create docs" ON public.documents FOR INSERT TO authenticated WITH CHECK (
  public.has_any_role(auth.uid(), ARRAY['admin'::public.app_role, 'manager'::public.app_role, 'editor'::public.app_role])
);
CREATE POLICY "Editors+ can update docs" ON public.documents FOR UPDATE TO authenticated USING (
  created_by = auth.uid() OR public.has_any_role(auth.uid(), ARRAY['admin'::public.app_role, 'manager'::public.app_role])
);
CREATE POLICY "Admins can delete docs" ON public.documents FOR DELETE TO authenticated USING (public.has_any_role(auth.uid(), ARRAY['admin'::public.app_role]));
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ─── Procedures ──────────────────────────────────────────────────────────────
CREATE TABLE public.procedures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  department_slug TEXT NOT NULL DEFAULT '',
  version TEXT NOT NULL DEFAULT '1.0',
  status public.procedure_status NOT NULL DEFAULT 'vigente',
  content_status public.content_status NOT NULL DEFAULT 'draft',
  effective_date DATE,
  author TEXT NOT NULL DEFAULT '',
  visibility public.visibility_type NOT NULL DEFAULT 'public',
  department_access TEXT[] DEFAULT '{}',
  language TEXT NOT NULL DEFAULT 'pt',
  history JSONB DEFAULT '[]',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.procedures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published procedures readable by authenticated" ON public.procedures FOR SELECT TO authenticated USING (
  content_status = 'published' OR created_by = auth.uid()
  OR public.has_any_role(auth.uid(), ARRAY['admin'::public.app_role, 'manager'::public.app_role, 'editor'::public.app_role])
);
CREATE POLICY "Editors+ can create procedures" ON public.procedures FOR INSERT TO authenticated WITH CHECK (
  public.has_any_role(auth.uid(), ARRAY['admin'::public.app_role, 'manager'::public.app_role, 'editor'::public.app_role])
);
CREATE POLICY "Editors+ can update procedures" ON public.procedures FOR UPDATE TO authenticated USING (
  created_by = auth.uid() OR public.has_any_role(auth.uid(), ARRAY['admin'::public.app_role, 'manager'::public.app_role])
);
CREATE POLICY "Admins can delete procedures" ON public.procedures FOR DELETE TO authenticated USING (public.has_any_role(auth.uid(), ARRAY['admin'::public.app_role]));
CREATE TRIGGER update_procedures_updated_at BEFORE UPDATE ON public.procedures FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ─── File Attachments ────────────────────────────────────────────────────────
CREATE TABLE public.file_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  size BIGINT NOT NULL DEFAULT 0,
  size_formatted TEXT NOT NULL DEFAULT '0 KB',
  url TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'pt',
  uploaded_by UUID REFERENCES auth.users(id),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.file_attachments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Attachments readable by authenticated" ON public.file_attachments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Editors+ can create attachments" ON public.file_attachments FOR INSERT TO authenticated WITH CHECK (
  public.has_any_role(auth.uid(), ARRAY['admin'::public.app_role, 'manager'::public.app_role, 'editor'::public.app_role])
);
CREATE POLICY "Admins can delete attachments" ON public.file_attachments FOR DELETE TO authenticated USING (public.has_any_role(auth.uid(), ARRAY['admin'::public.app_role]));
CREATE INDEX idx_file_attachments_entity ON public.file_attachments (entity_type, entity_id);

-- ─── Audit Logs ──────────────────────────────────────────────────────────────
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  resource_id TEXT,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can read audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (
  public.has_any_role(auth.uid(), ARRAY['admin'::public.app_role, 'manager'::public.app_role])
);
CREATE POLICY "Authenticated can insert audit logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_audit_logs_resource ON public.audit_logs (resource, resource_id);
CREATE INDEX idx_audit_logs_user ON public.audit_logs (user_id);

-- ─── Storage Buckets ─────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public) VALUES ('attachments', 'attachments', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

CREATE POLICY "Anyone can view attachments" ON storage.objects FOR SELECT USING (bucket_id = 'attachments');
CREATE POLICY "Editors+ can upload attachments" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'attachments' AND public.has_any_role(auth.uid(), ARRAY['admin'::public.app_role, 'manager'::public.app_role, 'editor'::public.app_role])
);
CREATE POLICY "Admins can delete attachments" ON storage.objects FOR DELETE USING (
  bucket_id = 'attachments' AND public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "Anyone can view avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload own avatar" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Users can update own avatar" ON storage.objects FOR UPDATE USING (
  bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ─── Seed: Departments ───────────────────────────────────────────────────────
INSERT INTO public.departments (slug, label, description, responsavel, email, ramal, horario, servicos) VALUES
  ('gestao', 'Gestão', 'Direção administrativa e planejamento estratégico', 'Ricardo Gomes', 'gestao@empresa.com', '2011', '08:00-17:00', ARRAY['Planejamento Estratégico', 'Gestão de Processos']),
  ('recursos-humanos', 'Recursos Humanos', 'Gestão de pessoas, recrutamento e desenvolvimento', 'Beatriz Cardoso', 'rh@empresa.com', '2017', '08:00-17:00', ARRAY['Recrutamento', 'Treinamento', 'Benefícios']),
  ('ti-adm', 'TI-ADM', 'Tecnologia da informação e infraestrutura', 'Diego Nascimento', 'ti@empresa.com', '2012', '08:00-17:00', ARRAY['Suporte Técnico', 'Infraestrutura', 'Segurança']),
  ('contratos', 'Contratos', 'Gestão de contratos e licitações', 'Juliana Costa', 'contratos@empresa.com', '2004', '08:00-17:00', ARRAY['Elaboração de Contratos', 'Licitações']),
  ('auditoria-interna', 'Auditoria Interna', 'Auditoria e controle interno', 'Carlos Mendes', 'auditoria@empresa.com', '2015', '08:00-17:00', ARRAY['Auditoria Operacional', 'Compliance']),
  ('admissoes', 'Admissões', 'Processos admissionais e integração', 'Fernanda Lima', 'admissoes@empresa.com', '2020', '08:00-17:00', ARRAY['Admissão', 'Integração']),
  ('compras', 'Compras', 'Aquisições e gestão de fornecedores', 'Roberto Silva', 'compras@empresa.com', '2018', '08:00-17:00', ARRAY['Cotações', 'Fornecedores']),
  ('departamento-pessoal', 'Departamento Pessoal', 'Folha de pagamento e obrigações trabalhistas', 'Ana Paula Santos', 'dp@empresa.com', '2016', '08:00-17:00', ARRAY['Folha de Pagamento', 'Férias', 'Rescisões']),
  ('financeiro', 'Financeiro', 'Gestão financeira e contábil', 'Patricia Rocha', 'financeiro@empresa.com', '2019', '08:00-17:00', ARRAY['Contas a Pagar', 'Contas a Receber']),
  ('ti-educacional', 'TI-Educacional', 'Tecnologia voltada ao ensino', 'Camila Duarte', 'ti-edu@empresa.com', '2022', '08:00-17:00', ARRAY['Plataformas Educacionais', 'Suporte']),
  ('contabilidade', 'Contabilidade', 'Escrituração contábil e demonstrações', 'Marcos Oliveira', 'contabilidade@empresa.com', '2013', '08:00-17:00', ARRAY['Escrituração', 'Balancetes']),
  ('nutricao', 'Nutrição', 'Alimentação e nutrição institucional', 'Mariana Souza', 'nutricao@empresa.com', '2021', '08:00-17:00', ARRAY['Cardápio', 'Controle Nutricional']);

-- ─── Seed: News ──────────────────────────────────────────────────────────────
INSERT INTO public.news (title, excerpt, content, category, author, published_at, pinned, status, visibility, department_access, language) VALUES
  ('Nova Política de Trabalho Remoto', 'A partir de março, todos os colaboradores elegíveis poderão adotar o modelo híbrido de trabalho.', 'A partir de março de 2026, a empresa implementará oficialmente o modelo de trabalho híbrido...', 'comunicado', 'Recursos Humanos', now() - interval '1 day', true, 'published', 'public', '{}', 'pt'),
  ('Semana de Segurança do Trabalho 2026', 'Programação especial com palestras, treinamentos e atividades práticas sobre segurança ocupacional.', 'Durante a semana de 21 a 25 de abril, teremos uma programação especial...', 'evento', 'CIPA', now() - interval '3 days', false, 'published', 'public', '{}', 'pt'),
  ('Campanha de Vacinação Interna', 'Vacinação contra gripe disponível para todos os colaboradores no ambulatório da empresa.', 'O ambulatório estará disponível para vacinação contra gripe de 14 a 18 de abril...', 'campanha', 'Saúde Ocupacional', now() - interval '5 days', false, 'published', 'public', '{}', 'pt'),
  ('Atualização do Sistema de Ponto Eletrônico', 'Novo sistema de registro de ponto será implantado a partir da próxima semana.', 'Informamos que o sistema de ponto eletrônico será atualizado...', 'aviso', 'TI-ADM', now() - interval '7 days', false, 'published', 'public', '{}', 'pt'),
  ('Resultado da Pesquisa de Clima 2025', 'Confira os resultados da pesquisa de clima organizacional e os planos de ação definidos.', 'Os resultados da pesquisa de clima organizacional mostram uma evolução positiva...', 'comunicado', 'Gestão de Pessoas', now() - interval '9 days', false, 'published', 'public', '{}', 'pt'),
  ('Feira de Talentos Internos', 'Inscreva-se para apresentar seus projetos e habilidades na feira de talentos da empresa.', 'A feira de talentos internos acontecerá no dia 30 de abril...', 'evento', 'Recursos Humanos', now() - interval '11 days', false, 'published', 'public', '{}', 'pt'),
  ('Rascunho: Novas Diretrizes de Viagem', 'Novas regras para viagens corporativas a partir de julho.', 'As novas diretrizes de viagem corporativa incluem...', 'comunicado', 'Financeiro', null, false, 'draft', 'department', ARRAY['financeiro'], 'pt');

-- ─── Seed: Documents ─────────────────────────────────────────────────────────
INSERT INTO public.documents (title, description, category, file_name, file_type, file_size, file_size_formatted, version, status, visibility, language, author) VALUES
  ('Manual do Colaborador', 'Guia completo com normas, direitos e deveres dos colaboradores.', 'manual', 'Manual_Colaborador_v3.1.pdf', 'pdf', 2516582, '2.4 MB', '3.1', 'published', 'public', 'pt', 'RH'),
  ('Política de Segurança da Informação', 'Diretrizes para uso seguro de sistemas e proteção de dados.', 'politica', 'PSI_v2.0.pdf', 'pdf', 1887436, '1.8 MB', '2.0', 'published', 'public', 'pt', 'TI-ADM'),
  ('Formulário de Solicitação de Férias', 'Formulário padrão para solicitação e aprovação de férias.', 'formulario', 'Ferias_Form_v1.2.docx', 'docx', 46080, '45 KB', '1.2', 'published', 'public', 'pt', 'DP'),
  ('Procedimento de Compras', 'Fluxo completo para solicitação e aprovação de compras.', 'procedimento', 'Proc_Compras_v4.0.pdf', 'pdf', 911360, '890 KB', '4.0', 'published', 'public', 'pt', 'Compras'),
  ('Template de Apresentação Institucional', 'Modelo padrão para apresentações corporativas.', 'template', 'Template_Institucional_v2.1.pptx', 'pptx', 5452595, '5.2 MB', '2.1', 'published', 'public', 'pt', 'Marketing'),
  ('Política de Privacidade (LGPD)', 'Política de proteção de dados pessoais conforme LGPD.', 'politica', 'LGPD_Policy_v1.5.pdf', 'pdf', 1258291, '1.2 MB', '1.5', 'published', 'public', 'pt', 'Jurídico');

-- ─── Seed: Procedures ────────────────────────────────────────────────────────
INSERT INTO public.procedures (code, title, description, department_slug, version, status, content_status, effective_date, author, visibility, language, history) VALUES
  ('PRC-001', 'Processo de Admissão de Colaboradores', 'Descreve o fluxo completo desde a aprovação da vaga até a integração do novo colaborador.', 'admissoes', '3.0', 'vigente', 'published', '2025-01-15', 'Fernanda Lima', 'public', 'pt', '[{"version":"3.0","date":"2025-12-20","author":"Fernanda Lima","changes":"Atualização do fluxo de documentação digital"},{"version":"2.1","date":"2024-06-10","author":"Fernanda Lima","changes":"Inclusão de etapa de onboarding digital"}]'),
  ('PRC-002', 'Procedimento de Compras Diretas', 'Define os critérios e fluxo para compras de baixo valor sem necessidade de licitação.', 'compras', '4.1', 'vigente', 'published', '2025-03-01', 'Roberto Silva', 'public', 'pt', '[{"version":"4.1","date":"2026-02-15","author":"Roberto Silva","changes":"Atualização dos limites de valor"}]'),
  ('PRC-003', 'Gestão de Incidentes de Segurança da Informação', 'Procedimento para identificação, classificação e resposta a incidentes de segurança.', 'ti-adm', '2.0', 'vigente', 'published', '2025-06-01', 'Diego Nascimento', 'public', 'pt', '[{"version":"2.0","date":"2025-11-10","author":"Diego Nascimento","changes":"Inclusão de resposta a ransomware"}]'),
  ('PRC-004', 'Processo de Desligamento', 'Fluxo completo para desligamento voluntário e involuntário de colaboradores.', 'departamento-pessoal', '2.2', 'em_revisao', 'published', '2024-08-01', 'Ana Paula Santos', 'public', 'pt', '[{"version":"2.2","date":"2026-03-01","author":"Ana Paula Santos","changes":"Em revisão para adequação à nova legislação"}]');

-- ─── Auto-create profile on signup ───────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email, employee_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'EMP-' || LPAD(FLOOR(RANDOM() * 9999)::TEXT, 4, '0')
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'employee');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
