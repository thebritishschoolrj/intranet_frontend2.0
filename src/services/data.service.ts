// ─── Data Service ────────────────────────────────────────────────────────────
// Abstraction layer for data access backed by Supabase.

import { supabase } from "@/integrations/supabase/client";
import type {
  NewsArticle, IntranetDocument, Procedure, User,
  PaginatedResponse, ListFilter, ProcedureVersion, DocumentVersion,
  InstitutionalPage,
} from "@/types/domain";
import type { Tables } from "@/integrations/supabase/types";

// ─── Mappers ─────────────────────────────────────────────────────────────────

function mapNews(row: Tables<"news">): NewsArticle {
  return {
    id: row.id,
    title: row.title,
    slug: (row as any).slug ?? row.id,
    excerpt: row.excerpt,
    content: row.content,
    category: row.category as NewsArticle["category"],
    tags: (row as any).tags ?? [],
    author: row.author,
    publishedAt: row.published_at,
    expiresAt: (row as any).expires_at ?? null,
    coverImage: row.cover_image ?? undefined,
    pinned: row.pinned,
    isFeatured: (row as any).is_featured ?? false,
    priority: ((row as any).priority ?? "normal") as NewsArticle["priority"],
    isMandatory: (row as any).is_mandatory ?? false,
    status: row.status as NewsArticle["status"],
    visibility: row.visibility as NewsArticle["visibility"],
    departmentAccess: row.department_access ?? [],
    roleAccess: (row as any).role_access ?? [],
    language: row.language as "pt" | "en",
    attachments: [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by ?? "unknown",
  };
}

function mapDocument(row: Tables<"documents">): IntranetDocument {
  const history = Array.isArray((row as any).history) ? (row as any).history as unknown as DocumentVersion[] : [];
  return {
    id: row.id,
    title: row.title,
    slug: (row as any).slug ?? row.id,
    description: row.description,
    category: row.category as IntranetDocument["category"],
    departmentSlug: row.department_slug ?? undefined,
    file: row.file_name ? {
      id: row.id,
      name: row.file_name,
      type: (row.file_type ?? "pdf") as any,
      size: row.file_size ?? 0,
      sizeFormatted: row.file_size_formatted ?? "0 KB",
      url: row.file_url ?? "#",
      language: row.language as "pt" | "en",
      uploadedAt: row.updated_at,
      uploadedBy: row.created_by ?? "unknown",
    } : null,
    version: row.version,
    status: row.status as IntranetDocument["status"],
    visibility: row.visibility as IntranetDocument["visibility"],
    departmentAccess: row.department_access ?? [],
    language: row.language as "pt" | "en",
    author: row.author,
    tags: (row as any).tags ?? [],
    responsibleUser: (row as any).responsible_user ?? "",
    effectiveDate: (row as any).effective_date ?? null,
    expiryDate: (row as any).expiry_date ?? null,
    isFeatured: (row as any).is_featured ?? false,
    history,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by ?? "unknown",
  };
}

function mapProcedure(row: Tables<"procedures">): Procedure {
  const history = Array.isArray(row.history) ? row.history as unknown as ProcedureVersion[] : [];
  return {
    id: row.id,
    code: row.code,
    title: row.title,
    slug: (row as any).slug ?? row.code,
    description: row.description,
    category: ((row as any).category ?? "operacional") as Procedure["category"],
    tags: (row as any).tags ?? [],
    departmentSlug: row.department_slug,
    responsibleUser: (row as any).responsible_user ?? "",
    version: row.version,
    status: row.status as Procedure["status"],
    contentStatus: row.content_status as Procedure["contentStatus"],
    isActive: (row as any).is_active ?? true,
    effectiveDate: row.effective_date ?? "",
    author: row.author,
    visibility: row.visibility as Procedure["visibility"],
    departmentAccess: row.department_access ?? [],
    language: row.language as "pt" | "en",
    attachments: [],
    history,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by ?? "unknown",
  };
}

function mapProfile(row: Tables<"profiles">, role?: string): User {
  return {
    id: row.user_id,
    profileId: row.id,
    name: row.name,
    preferredName: (row as any).preferred_name ?? "",
    email: row.email,
    employeeId: row.employee_id,
    department: row.department,
    departmentSlug: row.department_slug,
    position: row.position,
    role: (role ?? "employee") as User["role"],
    status: row.status as User["status"],
    preferredLanguage: row.preferred_language as "pt" | "en",
    avatar: row.avatar_url ?? undefined,
    phone: row.phone ?? undefined,
    extension: (row as any).extension ?? "",
    birthday: row.birthday ?? undefined,
    joinedAt: row.joined_at ?? row.created_at,
    location: (row as any).location ?? "",
    unit: (row as any).unit ?? "",
    bio: (row as any).bio ?? "",
    skills: (row as any).skills ?? [],
    tags: (row as any).tags ?? [],
    managerId: (row as any).manager_id ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: "system",
  };
}

/** Map a row from profiles_public view (no sensitive fields) */
function mapPublicProfile(row: any, role?: string): User {
  return {
    id: row.user_id,
    profileId: row.id,
    name: row.name,
    preferredName: row.preferred_name ?? "",
    email: "", // not exposed in public view
    employeeId: "", // not exposed in public view
    department: row.department,
    departmentSlug: row.department_slug,
    position: row.position,
    role: (role ?? "employee") as User["role"],
    status: row.status as User["status"],
    preferredLanguage: "pt",
    avatar: row.avatar_url ?? undefined,
    phone: undefined,
    extension: "",
    birthday: undefined,
    joinedAt: row.joined_at ?? row.created_at,
    location: row.location ?? "",
    unit: row.unit ?? "",
    bio: row.bio ?? "",
    skills: row.skills ?? [],
    tags: row.tags ?? [],
    managerId: undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: "system",
  };
}

// ─── News Service ────────────────────────────────────────────────────────────

class NewsService {
  async list(filter: ListFilter = {}): Promise<PaginatedResponse<NewsArticle>> {
    const page = filter.page ?? 1;
    const pageSize = filter.pageSize ?? 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase.from("news").select("*", { count: "exact" });

    if (filter.search) query = query.or(`title.ilike.%${filter.search}%,excerpt.ilike.%${filter.search}%`);
    if (filter.status) query = query.eq("status", filter.status as any);
    if (filter.category) query = query.eq("category", filter.category as any);
    if (filter.language) query = query.eq("language", filter.language);
    if (filter.department) query = query.contains("department_access", [filter.department]);

    const sortBy = filter.sortBy ?? "updated_at";
    const sortOrder = filter.sortOrder ?? "desc";
    query = query.order(sortBy, { ascending: sortOrder === "asc" });

    const { data, count, error } = await query.range(from, to);

    if (error) throw new Error(error.message);

    const total = count ?? 0;
    return {
      data: (data ?? []).map(mapNews),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getById(id: string): Promise<NewsArticle | null> {
    const { data, error } = await supabase.from("news").select("*").eq("id", id).maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;
    return mapNews(data);
  }

  async create(input: Partial<NewsArticle> & { title: string }): Promise<NewsArticle> {
    const { data: { user } } = await supabase.auth.getUser();
    const slug = input.slug ?? input.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const { data, error } = await supabase.from("news").insert({
      title: input.title,
      slug,
      excerpt: input.excerpt ?? "",
      content: input.content ?? "",
      category: (input.category ?? "comunicado") as any,
      author: input.author ?? "",
      status: (input.status ?? "draft") as any,
      visibility: (input.visibility ?? "public") as any,
      department_access: input.departmentAccess ?? [],
      language: input.language ?? "pt",
      pinned: input.pinned ?? false,
      is_featured: input.isFeatured ?? false,
      priority: input.priority ?? "normal",
      is_mandatory: input.isMandatory ?? false,
      role_access: input.roleAccess ?? [],
      tags: input.tags ?? [],
      published_at: input.publishedAt ?? null,
      expires_at: input.expiresAt ?? null,
      cover_image: input.coverImage ?? null,
      created_by: user?.id ?? null,
    } as any).select().single();

    if (error) throw new Error(error.message);
    return mapNews(data);
  }

  async update(id: string, input: Partial<NewsArticle>): Promise<NewsArticle> {
    const updateData: Record<string, unknown> = {};
    if (input.title !== undefined) updateData.title = input.title;
    if (input.slug !== undefined) updateData.slug = input.slug;
    if (input.excerpt !== undefined) updateData.excerpt = input.excerpt;
    if (input.content !== undefined) updateData.content = input.content;
    if (input.category !== undefined) updateData.category = input.category;
    if (input.author !== undefined) updateData.author = input.author;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.visibility !== undefined) updateData.visibility = input.visibility;
    if (input.pinned !== undefined) updateData.pinned = input.pinned;
    if (input.isFeatured !== undefined) updateData.is_featured = input.isFeatured;
    if (input.tags !== undefined) updateData.tags = input.tags;
    if (input.publishedAt !== undefined) updateData.published_at = input.publishedAt;
    if (input.expiresAt !== undefined) updateData.expires_at = input.expiresAt;
    if (input.coverImage !== undefined) updateData.cover_image = input.coverImage;
    if (input.departmentAccess !== undefined) updateData.department_access = input.departmentAccess;
    if (input.roleAccess !== undefined) updateData.role_access = input.roleAccess;
    if (input.priority !== undefined) updateData.priority = input.priority;
    if (input.isMandatory !== undefined) updateData.is_mandatory = input.isMandatory;

    const { data, error } = await supabase.from("news").update(updateData as any).eq("id", id).select().single();
    if (error) throw new Error(error.message);
    return mapNews(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("news").delete().eq("id", id);
    if (error) throw new Error(error.message);
  }

  async publish(id: string): Promise<NewsArticle> {
    return this.update(id, { status: "published", publishedAt: new Date().toISOString() });
  }

  async archive(id: string): Promise<NewsArticle> {
    return this.update(id, { status: "archived" });
  }

  async getBySlug(slug: string): Promise<NewsArticle | null> {
    const { data, error } = await supabase.from("news").select("*").eq("slug" as any, slug).maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;
    return mapNews(data);
  }

  async listFeatured(): Promise<NewsArticle[]> {
    const { data, error } = await supabase.from("news").select("*")
      .eq("status", "published" as any)
      .eq("is_featured" as any, true)
      .order("published_at", { ascending: false })
      .limit(5);
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapNews);
  }
}

// ─── Documents Service ───────────────────────────────────────────────────────

class DocumentsService {
  async list(filter: ListFilter = {}): Promise<PaginatedResponse<IntranetDocument>> {
    const page = filter.page ?? 1;
    const pageSize = filter.pageSize ?? 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase.from("documents").select("*", { count: "exact" });

    if (filter.search) query = query.or(`title.ilike.%${filter.search}%,description.ilike.%${filter.search}%`);
    if (filter.status) query = query.eq("status", filter.status as any);
    if (filter.category) query = query.eq("category", filter.category as any);
    if (filter.language) query = query.eq("language", filter.language);
    if (filter.department) query = query.eq("department_slug", filter.department);

    const sortBy = filter.sortBy ?? "updated_at";
    const sortOrder = filter.sortOrder ?? "desc";
    query = query.order(sortBy, { ascending: sortOrder === "asc" });

    const { data, count, error } = await query.range(from, to);

    if (error) throw new Error(error.message);

    const total = count ?? 0;
    return {
      data: (data ?? []).map(mapDocument),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getById(id: string): Promise<IntranetDocument | null> {
    const { data, error } = await supabase.from("documents").select("*").eq("id", id).single();
    if (error || !data) return null;
    return mapDocument(data);
  }

  async getBySlug(slug: string): Promise<IntranetDocument | null> {
    const { data, error } = await supabase.from("documents").select("*").eq("slug" as any, slug).single();
    if (error || !data) return null;
    return mapDocument(data);
  }

  async listFeatured(): Promise<IntranetDocument[]> {
    const { data, error } = await supabase.from("documents").select("*")
      .eq("status", "published" as any)
      .eq("is_featured" as any, true)
      .order("updated_at", { ascending: false })
      .limit(6);
    if (error) return [];
    return (data ?? []).map(mapDocument);
  }

  async create(input: Partial<IntranetDocument> & { title: string }): Promise<IntranetDocument> {
    const { data: { user } } = await supabase.auth.getUser();
    const slug = input.slug ?? input.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const { data, error } = await supabase.from("documents").insert({
      title: input.title,
      slug,
      description: input.description ?? "",
      category: (input.category ?? "manual") as any,
      department_slug: input.departmentSlug ?? null,
      version: input.version ?? "1.0",
      status: (input.status ?? "draft") as any,
      visibility: (input.visibility ?? "public") as any,
      department_access: input.departmentAccess ?? [],
      language: input.language ?? "pt",
      author: input.author ?? "",
      tags: input.tags ?? [],
      responsible_user: input.responsibleUser ?? "",
      effective_date: input.effectiveDate ?? null,
      expiry_date: input.expiryDate ?? null,
      is_featured: input.isFeatured ?? false,
      history: (input.history ?? []) as any,
      created_by: user?.id ?? null,
    } as any).select().single();

    if (error) throw new Error(error.message);
    return mapDocument(data);
  }

  async update(id: string, input: Partial<IntranetDocument>): Promise<IntranetDocument> {
    const updateData: Record<string, unknown> = {};
    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.category !== undefined) updateData.category = input.category;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.version !== undefined) updateData.version = input.version;
    if (input.visibility !== undefined) updateData.visibility = input.visibility;
    if (input.departmentSlug !== undefined) updateData.department_slug = input.departmentSlug;
    if (input.departmentAccess !== undefined) updateData.department_access = input.departmentAccess;
    if (input.language !== undefined) updateData.language = input.language;
    if (input.author !== undefined) updateData.author = input.author;
    if (input.tags !== undefined) updateData.tags = input.tags;
    if (input.responsibleUser !== undefined) updateData.responsible_user = input.responsibleUser;
    if (input.effectiveDate !== undefined) updateData.effective_date = input.effectiveDate;
    if (input.expiryDate !== undefined) updateData.expiry_date = input.expiryDate;
    if (input.isFeatured !== undefined) updateData.is_featured = input.isFeatured;
    if (input.history !== undefined) updateData.history = input.history;

    const { data, error } = await supabase.from("documents").update(updateData as any).eq("id", id).select().single();
    if (error) throw new Error(error.message);
    return mapDocument(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("documents").delete().eq("id", id);
    if (error) throw new Error(error.message);
  }

  async publish(id: string): Promise<IntranetDocument> {
    return this.update(id, { status: "published" });
  }

  async archive(id: string): Promise<IntranetDocument> {
    return this.update(id, { status: "archived" });
  }
}

// ─── Procedures Service ──────────────────────────────────────────────────────

class ProceduresService {
  async list(filter: ListFilter = {}): Promise<PaginatedResponse<Procedure>> {
    const page = filter.page ?? 1;
    const pageSize = filter.pageSize ?? 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase.from("procedures").select("*", { count: "exact" });

    if (filter.search) query = query.or(`title.ilike.%${filter.search}%,code.ilike.%${filter.search}%,description.ilike.%${filter.search}%`);
    if (filter.status) query = query.eq("status", filter.status as any);
    if (filter.category) query = query.eq("category" as any, filter.category);
    if (filter.department) query = query.eq("department_slug", filter.department);
    if (filter.language) query = query.eq("language", filter.language);

    const sortBy = filter.sortBy ?? "updated_at";
    const sortOrder = filter.sortOrder ?? "desc";
    query = query.order(sortBy, { ascending: sortOrder === "asc" });

    const { data, count, error } = await query.range(from, to);

    if (error) throw new Error(error.message);

    const total = count ?? 0;
    return {
      data: (data ?? []).map(mapProcedure),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getById(id: string): Promise<Procedure | null> {
    const { data, error } = await supabase.from("procedures").select("*").eq("id", id).single();
    if (error || !data) return null;
    return mapProcedure(data);
  }

  async getBySlug(slug: string): Promise<Procedure | null> {
    const { data, error } = await supabase.from("procedures").select("*").eq("slug" as any, slug).single();
    if (error || !data) return null;
    return mapProcedure(data);
  }

  async create(input: Partial<Procedure> & { code: string; title: string }): Promise<Procedure> {
    const { data: { user } } = await supabase.auth.getUser();
    const slug = input.slug ?? input.code.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const { data, error } = await supabase.from("procedures").insert({
      code: input.code,
      title: input.title,
      slug,
      description: input.description ?? "",
      department_slug: input.departmentSlug ?? "",
      version: input.version ?? "1.0",
      status: (input.status ?? "vigente") as any,
      content_status: (input.contentStatus ?? "draft") as any,
      effective_date: input.effectiveDate ?? null,
      author: input.author ?? "",
      visibility: (input.visibility ?? "public") as any,
      department_access: input.departmentAccess ?? [],
      language: input.language ?? "pt",
      history: (input.history ?? []) as any,
      category: input.category ?? "operacional",
      tags: input.tags ?? [],
      responsible_user: input.responsibleUser ?? "",
      is_active: input.isActive ?? true,
      created_by: user?.id ?? null,
    } as any).select().single();

    if (error) throw new Error(error.message);
    return mapProcedure(data);
  }

  async update(id: string, input: Partial<Procedure>): Promise<Procedure> {
    const updateData: Record<string, unknown> = {};
    if (input.title !== undefined) updateData.title = input.title;
    if (input.slug !== undefined) updateData.slug = input.slug;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.contentStatus !== undefined) updateData.content_status = input.contentStatus;
    if (input.version !== undefined) updateData.version = input.version;
    if (input.category !== undefined) updateData.category = input.category;
    if (input.tags !== undefined) updateData.tags = input.tags;
    if (input.responsibleUser !== undefined) updateData.responsible_user = input.responsibleUser;
    if (input.isActive !== undefined) updateData.is_active = input.isActive;
    if (input.effectiveDate !== undefined) updateData.effective_date = input.effectiveDate;
    if (input.author !== undefined) updateData.author = input.author;
    if (input.visibility !== undefined) updateData.visibility = input.visibility;
    if (input.departmentAccess !== undefined) updateData.department_access = input.departmentAccess;
    if (input.departmentSlug !== undefined) updateData.department_slug = input.departmentSlug;
    if (input.history !== undefined) updateData.history = input.history;

    const { data, error } = await supabase.from("procedures").update(updateData as any).eq("id", id).select().single();
    if (error) throw new Error(error.message);
    return mapProcedure(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("procedures").delete().eq("id", id);
    if (error) throw new Error(error.message);
  }

  async publish(id: string): Promise<Procedure> {
    return this.update(id, { contentStatus: "published", effectiveDate: new Date().toISOString().split("T")[0] });
  }

  async archive(id: string): Promise<Procedure> {
    return this.update(id, { contentStatus: "archived", isActive: false });
  }
}

// ─── Employees Service ───────────────────────────────────────────────────────

class EmployeesService {
  async list(filter: ListFilter = {}): Promise<PaginatedResponse<User>> {
    const page = filter.page ?? 1;
    const pageSize = filter.pageSize ?? 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase.from("profiles_public" as any).select("*", { count: "exact" });

    if (filter.search) query = query.or(`name.ilike.%${filter.search}%,position.ilike.%${filter.search}%`);
    if (filter.department) query = query.eq("department_slug", filter.department);
    if (filter.status) query = query.eq("status", filter.status as any);

    const sortBy = filter.sortBy ?? "name";
    const sortOrder = filter.sortOrder ?? "asc";
    query = query.order(sortBy, { ascending: sortOrder === "asc" });

    const { data, count, error } = await query.range(from, to);

    if (error) throw new Error(error.message);

    // Load roles for all users
    const userIds = (data ?? []).map((p: any) => p.user_id);
    const { data: roles } = userIds.length > 0
      ? await supabase.from("user_roles").select("user_id, role").in("user_id", userIds)
      : { data: [] };

    const roleMap = new Map((roles ?? []).map((r) => [r.user_id, r.role]));

    const total = count ?? 0;
    return {
      data: (data ?? []).map((p: any) => mapPublicProfile(p, roleMap.get(p.user_id))),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getById(id: string): Promise<User | null> {
    const { data, error } = await supabase.from("profiles").select("*").eq("user_id", id).single();
    if (error || !data) return null;

    const { data: roleData } = await supabase.from("user_roles").select("role").eq("user_id", id).single();
    return mapProfile(data, roleData?.role);
  }

  async getByProfileId(profileId: string): Promise<User | null> {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", profileId).single();
    if (error || !data) return null;

    const { data: roleData } = await supabase.from("user_roles").select("role").eq("user_id", data.user_id).single();
    return mapProfile(data, roleData?.role);
  }

  async getByDepartment(departmentSlug: string): Promise<User[]> {
    const { data, error } = await supabase.from("profiles_public" as any).select("*")
      .eq("department_slug", departmentSlug)
      .eq("status", "active" as any)
      .order("name");
    if (error) return [];

    const userIds = (data ?? []).map((p: any) => p.user_id);
    const { data: roles } = userIds.length > 0
      ? await supabase.from("user_roles").select("user_id, role").in("user_id", userIds)
      : { data: [] };
    const roleMap = new Map((roles ?? []).map((r) => [r.user_id, r.role]));

    return (data ?? []).map((p: any) => mapPublicProfile(p, roleMap.get(p.user_id)));
  }

  async update(profileId: string, input: Partial<User>): Promise<User | null> {
    const updateData: Record<string, unknown> = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.preferredName !== undefined) updateData.preferred_name = input.preferredName;
    if (input.position !== undefined) updateData.position = input.position;
    if (input.department !== undefined) updateData.department = input.department;
    if (input.departmentSlug !== undefined) updateData.department_slug = input.departmentSlug;
    if (input.phone !== undefined) updateData.phone = input.phone;
    if (input.extension !== undefined) updateData.extension = input.extension;
    if (input.location !== undefined) updateData.location = input.location;
    if (input.unit !== undefined) updateData.unit = input.unit;
    if (input.bio !== undefined) updateData.bio = input.bio;
    if (input.skills !== undefined) updateData.skills = input.skills;
    if (input.tags !== undefined) updateData.tags = input.tags;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.birthday !== undefined) updateData.birthday = input.birthday;

    const { data, error } = await supabase.from("profiles").update(updateData as any).eq("id", profileId).select().single();
    if (error) throw new Error(error.message);

    const { data: roleData } = await supabase.from("user_roles").select("role").eq("user_id", data.user_id).single();
    return mapProfile(data, roleData?.role);
  }
}

// ─── Departments Service ─────────────────────────────────────────────────────

class DepartmentsService {
  async list() {
    const { data, error } = await supabase
      .from("departments")
      .select("*")
      .order("label");

    if (error) throw new Error(error.message);
    return data ?? [];
  }

  async getBySlug(slug: string) {
    const { data, error } = await supabase
      .from("departments")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) return null;
    return data;
  }
}

// ─── Audit Service ───────────────────────────────────────────────────────────

export interface AuditLogEntry {
  id: string;
  action: string;
  resource: string;
  resourceId: string | null;
  details: Record<string, unknown>;
  createdAt: string;
  userId: string | null;
}

export interface AuditQueryFilters {
  action?: string;
  resource?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  perPage?: number;
}

function mapAuditRow(row: any): AuditLogEntry {
  return {
    id: row.id,
    action: row.action,
    resource: row.resource,
    resourceId: row.resource_id,
    details: row.details ?? {},
    createdAt: row.created_at,
    userId: row.user_id,
  };
}

class AuditService {
  async log(action: string, resource: string, resourceId?: string, details?: Record<string, unknown>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const enrichedDetails = {
        ...details,
        timestamp: new Date().toISOString(),
        userEmail: user.email ?? "unknown",
      };

      await supabase.from("audit_logs").insert({
        user_id: user.id,
        action,
        resource,
        resource_id: resourceId ?? null,
        details: enrichedDetails as any,
      });
    } catch (err) {
      // Audit logging should never break the main flow
      console.error("[AuditService] Failed to log action:", action, resource, err);
    }
  }

  async getRecent(limit = 50): Promise<AuditLogEntry[]> {
    const { data, error } = await supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw new Error(error.message);
    return (data ?? []).map(mapAuditRow);
  }

  async query(filters: AuditQueryFilters = {}): Promise<{ entries: AuditLogEntry[]; total: number }> {
    let q = supabase
      .from("audit_logs")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (filters.action) q = q.eq("action", filters.action);
    if (filters.resource) q = q.eq("resource", filters.resource);
    if (filters.userId) q = q.eq("user_id", filters.userId);
    if (filters.dateFrom) q = q.gte("created_at", filters.dateFrom);
    if (filters.dateTo) q = q.lte("created_at", filters.dateTo);
    if (filters.search) q = q.or(`action.ilike.%${filters.search}%,resource.ilike.%${filters.search}%`);

    const page = filters.page ?? 1;
    const perPage = filters.perPage ?? 25;
    const from = (page - 1) * perPage;
    q = q.range(from, from + perPage - 1);

    const { data, error, count } = await q;
    if (error) throw new Error(error.message);
    return {
      entries: (data ?? []).map(mapAuditRow),
      total: count ?? 0,
    };
  }

  async getDistinctActions(): Promise<string[]> {
    const { data } = await supabase
      .from("audit_logs")
      .select("action")
      .order("action");
    return [...new Set((data ?? []).map((r: any) => r.action))];
  }

  async getDistinctResources(): Promise<string[]> {
    const { data } = await supabase
      .from("audit_logs")
      .select("resource")
      .order("resource");
    return [...new Set((data ?? []).map((r: any) => r.resource))];
  }
}

// ─── Storage Service ─────────────────────────────────────────────────────────

class StorageService {
  async uploadAttachment(file: File, entityType: string, entityId: string) {
    const filePath = `${entityType}/${entityId}/${Date.now()}_${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("attachments")
      .upload(filePath, file);

    if (uploadError) throw new Error(uploadError.message);

    const { data: { publicUrl } } = supabase.storage
      .from("attachments")
      .getPublicUrl(filePath);

    // Save metadata
    const { data: { user } } = await supabase.auth.getUser();

    const formatSize = (bytes: number) => {
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const { data, error } = await supabase.from("file_attachments").insert({
      name: file.name,
      file_type: file.name.split(".").pop() ?? "bin",
      size: file.size,
      size_formatted: formatSize(file.size),
      url: publicUrl,
      entity_type: entityType,
      entity_id: entityId,
      uploaded_by: user?.id ?? null,
    }).select().single();

    if (error) throw new Error(error.message);
    return data;
  }

  async getAttachments(entityType: string, entityId: string) {
    const { data, error } = await supabase
      .from("file_attachments")
      .select("*")
      .eq("entity_type", entityType)
      .eq("entity_id", entityId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data ?? [];
  }
}

// ─── Institutional Pages Service ─────────────────────────────────────────────

function mapInstitutionalPage(row: any): InstitutionalPage {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    summary: row.summary ?? "",
    contentHtml: row.content_html ?? "",
    category: row.category ?? "general",
    tags: row.tags ?? [],
    featuredImage: row.featured_image ?? undefined,
    language: row.language ?? "pt",
    status: row.status ?? "draft",
    visibility: row.visibility ?? "public",
    departmentAccess: row.department_access ?? [],
    ownerDepartment: row.owner_department ?? "",
    responsibleUser: row.responsible_user ?? "",
    isFeatured: row.is_featured ?? false,
    publishedAt: row.published_at ?? null,
    author: row.author ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by ?? "unknown",
  };
}

class InstitutionalPagesService {
  async list(filter: ListFilter = {}): Promise<PaginatedResponse<InstitutionalPage>> {
    const page = filter.page ?? 1;
    const pageSize = filter.pageSize ?? 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase.from("institutional_pages" as any).select("*", { count: "exact" });

    if (filter.search) query = query.or(`title.ilike.%${filter.search}%,summary.ilike.%${filter.search}%`);
    if (filter.status) query = query.eq("status", filter.status);
    if (filter.category) query = query.eq("category", filter.category);
    if (filter.language) query = query.eq("language", filter.language);
    if (filter.department) query = query.eq("owner_department", filter.department);

    const sortBy = filter.sortBy ?? "updated_at";
    const sortOrder = filter.sortOrder ?? "desc";
    query = query.order(sortBy, { ascending: sortOrder === "asc" });

    const { data, count, error } = await query.range(from, to);
    if (error) throw new Error(error.message);

    const total = count ?? 0;
    return {
      data: (data ?? []).map(mapInstitutionalPage),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getBySlug(slug: string): Promise<InstitutionalPage | null> {
    const { data, error } = await supabase.from("institutional_pages" as any).select("*").eq("slug", slug).single();
    if (error || !data) return null;
    return mapInstitutionalPage(data);
  }

  async getById(id: string): Promise<InstitutionalPage | null> {
    const { data, error } = await supabase.from("institutional_pages" as any).select("*").eq("id", id).single();
    if (error || !data) return null;
    return mapInstitutionalPage(data);
  }

  async listPublished(category?: string): Promise<InstitutionalPage[]> {
    let query = supabase.from("institutional_pages" as any).select("*")
      .eq("status", "published")
      .order("title", { ascending: true });
    if (category) query = query.eq("category", category);
    const { data, error } = await query;
    if (error) return [];
    return (data ?? []).map(mapInstitutionalPage);
  }

  async create(input: Partial<InstitutionalPage> & { title: string }): Promise<InstitutionalPage> {
    const { data: { user } } = await supabase.auth.getUser();
    const slug = input.slug ?? input.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const { data, error } = await supabase.from("institutional_pages" as any).insert({
      title: input.title,
      slug,
      summary: input.summary ?? "",
      content_html: input.contentHtml ?? "",
      category: input.category ?? "general",
      tags: input.tags ?? [],
      featured_image: input.featuredImage ?? null,
      language: input.language ?? "pt",
      status: input.status ?? "draft",
      visibility: input.visibility ?? "public",
      department_access: input.departmentAccess ?? [],
      owner_department: input.ownerDepartment ?? "",
      responsible_user: input.responsibleUser ?? "",
      is_featured: input.isFeatured ?? false,
      published_at: input.publishedAt ?? null,
      author: input.author ?? "",
      created_by: user?.id ?? null,
    }).select().single();
    if (error) throw new Error(error.message);
    return mapInstitutionalPage(data);
  }

  async update(id: string, input: Partial<InstitutionalPage>): Promise<InstitutionalPage> {
    const updateData: Record<string, unknown> = {};
    if (input.title !== undefined) updateData.title = input.title;
    if (input.slug !== undefined) updateData.slug = input.slug;
    if (input.summary !== undefined) updateData.summary = input.summary;
    if (input.contentHtml !== undefined) updateData.content_html = input.contentHtml;
    if (input.category !== undefined) updateData.category = input.category;
    if (input.tags !== undefined) updateData.tags = input.tags;
    if (input.featuredImage !== undefined) updateData.featured_image = input.featuredImage;
    if (input.language !== undefined) updateData.language = input.language;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.visibility !== undefined) updateData.visibility = input.visibility;
    if (input.departmentAccess !== undefined) updateData.department_access = input.departmentAccess;
    if (input.ownerDepartment !== undefined) updateData.owner_department = input.ownerDepartment;
    if (input.responsibleUser !== undefined) updateData.responsible_user = input.responsibleUser;
    if (input.isFeatured !== undefined) updateData.is_featured = input.isFeatured;
    if (input.publishedAt !== undefined) updateData.published_at = input.publishedAt;
    if (input.author !== undefined) updateData.author = input.author;

    const { data, error } = await supabase.from("institutional_pages" as any).update(updateData).eq("id", id).select().single();
    if (error) throw new Error(error.message);
    return mapInstitutionalPage(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("institutional_pages" as any).delete().eq("id", id);
    if (error) throw new Error(error.message);
  }

  async publish(id: string): Promise<InstitutionalPage> {
    return this.update(id, { status: "published", publishedAt: new Date().toISOString() });
  }

  async archive(id: string): Promise<InstitutionalPage> {
    return this.update(id, { status: "archived" });
  }
}

// ─── Singleton exports ───────────────────────────────────────────────────────

export const newsService = new NewsService();
export const documentsService = new DocumentsService();
export const proceduresService = new ProceduresService();
export const employeesService = new EmployeesService();
export const departmentsService = new DepartmentsService();
export const auditService = new AuditService();
export const storageService = new StorageService();
export const institutionalPagesService = new InstitutionalPagesService();
