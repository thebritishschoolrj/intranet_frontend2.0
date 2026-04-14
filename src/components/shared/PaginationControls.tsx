// ─── Pagination ──────────────────────────────────────────────────────────────
// Reusable pagination component for lists and tables.

import { Button } from "@/components/ui/button";
import { useI18n } from "@/hooks/use-i18n";

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function PaginationControls({ page, totalPages, onPageChange }: PaginationControlsProps) {
  const { t } = useI18n();

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2">
      <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        {t("pagination.prev")}
      </Button>
      <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
      <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
        {t("pagination.next")}
      </Button>
    </div>
  );
}
