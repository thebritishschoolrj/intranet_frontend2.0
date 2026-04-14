import { useState, useEffect, useRef } from "react";
import { Search, Bell, User, LogOut, Globe, Shield, Newspaper, FileText, ClipboardList, Users } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/hooks/use-i18n";
import { useAuth } from "@/contexts/auth-context";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { globalSearch, type SearchResult } from "@/services/search.service";
import { useDebounce } from "@/hooks/useDebounce";
import { NotificationsDropdown } from "@/components/notifications/NotificationsDropdown";
import {
  ClipboardCheck, UserCheck, ShoppingCart, Calculator,
  Briefcase, Monitor, UserPlus, HardDrive, Utensils,
} from "lucide-react";

const quickAccessIcons = [
  { icon: ClipboardCheck, label: "CIPA", slug: null },
  { icon: UserCheck, label: "LOI", slug: null },
  { icon: ShoppingCart, label: "Compras", slug: "compras" },
  { icon: Calculator, label: "Financeiro", slug: "financeiro" },
  { icon: Briefcase, label: "DP", slug: "departamento-pessoal" },
  { icon: Monitor, label: "TI", slug: "ti-adm" },
  { icon: UserPlus, label: "RH", slug: "recursos-humanos" },
  { icon: HardDrive, label: "TI-Edu", slug: "ti-educacional" },
  { icon: Utensils, label: "Nutrição", slug: "nutricao" },
];

const typeIcons: Record<string, typeof Newspaper> = {
  news: Newspaper,
  document: FileText,
  procedure: ClipboardList,
  employee: Users,
};

const typeLabels: Record<string, Record<string, string>> = {
  news: { pt: "Notícia", en: "News" },
  document: { pt: "Documento", en: "Document" },
  procedure: { pt: "Procedimento", en: "Procedure" },
  employee: { pt: "Colaborador", en: "Employee" },
};

export function Header() {
  const { t, lang, setLang } = useI18n();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [searching, setSearching] = useState(false);
  const debouncedQuery = useDebounce(searchQuery, 300);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    globalSearch(debouncedQuery, 10)
      .then(setResults)
      .catch(() => setResults([]))
      .finally(() => setSearching(false));
  }, [debouncedQuery]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleResultClick = (result: SearchResult) => {
    setShowResults(false);
    setSearchQuery("");
    navigate({ to: result.url as any });
  };

  return (
    <header className="sticky top-0 z-50 bg-card shadow-sm">
      {/* Thin red accent line */}
      <div className="h-[3px] bg-corporate-red" />

      {/* Main header bar */}
      <div className="flex items-center justify-between px-4 py-2 md:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy">
            <span className="text-sm font-bold text-navy-foreground">IN</span>
          </div>
          <div className="hidden md:block">
            <h1 className="text-sm font-bold text-foreground leading-tight">{t("header.title")}</h1>
            <p className="text-[10px] text-muted-foreground">{t("header.subtitle")}</p>
          </div>
        </Link>

        <div className="mx-4 flex max-w-md flex-1" ref={searchRef}>
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("header.search")}
              className="pl-9 bg-secondary border-border text-sm"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setShowResults(true); }}
              onFocus={() => setShowResults(true)}
            />

            {/* Search results dropdown */}
            {showResults && (searchQuery.length >= 2) && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-80 overflow-y-auto rounded-lg border border-border bg-card shadow-lg">
                {searching && (
                  <div className="p-3 text-center text-xs text-muted-foreground">
                    {lang === "pt" ? "Buscando..." : "Searching..."}
                  </div>
                )}
                {!searching && results.length === 0 && (
                  <div className="p-3 text-center text-xs text-muted-foreground">
                    {lang === "pt" ? "Nenhum resultado encontrado" : "No results found"}
                  </div>
                )}
                {!searching && results.map((result) => {
                  const TypeIcon = typeIcons[result.type] ?? FileText;
                  return (
                    <button
                      key={`${result.type}-${result.id}`}
                      className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-accent"
                      onClick={() => handleResultClick(result)}
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent">
                        <TypeIcon className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{result.title}</p>
                        <p className="truncate text-[10px] text-muted-foreground">{result.subtitle}</p>
                      </div>
                      <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[9px] font-medium text-muted-foreground">
                        {typeLabels[result.type]?.[lang] ?? result.type}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLang(lang === "pt" ? "en" : "pt")}
            className="flex items-center gap-1 text-xs font-medium px-2"
          >
            <Globe className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="hidden sm:inline text-[11px]">{lang === "pt" ? "EN" : "PT"}</span>
            <span className="text-[10px]">{lang === "pt" ? "🇬🇧" : "🇧🇷"}</span>
          </Button>

          {isAuthenticated && (
            <>
              <PermissionGuard permission="admin:access">
                <Link to="/admin">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                    <Shield className="h-4 w-4" />
                  </Button>
                </Link>
              </PermissionGuard>

              <NotificationsDropdown />

              <div className="flex items-center gap-2 rounded-full border border-border bg-secondary pl-1 pr-3 py-1">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-navy">
                  <User className="h-3.5 w-3.5 text-navy-foreground" />
                </div>
                <div className="hidden md:block">
                  <span className="block text-xs font-medium leading-tight text-foreground">{user?.name ?? t("header.user")}</span>
                  <span className="block text-[10px] capitalize text-muted-foreground">{user?.role}</span>
                </div>
              </div>

              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={logout} title={t("login.logout")}>
                <LogOut className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </>
          )}

          {!isAuthenticated && (
            <Link to="/login">
              <Button size="sm" className="bg-navy text-navy-foreground hover:bg-navy-light text-xs">{t("login.title")}</Button>
            </Link>
          )}
        </div>
      </div>

      {/* Quick Access Icons Bar */}
      <div className="flex items-center gap-3 overflow-x-auto border-t border-border px-4 py-1.5 md:justify-center md:px-6">
        <span className="shrink-0 text-[11px] font-semibold text-navy">Quick Access</span>
        <div className="flex items-center gap-2">
          {quickAccessIcons.map((item) => {
            const IconComp = item.icon;
            const inner = (
              <div className="group flex flex-col items-center gap-0.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-navy/15 bg-background transition-all group-hover:border-navy group-hover:bg-navy/5">
                  <IconComp className="h-3.5 w-3.5 text-navy" />
                </div>
                <span className="text-[8px] font-medium text-muted-foreground group-hover:text-foreground">{item.label}</span>
              </div>
            );

            if (item.slug) {
              return (
                <Link key={item.label} to="/departamento/$slug" params={{ slug: item.slug }} className="shrink-0">
                  {inner}
                </Link>
              );
            }
            return <button key={item.label} className="shrink-0">{inner}</button>;
          })}
        </div>
      </div>
    </header>
  );
}
