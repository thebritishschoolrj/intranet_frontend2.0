// ─── Data Table Shell ────────────────────────────────────────────────────────
// Reusable wrapper for admin data tables with search, filters, and actions.

import type { ReactNode } from "react";
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/hooks/use-i18n";

interface DataTableShellProps {
  title: string;
  description?: string;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onCreateClick?: () => void;
  createLabel?: string;
  filters?: ReactNode;
  children: ReactNode;
  totalItems?: number;
}

export function DataTableShell({
  title,
  description,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  onCreateClick,
  createLabel,
  filters,
  children,
  totalItems,
}: DataTableShellProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">{title}</h2>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
          {totalItems !== undefined && (
            <p className="text-xs text-muted-foreground">{totalItems} {t("pagination.records")}</p>
          )}
        </div>
        {onCreateClick && (
          <Button size="sm" onClick={onCreateClick} className="gap-1.5">
            <Plus className="h-4 w-4" />
            {createLabel ?? t("crud.create")}
          </Button>
        )}
      </div>

      {/* Search & filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {onSearchChange && (
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder ?? t("common.search")}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 bg-secondary border-0"
            />
          </div>
        )}
        {filters}
      </div>

      {/* Content */}
      {children}
    </div>
  );
}
