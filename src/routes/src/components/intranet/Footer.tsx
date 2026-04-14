import { useI18n } from "@/hooks/use-i18n";

export function Footer() {
  const { t } = useI18n();

  return (
    <footer className="bg-navy">
      <div className="h-[3px] bg-corporate-red" />
      <div className="py-3 text-center">
        <p className="text-[11px] text-navy-foreground/60">
          {t("footer.text")} — {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
