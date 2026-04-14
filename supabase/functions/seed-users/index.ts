import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const DEMO_USERS = [
  { email: "admin@empresa.com", name: "Carlos Admin", role: "admin", department: "Diretoria", department_slug: "diretoria", position: "Diretor Geral", birthday: "1985-03-15", bio: "Diretor Geral com mais de 15 anos de experiência em gestão corporativa.", skills: ["Gestão Estratégica", "Liderança", "Planejamento"], location: "Sede - Bloco A", extension: "1000", joined_at: "2015-01-05" },
  { email: "manager@empresa.com", name: "Ana Gestora", role: "manager", department: "Recursos Humanos", department_slug: "rh", position: "Gerente de RH", birthday: "1990-07-22", bio: "Gerente de RH focada em desenvolvimento organizacional e gestão de talentos.", skills: ["Gestão de Pessoas", "Recrutamento", "Treinamento"], location: "Sede - Bloco B", extension: "2000", joined_at: "2018-03-15" },
  { email: "editor@empresa.com", name: "João Editor", role: "editor", department: "Comunicação", department_slug: "comunicacao", position: "Analista de Comunicação", birthday: "1992-04-14", bio: "Analista de comunicação responsável pela intranet e comunicação interna.", skills: ["Comunicação", "Marketing Digital", "Design"], location: "Sede - Bloco B", extension: "6001", joined_at: "2020-06-01" },
  { email: "employee@empresa.com", name: "Maria Silva", role: "employee", department: "Operações", department_slug: "operacoes", position: "Assistente Operacional", birthday: "1995-12-05", bio: "Assistente operacional dedicada ao suporte logístico e processos internos.", skills: ["Logística", "Processos", "Atendimento"], location: "Sede - Bloco C", extension: "7001", joined_at: "2022-02-01" },
  { email: "fernanda.lima@empresa.com", name: "Fernanda Lima", role: "editor", department: "Admissões", department_slug: "admissoes", position: "Coordenadora de Admissões", birthday: "1988-07-22", bio: "Coordenadora responsável pelo processo admissional e onboarding.", skills: ["Admissão", "Onboarding", "Gestão de Processos"], location: "Sede - Bloco B", extension: "2200", joined_at: "2020-02-15" },
  { email: "roberto.silva@empresa.com", name: "Roberto Silva", role: "editor", department: "Compras", department_slug: "compras", position: "Gerente de Compras", birthday: "1982-11-08", bio: "Gerente de compras com foco em negociação e gestão de fornecedores.", skills: ["Negociação", "Compras", "Fornecedores"], location: "Sede - Bloco A", extension: "5000", joined_at: "2018-03-10" },
  { email: "diego.nascimento@empresa.com", name: "Diego Nascimento", role: "manager", department: "TI Administrativa", department_slug: "ti-adm", position: "Coordenador de TI", birthday: "1987-12-05", bio: "Coordenador de TI responsável pela infraestrutura e segurança da informação.", skills: ["Infraestrutura", "Segurança", "Redes", "Cloud"], location: "Sede - Bloco C", extension: "3000", joined_at: "2019-11-01" },
  { email: "beatriz.cardoso@empresa.com", name: "Beatriz Cardoso", role: "manager", department: "Recursos Humanos", department_slug: "rh", position: "Gerente de RH", birthday: "1986-06-18", bio: "Gerente de RH com expertise em clima organizacional e desenvolvimento.", skills: ["Clima Organizacional", "Treinamento", "Benefícios"], location: "Sede - Bloco B", extension: "2001", joined_at: "2016-04-15" },
  { email: "patricia.rocha@empresa.com", name: "Patricia Rocha", role: "editor", department: "Financeiro", department_slug: "financeiro", position: "Gerente Financeira", birthday: "1984-01-25", bio: "Gerente financeira responsável pelo orçamento e planejamento financeiro.", skills: ["Finanças", "Orçamento", "Controladoria"], location: "Sede - Bloco A", extension: "4000", joined_at: "2018-09-01" },
  { email: "ricardo.gomes@empresa.com", name: "Ricardo Gomes", role: "admin", department: "Gestão", department_slug: "diretoria", position: "Diretor Administrativo", birthday: "1978-08-12", bio: "Diretor administrativo com visão estratégica e foco em resultados.", skills: ["Gestão", "Estratégia", "Liderança"], location: "Sede - Bloco A", extension: "1001", joined_at: "2015-01-05" },
  { email: "marcos.oliveira@empresa.com", name: "Marcos Oliveira", role: "editor", department: "Contabilidade", department_slug: "contabilidade", position: "Contador Chefe", birthday: "1983-10-20", bio: "Contador chefe responsável pela escrituração e demonstrações financeiras.", skills: ["Contabilidade", "Fiscal", "Auditoria"], location: "Sede - Bloco A", extension: "4100", joined_at: "2017-07-10" },
  { email: "camila.duarte@empresa.com", name: "Camila Duarte", role: "employee", department: "TI Educacional", department_slug: "ti-adm", position: "Analista de Sistemas", birthday: "1993-05-03", bio: "Analista de sistemas focada em soluções educacionais e automação.", skills: ["Desenvolvimento", "Análise de Sistemas", "Python"], location: "Sede - Bloco C", extension: "3100", joined_at: "2022-03-01" },
  { email: "mariana.souza@empresa.com", name: "Mariana Souza", role: "employee", department: "Nutrição", department_slug: "operacoes", position: "Nutricionista Chefe", birthday: "1991-02-11", bio: "Nutricionista responsável pelo programa de alimentação dos colaboradores.", skills: ["Nutrição", "Segurança Alimentar", "Cardápios"], location: "Sede - Bloco D", extension: "9100", joined_at: "2020-05-15" },
  { email: "luciana.ferreira@empresa.com", name: "Luciana Ferreira", role: "editor", department: "Jurídico", department_slug: "juridico", position: "Assessora Jurídica", birthday: "1986-09-30", bio: "Assessora jurídica especializada em direito trabalhista e compliance.", skills: ["Direito Trabalhista", "Compliance", "LGPD", "Contratos"], location: "Sede - Bloco A", extension: "8000", joined_at: "2019-04-01" },
  { email: "paulo.mendes@empresa.com", name: "Paulo Mendes", role: "employee", department: "Manutenção", department_slug: "manutencao", position: "Supervisor de Manutenção", birthday: "1980-04-17", bio: "Supervisor de manutenção predial com experiência em gestão de instalações.", skills: ["Manutenção Predial", "Elétrica", "Hidráulica"], location: "Sede - Bloco D", extension: "9000", joined_at: "2017-08-01" },
  { email: "ana.santos@empresa.com", name: "Ana Paula Santos", role: "editor", department: "Departamento Pessoal", department_slug: "departamento-pessoal", position: "Coordenadora de DP", birthday: "1989-09-30", bio: "Coordenadora de DP responsável pela folha de pagamento e obrigações trabalhistas.", skills: ["Folha de Pagamento", "Legislação Trabalhista", "eSocial"], location: "Sede - Bloco B", extension: "2100", joined_at: "2017-01-20" },
];

Deno.serve(async () => {
  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const results = [];

  for (const u of DEMO_USERS) {
    // Check if user already exists
    const { data: existing } = await admin.auth.admin.listUsers();
    const found = existing?.users?.find((x: any) => x.email === u.email);

    if (found) {
      // Update password and profile
      await admin.auth.admin.updateUserById(found.id, { password: "Teste@123" });
      
      // Update profile with additional data
      await admin.from("profiles").update({
        name: u.name,
        department: u.department,
        department_slug: u.department_slug,
        position: u.position,
        birthday: u.birthday,
        bio: u.bio,
        skills: u.skills,
        location: u.location,
        extension: u.extension,
        joined_at: u.joined_at,
      }).eq("user_id", found.id);

      // Ensure role exists
      const { data: roleData } = await admin.from("user_roles").select("id").eq("user_id", found.id);
      if (!roleData || roleData.length === 0) {
        await admin.from("user_roles").insert({ user_id: found.id, role: u.role });
      } else {
        await admin.from("user_roles").update({ role: u.role }).eq("user_id", found.id);
      }

      results.push({ email: u.email, status: "updated" });
      continue;
    }

    // Create user
    const { data, error } = await admin.auth.admin.createUser({
      email: u.email,
      password: "Teste@123",
      email_confirm: true,
      user_metadata: { name: u.name },
    });

    if (error) {
      results.push({ email: u.email, status: "error", error: error.message });
      continue;
    }

    // Update profile (created by trigger)
    await admin.from("profiles").update({
      name: u.name,
      department: u.department,
      department_slug: u.department_slug,
      position: u.position,
      birthday: u.birthday,
      bio: u.bio,
      skills: u.skills,
      location: u.location,
      extension: u.extension,
      joined_at: u.joined_at,
    }).eq("user_id", data.user.id);

    // Update role
    await admin.from("user_roles").update({ role: u.role }).eq("user_id", data.user.id);

    results.push({ email: u.email, status: "created", role: u.role });
  }

  return new Response(JSON.stringify({ results }, null, 2), {
    headers: { "Content-Type": "application/json" },
  });
});
