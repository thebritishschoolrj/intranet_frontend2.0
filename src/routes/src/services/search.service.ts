import { supabase } from "@/integrations/supabase/client";

export interface SearchResult {
  id: string;
  type: "news" | "document" | "procedure" | "employee";
  title: string;
  subtitle: string;
  slug: string;
  url: string;
}

export async function globalSearch(query: string, limit = 20): Promise<SearchResult[]> {
  if (!query || query.trim().length < 2) return [];

  const q = query.trim();
  const pattern = `%${q}%`;

  const [newsRes, docsRes, procsRes, empRes] = await Promise.all([
    supabase
      .from("news")
      .select("id, title, slug, category, status")
      .eq("status", "published" as any)
      .or(`title.ilike.${pattern},excerpt.ilike.${pattern}`)
      .limit(limit),
    supabase
      .from("documents")
      .select("id, title, slug, category, status")
      .eq("status", "published" as any)
      .or(`title.ilike.${pattern},description.ilike.${pattern}`)
      .limit(limit),
    supabase
      .from("procedures")
      .select("id, title, slug, code, content_status, department_slug")
      .eq("content_status", "published" as any)
      .or(`title.ilike.${pattern},code.ilike.${pattern},description.ilike.${pattern}`)
      .limit(limit),
    supabase
      .from("profiles_public" as any)
      .select("id, name, position, department, user_id")
      .eq("status", "active" as any)
      .or(`name.ilike.${pattern},position.ilike.${pattern}`)
      .limit(limit),
  ]);

  const results: SearchResult[] = [];

  for (const row of newsRes.data ?? []) {
    results.push({
      id: row.id,
      type: "news",
      title: row.title,
      subtitle: row.category,
      slug: (row as any).slug ?? row.id,
      url: `/noticias/${(row as any).slug ?? row.id}`,
    });
  }

  for (const row of docsRes.data ?? []) {
    results.push({
      id: row.id,
      type: "document",
      title: row.title,
      subtitle: row.category,
      slug: (row as any).slug ?? row.id,
      url: `/documentos/${(row as any).slug ?? row.id}`,
    });
  }

  for (const row of procsRes.data ?? []) {
    results.push({
      id: row.id,
      type: "procedure",
      title: row.title,
      subtitle: row.code,
      slug: (row as any).slug ?? row.code,
      url: `/procedimentos/${(row as any).slug ?? row.code}`,
    });
  }

  for (const row of (empRes.data ?? []) as any[]) {
    results.push({
      id: row.user_id,
      type: "employee",
      title: row.name,
      subtitle: `${row.position} · ${row.department}`,
      slug: row.user_id,
      url: `/colaboradores/${row.user_id}`,
    });
  }

  return results.slice(0, limit);
}
