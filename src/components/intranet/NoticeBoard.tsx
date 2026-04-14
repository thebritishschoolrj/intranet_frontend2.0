import { useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/hooks/use-i18n";

const noticeKeys = [
  { titleKey: "notices.weekly.title", descKey: "notices.weekly.desc", ctaKey: "notices.weekly.cta", image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=300&fit=crop" },
  { titleKey: "notices.training.title", descKey: "notices.training.desc", ctaKey: "notices.training.cta", image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&h=300&fit=crop" },
  { titleKey: "notices.campaign.title", descKey: "notices.campaign.desc", ctaKey: "notices.campaign.cta", image: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=600&h=300&fit=crop" },
];

export function NoticeBoard() {
  const [current, setCurrent] = useState(0);
  const { t } = useI18n();
  const notice = noticeKeys[current];

  const next = () => setCurrent((p) => (p + 1) % noticeKeys.length);
  const prev = () => setCurrent((p) => (p - 1 + noticeKeys.length) % noticeKeys.length);

  return (
    <div className="w-full">
      <div className="mb-2 inline-block rounded bg-navy px-3 py-1">
        <span className="text-xs font-bold text-navy-foreground">{t("notices.title")}</span>
      </div>
      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="flex flex-col md:flex-row">
          <div className="flex flex-1 flex-col justify-center p-4">
            <h3 className="mb-1 text-base font-bold text-foreground">{t(notice.titleKey)}</h3>
            <p className="mb-3 text-xs leading-relaxed text-muted-foreground">{t(notice.descKey)}</p>
            <Button size="sm" className="w-fit bg-navy text-navy-foreground hover:bg-navy-light text-xs h-7 px-3">
              <ExternalLink className="mr-1 h-3 w-3" />
              {t(notice.ctaKey)}
            </Button>
          </div>
          <div className="relative h-44 w-full md:h-auto md:w-[55%]">
            <img src={notice.image} alt={t(notice.titleKey)} className="h-full w-full object-cover" />
            <div className="absolute inset-y-0 left-0 flex items-center">
              <button onClick={prev} className="ml-1 rounded-full bg-black/30 p-1 text-white backdrop-blur-sm hover:bg-black/50">
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center">
              <button onClick={next} className="mr-1 rounded-full bg-black/30 p-1 text-white backdrop-blur-sm hover:bg-black/50">
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
        <div className="flex justify-center gap-1.5 py-1.5">
          {noticeKeys.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)} className={`h-1.5 rounded-full transition-all ${i === current ? "w-5 bg-navy" : "w-1.5 bg-muted-foreground/30"}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
