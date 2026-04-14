
-- Add new columns to documents table
ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS responsible_user text DEFAULT ''::text,
  ADD COLUMN IF NOT EXISTS effective_date date,
  ADD COLUMN IF NOT EXISTS expiry_date date,
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS history jsonb DEFAULT '[]'::jsonb;

-- Generate slugs for existing rows
UPDATE public.documents SET slug = id::text WHERE slug IS NULL;

-- Make slug unique and not null
ALTER TABLE public.documents ALTER COLUMN slug SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_documents_slug ON public.documents (slug);

-- Performance indices
CREATE INDEX IF NOT EXISTS idx_documents_category ON public.documents (category);
CREATE INDEX IF NOT EXISTS idx_documents_status ON public.documents (status);
CREATE INDEX IF NOT EXISTS idx_documents_is_featured ON public.documents (is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_documents_tags ON public.documents USING GIN (tags);

-- Seed realistic documents
INSERT INTO public.documents (title, slug, description, category, status, visibility, language, author, version, department_slug, tags, responsible_user, effective_date, is_featured, file_name, file_type, file_size, file_size_formatted, file_url, history) VALUES
  ('Manual do Colaborador', 'manual-do-colaborador', 'Guia completo de políticas, benefícios e cultura organizacional para todos os colaboradores.', 'manual', 'published', 'public', 'pt', 'Recursos Humanos', '3.2', 'rh', '{"onboarding","benefícios","cultura"}', 'Maria Santos', '2025-01-15', true, 'manual-colaborador-v3.2.pdf', 'pdf', 2457600, '2.3 MB', '#', '[{"version":"3.2","date":"2025-01-15","author":"Maria Santos","changes":"Atualização de benefícios 2025"},{"version":"3.1","date":"2024-07-01","author":"Maria Santos","changes":"Revisão anual"},{"version":"3.0","date":"2024-01-10","author":"Ana Costa","changes":"Reestruturação completa"}]'::jsonb),

  ('Employee Handbook', 'employee-handbook', 'Complete guide to organizational policies, benefits, and culture for all employees.', 'manual', 'published', 'public', 'en', 'Human Resources', '3.2', 'rh', '{"onboarding","benefits","culture"}', 'Maria Santos', '2025-01-15', false, 'employee-handbook-v3.2.pdf', 'pdf', 2350080, '2.2 MB', '#', '[{"version":"3.2","date":"2025-01-15","author":"Maria Santos","changes":"2025 benefits update"}]'::jsonb),

  ('Política de Segurança da Informação', 'politica-seguranca-informacao', 'Diretrizes e normas para proteção de dados, acesso a sistemas e uso de recursos de TI.', 'politica', 'published', 'public', 'pt', 'TI / Infraestrutura', '2.1', 'ti', '{"segurança","LGPD","dados","compliance"}', 'Carlos Oliveira', '2025-03-01', true, 'politica-si-v2.1.pdf', 'pdf', 1048576, '1.0 MB', '#', '[{"version":"2.1","date":"2025-03-01","author":"Carlos Oliveira","changes":"Adequação LGPD 2025"},{"version":"2.0","date":"2024-06-15","author":"Carlos Oliveira","changes":"Revisão geral"}]'::jsonb),

  ('Formulário de Solicitação de Férias', 'formulario-solicitacao-ferias', 'Modelo padrão para solicitação e aprovação de período de férias.', 'formulario', 'published', 'public', 'pt', 'Recursos Humanos', '1.4', 'rh', '{"férias","RH","solicitação"}', 'Ana Costa', '2024-11-01', false, 'form-ferias-v1.4.xlsx', 'xlsx', 52428, '51 KB', '#', '[{"version":"1.4","date":"2024-11-01","author":"Ana Costa","changes":"Campo de aprovação digital"}]'::jsonb),

  ('Vacation Request Form', 'vacation-request-form', 'Standard form for requesting and approving vacation periods.', 'formulario', 'published', 'public', 'en', 'Human Resources', '1.4', 'rh', '{"vacation","HR","request"}', 'Ana Costa', '2024-11-01', false, 'vacation-form-v1.4.xlsx', 'xlsx', 51200, '50 KB', '#', '[]'::jsonb),

  ('Modelo de Apresentação Institucional', 'template-apresentacao-institucional', 'Template padrão para apresentações corporativas com identidade visual atualizada.', 'template', 'published', 'public', 'pt', 'Marketing', '2.0', 'marketing', '{"apresentação","template","marca"}', 'Juliana Lima', '2025-02-01', true, 'template-institucional-v2.0.pptx', 'pptx', 5242880, '5.0 MB', '#', '[{"version":"2.0","date":"2025-02-01","author":"Juliana Lima","changes":"Nova identidade visual 2025"}]'::jsonb),

  ('Política de Viagens Corporativas', 'politica-viagens-corporativas', 'Normas e procedimentos para solicitação e reembolso de viagens a trabalho.', 'politica', 'published', 'public', 'pt', 'Financeiro', '1.3', 'financeiro', '{"viagens","reembolso","despesas"}', 'Roberto Mendes', '2024-08-15', false, 'politica-viagens-v1.3.pdf', 'pdf', 819200, '800 KB', '#', '[{"version":"1.3","date":"2024-08-15","author":"Roberto Mendes","changes":"Novos limites de reembolso"}]'::jsonb),

  ('Manual de Integração de Novos Sistemas', 'manual-integracao-sistemas', 'Guia técnico para integração de novos sistemas e APIs ao ambiente corporativo.', 'manual', 'published', 'department', 'pt', 'TI / Infraestrutura', '1.1', 'ti', '{"integração","API","sistemas","técnico"}', 'Felipe Rodrigues', '2025-04-01', false, 'manual-integracao-v1.1.pdf', 'pdf', 3145728, '3.0 MB', '#', '[{"version":"1.1","date":"2025-04-01","author":"Felipe Rodrigues","changes":"Novos endpoints v2"}]'::jsonb),

  ('Formulário de Avaliação de Desempenho', 'formulario-avaliacao-desempenho', 'Modelo para avaliação semestral de desempenho dos colaboradores.', 'formulario', 'published', 'public', 'pt', 'Recursos Humanos', '2.0', 'rh', '{"avaliação","desempenho","RH"}', 'Maria Santos', '2025-01-01', false, 'form-avaliacao-v2.0.docx', 'docx', 204800, '200 KB', '#', '[{"version":"2.0","date":"2025-01-01","author":"Maria Santos","changes":"Novo formato com OKRs"}]'::jsonb),

  ('Política de Home Office', 'politica-home-office', 'Regras, elegibilidade e procedimentos para trabalho remoto.', 'politica', 'published', 'public', 'pt', 'Recursos Humanos', '1.2', 'rh', '{"home office","remoto","flexibilidade"}', 'Ana Costa', '2024-09-01', true, 'politica-homeoffice-v1.2.pdf', 'pdf', 614400, '600 KB', '#', '[{"version":"1.2","date":"2024-09-01","author":"Ana Costa","changes":"Atualização frequência presencial"}]'::jsonb),

  ('Checklist de Onboarding', 'checklist-onboarding', 'Lista completa de atividades e tarefas para integração de novos colaboradores.', 'template', 'published', 'public', 'pt', 'Recursos Humanos', '1.5', 'rh', '{"onboarding","integração","checklist"}', 'Maria Santos', '2024-12-01', false, 'checklist-onboarding-v1.5.xlsx', 'xlsx', 102400, '100 KB', '#', '[]'::jsonb),

  ('Procedimento de Compras', 'procedimento-compras', 'Fluxo completo de solicitação, cotação e aprovação de compras corporativas.', 'procedimento', 'review', 'department', 'pt', 'Compras', '2.3', 'compras', '{"compras","cotação","aprovação"}', 'Pedro Almeida', '2025-03-15', false, 'proc-compras-v2.3.pdf', 'pdf', 921600, '900 KB', '#', '[{"version":"2.3","date":"2025-03-15","author":"Pedro Almeida","changes":"Em revisão - novo fluxo aprovação"}]'::jsonb);
