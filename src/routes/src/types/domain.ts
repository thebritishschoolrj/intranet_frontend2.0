// ─── Domain Models ───────────────────────────────────────────────────────────
// Production-ready types for the intranet platform.
// All models include audit fields and are designed for Supabase integration.

import type { LucideIcon } from "lucide-react";

// ─── Enums & Literals ────────────────────────────────────────────────────────

export type AppRole = "admin" | "manager" | "editor" | "employee";
export type UserStatus = "active" | "inactive" | "suspended";
export type ContentStatus = "draft" | "review" | "published" | "archived";
export type ProcedureStatus = "vigente" | "em_revisao" | "obsoleto";
export type ProcedureCategory = "operacional" | "administrativo" | "seguranca" | "qualidade" | "compliance";
export type Visibility = "public" | "department" | "restricted";
export type Language = "pt" | "en";
export type NewsCategory = "aviso" | "evento" | "comunicado" | "campanha";
export type DocumentCategory = "manual" | "formulario" | "politica" | "procedimento" | "template";
export type FileType = "pdf" | "docx" | "xlsx" | "pptx" | "jpg" | "png" | "zip";
export type InstitutionalCategory = "onboarding" | "compliance" | "ethics" | "cipa" | "lgpd" | "quality" | "departmental" | "general";

// ─── Audit Fields ────────────────────────────────────────────────────────────

export interface AuditFields {
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// ─── User & Auth ─────────────────────────────────────────────────────────────

export interface User extends AuditFields {
  id: string;
  profileId: string;
  name: string;
  preferredName: string;
  email: string;
  employeeId: string;
  department: string;
  departmentSlug: string;
  position: string;
  role: AppRole;
  status: UserStatus;
  preferredLanguage: Language;
  avatar?: string;
  phone?: string;
  extension: string;
  birthday?: string;
  joinedAt: string;
  location: string;
  unit: string;
  bio: string;
  skills: string[];
  tags: string[];
  managerId?: string;
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: string;
}

// ─── Permissions ─────────────────────────────────────────────────────────────

export type Permission =
  | "news:read" | "news:create" | "news:edit" | "news:delete" | "news:publish"
  | "docs:read" | "docs:create" | "docs:edit" | "docs:delete" | "docs:publish"
  | "procedures:read" | "procedures:create" | "procedures:edit" | "procedures:delete" | "procedures:publish"
  | "employees:read" | "employees:create" | "employees:edit" | "employees:delete"
  | "departments:read" | "departments:edit"
  | "admin:access" | "admin:users" | "admin:roles" | "admin:settings";

export const ROLE_PERMISSIONS: Record<AppRole, Permission[]> = {
  admin: [
    "news:read", "news:create", "news:edit", "news:delete", "news:publish",
    "docs:read", "docs:create", "docs:edit", "docs:delete", "docs:publish",
    "procedures:read", "procedures:create", "procedures:edit", "procedures:delete", "procedures:publish",
    "employees:read", "employees:create", "employees:edit", "employees:delete",
    "departments:read", "departments:edit",
    "admin:access", "admin:users", "admin:roles", "admin:settings",
  ],
  manager: [
    "news:read", "news:create", "news:edit", "news:publish",
    "docs:read", "docs:create", "docs:edit", "docs:publish",
    "procedures:read", "procedures:create", "procedures:edit", "procedures:publish",
    "employees:read", "employees:edit",
    "departments:read",
    "admin:access",
  ],
  editor: [
    "news:read", "news:create", "news:edit",
    "docs:read", "docs:create", "docs:edit",
    "procedures:read", "procedures:create", "procedures:edit",
    "employees:read",
    "departments:read",
  ],
  employee: [
    "news:read",
    "docs:read",
    "procedures:read",
    "employees:read",
    "departments:read",
  ],
};

// ─── News ────────────────────────────────────────────────────────────────────

export interface NewsArticle extends AuditFields {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: NewsCategory;
  tags: string[];
  author: string;
  publishedAt: string | null;
  expiresAt: string | null;
  coverImage?: string;
  pinned: boolean;
  isFeatured: boolean;
  status: ContentStatus;
  visibility: Visibility;
  departmentAccess: string[];
  language: Language;
  attachments: FileAttachment[];
}

// ─── Document ────────────────────────────────────────────────────────────────

export interface DocumentVersion {
  version: string;
  date: string;
  author: string;
  changes: string;
}

export interface IntranetDocument extends AuditFields {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: DocumentCategory;
  departmentSlug?: string;
  file: FileAttachment | null;
  version: string;
  status: ContentStatus;
  visibility: Visibility;
  departmentAccess: string[];
  language: Language;
  author: string;
  tags: string[];
  responsibleUser: string;
  effectiveDate: string | null;
  expiryDate: string | null;
  isFeatured: boolean;
  history: DocumentVersion[];
}

// ─── Procedure ───────────────────────────────────────────────────────────────

export interface Procedure extends AuditFields {
  id: string;
  code: string;
  title: string;
  slug: string;
  description: string;
  category: ProcedureCategory;
  tags: string[];
  departmentSlug: string;
  responsibleUser: string;
  version: string;
  status: ProcedureStatus;
  contentStatus: ContentStatus;
  isActive: boolean;
  effectiveDate: string;
  author: string;
  visibility: Visibility;
  departmentAccess: string[];
  language: Language;
  attachments: FileAttachment[];
  history: ProcedureVersion[];
}

export interface ProcedureVersion {
  version: string;
  date: string;
  author: string;
  changes: string;
}

// ─── File / Attachment ───────────────────────────────────────────────────────

export interface FileAttachment {
  id: string;
  name: string;
  type: FileType;
  size: number;
  sizeFormatted: string;
  url: string;
  language: Language;
  uploadedAt: string;
  uploadedBy: string;
}

// ─── Department ──────────────────────────────────────────────────────────────

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

// ─── Audit Log ───────────────────────────────────────────────────────────────

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  details: Record<string, unknown>;
  createdAt: string;
  ipAddress?: string;
}

// ─── Institutional Page ──────────────────────────────────────────────────────

export interface InstitutionalPage extends AuditFields {
  id: string;
  title: string;
  slug: string;
  summary: string;
  contentHtml: string;
  category: InstitutionalCategory;
  tags: string[];
  featuredImage?: string;
  language: Language;
  status: ContentStatus;
  visibility: Visibility;
  departmentAccess: string[];
  ownerDepartment: string;
  responsibleUser: string;
  isFeatured: boolean;
  publishedAt: string | null;
  author: string;
}

// ─── Navigation ──────────────────────────────────────────────────────────────

export interface NavItem {
  key: string;
  icon: LucideIcon;
  href: string;
  badge?: number;
  requiredPermission?: Permission;
}

// ─── Paginated Response ──────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─── Filter & Sort ───────────────────────────────────────────────────────────

export interface ListFilter {
  search?: string;
  status?: string;
  category?: string;
  department?: string;
  language?: Language;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
