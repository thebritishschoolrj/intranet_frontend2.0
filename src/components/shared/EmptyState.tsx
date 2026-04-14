// ─── Empty State ─────────────────────────────────────────────────────────────
// Reusable empty state for lists, search results, and fresh environments.

import type { LucideIcon } from "lucide-react";
import { FileX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  /** Quick create button */
  onCreateClick?: () => void;
  createLabel?: string;
}

export function EmptyState({ icon: Icon = FileX, title, description, action, onCreateClick, createLabel }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-foreground">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-xs text-muted-foreground">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
      {onCreateClick && !action && (
        <div className="mt-4">
          <Button size="sm" onClick={onCreateClick}>
            {createLabel ?? "Criar"}
          </Button>
        </div>
      )}
    </div>
  );
}
