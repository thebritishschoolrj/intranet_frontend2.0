// ─── Dashboard Service ───────────────────────────────────────────────────────
// Optimized query layer using DB counts instead of fetching all records.

import { supabase } from "@/integrations/supabase/client";

export interface DashboardMetrics {
  totalEmployees: number;
  activeEmployees: number;
  departmentsCount: number;
  publishedNews: number;
  draftNews: number;
  reviewNews: number;
  activeProcedures: number;
  archivedProcedures: number;
  publishedDocs: number;
  recentDocs: number;
  publishedPages: number;
}

export interface PendingWorkflows {
  newsInReview: number;
  draftProcedures: number;
  archivedContent: number;
  unpublishedPages: number;
}

export interface DashboardNewsItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  publishedAt: string | null;
  isFeatured: boolean;
  pinned: boolean;
  coverImage?: string;
  author: string;
}

export interface DashboardProcedureItem {
  id: string;
  title: string;
  slug: string;
  code: string;
  status: string;
  departmentSlug: string;
  updatedAt: string;
}

export interface DashboardDocItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  updatedAt: string;
  fileType: string | null;
}

export interface DashboardPageItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  isFeatured: boolean;
  updatedAt: string;
}

export interface BirthdayItem {
  name: string;
  department: string;
  birthday: string;
  avatar?: string;
}

// ─── Fetchers (optimized with head:true counts) ──────────────────────────────

export async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    totalEmp, activeEmp, deptsCount,
    pubNews, draftNews, reviewNews,
    pubProcs, archProcs,
    pubDocs, recentDocs, pubPages,
  ] = await Promise.all([
    supabase.from("profiles_public" as any).select("id", { count: "exact", head: true }),
    supabase.from("profiles_public" as any).select("id", { count: "exact", head: true }).eq("status", "active" as any),
    supabase.from("departments").select("id", { count: "exact", head: true }),
    supabase.from("news").select("id", { count: "exact", head: true }).eq("status", "published" as any),
    supabase.from("news").select("id", { count: "exact", head: true }).eq("status", "draft" as any),
    supabase.from("news").select("id", { count: "exact", head: true }).eq("status", "review" as any),
    supabase.from("procedures").select("id", { count: "exact", head: true }).eq("content_status", "published" as any),
    supabase.from("procedures").select("id", { count: "exact", head: true }).eq("content_status", "archived" as any),
    supabase.from("documents").select("id", { count: "exact", head: true }).eq("status", "published" as any),
    supabase.from("documents").select("id", { count: "exact", head: true }).gte("updated_at", thirtyDaysAgo.toISOString()),
    supabase.from("institutional_pages").select("id", { count: "exact", head: true }).eq("status", "published" as any),
  ]);

  return {
    totalEmployees: totalEmp.count ?? 0,
    activeEmployees: activeEmp.count ?? 0,
    departmentsCount: deptsCount.count ?? 0,
    publishedNews: pubNews.count ?? 0,
    draftNews: draftNews.count ?? 0,
    reviewNews: reviewNews.count ?? 0,
    activeProcedures: pubProcs.count ?? 0,
    archivedProcedures: archProcs.count ?? 0,
    publishedDocs: pubDocs.count ?? 0,
    recentDocs: recentDocs.count ?? 0,
    publishedPages: pubPages.count ?? 0,
  };
}

export async function fetchPendingWorkflows(): Promise<PendingWorkflows> {
  const [newsReview, draftProcs, archivedDocs, unpubPages] = await Promise.all([
    supabase.from("news").select("id", { count: "exact", head: true }).eq("status", "review" as any),
    supabase.from("procedures").select("id", { count: "exact", head: true }).eq("content_status", "draft" as any),
    supabase.from("documents").select("id", { count: "exact", head: true }).eq("status", "archived" as any),
    supabase.from("institutional_pages").select("id", { count: "exact", head: true }).in("status", ["draft", "review"] as any),
  ]);

  return {
    newsInReview: newsReview.count ?? 0,
    draftProcedures: draftProcs.count ?? 0,
    archivedContent: archivedDocs.count ?? 0,
    unpublishedPages: unpubPages.count ?? 0,
  };
}

export async function fetchLatestNews(limit = 5): Promise<DashboardNewsItem[]> {
  const { data } = await supabase.from("news").select("id, title, slug, excerpt, category, published_at, is_featured, pinned, cover_image, author")
    .eq("status", "published" as any)
    .order("published_at", { ascending: false })
    .limit(limit);

  return (data ?? []).map((n: any) => ({
    id: n.id,
    title: n.title,
    slug: n.slug ?? n.id,
    excerpt: n.excerpt,
    category: n.category,
    publishedAt: n.published_at,
    isFeatured: n.is_featured ?? false,
    pinned: n.pinned ?? false,
    coverImage: n.cover_image ?? undefined,
    author: n.author,
  }));
}

export async function fetchFeaturedNews(limit = 3): Promise<DashboardNewsItem[]> {
  const { data } = await supabase.from("news").select("id, title, slug, excerpt, category, published_at, is_featured, pinned, cover_image, author")
    .eq("status", "published" as any)
    .eq("is_featured" as any, true)
    .order("published_at", { ascending: false })
    .limit(limit);

  return (data ?? []).map((n: any) => ({
    id: n.id,
    title: n.title,
    slug: n.slug ?? n.id,
    excerpt: n.excerpt,
    category: n.category,
    publishedAt: n.published_at,
    isFeatured: true,
    pinned: n.pinned ?? false,
    coverImage: n.cover_image ?? undefined,
    author: n.author,
  }));
}

export async function fetchRecentProcedures(limit = 5): Promise<DashboardProcedureItem[]> {
  const { data } = await supabase.from("procedures").select("id, title, slug, code, status, department_slug, updated_at")
    .eq("content_status", "published" as any)
    .order("updated_at", { ascending: false })
    .limit(limit);

  return (data ?? []).map((p: any) => ({
    id: p.id,
    title: p.title,
    slug: p.slug ?? p.code,
    code: p.code,
    status: p.status,
    departmentSlug: p.department_slug,
    updatedAt: p.updated_at,
  }));
}

export async function fetchRecentDocuments(limit = 5): Promise<DashboardDocItem[]> {
  const { data } = await supabase.from("documents").select("id, title, slug, category, updated_at, file_type")
    .eq("status", "published" as any)
    .order("updated_at", { ascending: false })
    .limit(limit);

  return (data ?? []).map((d: any) => ({
    id: d.id,
    title: d.title,
    slug: d.slug ?? d.id,
    category: d.category,
    updatedAt: d.updated_at,
    fileType: d.file_type,
  }));
}

export async function fetchInstitutionalHighlights(limit = 4): Promise<DashboardPageItem[]> {
  const { data } = await supabase.from("institutional_pages").select("id, title, slug, category, is_featured, updated_at")
    .eq("status", "published" as any)
    .order("updated_at", { ascending: false })
    .limit(limit);

  return (data ?? []).map((p: any) => ({
    id: p.id,
    title: p.title,
    slug: p.slug ?? p.id,
    category: p.category,
    isFeatured: p.is_featured ?? false,
    updatedAt: p.updated_at,
  }));
}

export async function fetchUpcomingBirthdays(): Promise<BirthdayItem[]> {
  const { data } = await supabase.from("profiles").select("name, department, birthday, avatar_url")
    .eq("status", "active" as any)
    .not("birthday", "is", null);

  if (!data) return [];

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentDay = now.getDate();

  return (data as any[])
    .filter((p) => {
      if (!p.birthday) return false;
      const parts = p.birthday.split(/[-/]/);
      if (parts.length < 2) return false;
      const month = parseInt(parts.length === 3 ? parts[1] : parts[0], 10);
      const day = parseInt(parts.length === 3 ? parts[2] : parts[1], 10);
      if (month === currentMonth && day >= currentDay) return true;
      if (month === currentMonth + 1) return true;
      return false;
    })
    .slice(0, 6)
    .map((p) => ({
      name: p.name,
      department: p.department,
      birthday: p.birthday,
      avatar: p.avatar_url ?? undefined,
    }));
}
