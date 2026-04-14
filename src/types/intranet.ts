import type { LucideIcon } from "lucide-react";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "editor" | "viewer";
  department: string;
  avatar?: string;
  phone?: string;
  position: string;
  birthday?: string;
  joinedAt: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: "aviso" | "evento" | "comunicado" | "campanha";
  author: string;
  publishedAt: string;
  coverImage?: string;
  pinned?: boolean;
  departmentSlug?: string;
}

export interface Document {
  id: string;
  title: string;
  description: string;
  category: "manual" | "formulario" | "politica" | "procedimento" | "template";
  departmentSlug?: string;
  fileUrl: string;
  fileType: "pdf" | "docx" | "xlsx" | "pptx";
  fileSize: string;
  version: string;
  updatedAt: string;
  author: string;
}

export interface Procedure {
  id: string;
  code: string;
  title: string;
  description: string;
  departmentSlug: string;
  version: string;
  status: "vigente" | "em_revisao" | "obsoleto";
  effectiveDate: string;
  updatedAt: string;
  author: string;
  attachments: { name: string; url: string; type: string }[];
  history: { version: string; date: string; author: string; changes: string }[];
}

export interface NavItem {
  label: string;
  labelEn: string;
  icon: LucideIcon;
  href: string;
  badge?: number;
  children?: NavItem[];
}
