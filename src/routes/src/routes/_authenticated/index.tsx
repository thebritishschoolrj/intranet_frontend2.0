import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/intranet/Header";
import { Footer } from "@/components/intranet/Footer";
import { HighlightsSidebar } from "@/components/intranet/HighlightsSidebar";
import { NoticeBoard } from "@/components/intranet/NoticeBoard";
import { StrategicDirection } from "@/components/intranet/StrategicDirection";
import { AdminSection } from "@/components/intranet/AdminSection";
import { Organogram } from "@/components/intranet/Organogram";
import { SystemsGrid } from "@/components/intranet/SystemsGrid";
import { OtherAreas } from "@/components/intranet/OtherAreas";
import { BirthdaysSection } from "@/components/intranet/BirthdaysSection";

export const Route = createFileRoute("/src/routes/_authenticated/")({
  component: IntranetPortal,
  head: () => ({
    meta: [
      { title: "Intranet — Portal Corporativo" },
      { name: "description", content: "Portal interno corporativo com acesso rápido a sistemas, avisos e informações." },
    ],
  }),
});

function IntranetPortal() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* ─── Top Section: Highlights | Notice | Strategic ─── */}
        <section className="mx-auto max-w-7xl px-4 py-5 md:px-6">
          <div className="grid items-start gap-5 lg:grid-cols-[180px_1fr_190px]">
            <HighlightsSidebar />
            <NoticeBoard />
            <StrategicDirection />
          </div>
        </section>

        {/* ─── Dark Navy Band: Admin + Organogram + Systems ─── */}
        <section className="relative bg-navy overflow-hidden">
          {/* Diagonal top transition */}
          <div
            className="absolute top-0 left-0 right-0 h-20 bg-background"
            style={{ clipPath: "polygon(0 0, 100% 0, 100% 0%, 0 100%)" }}
          />
          {/* Diagonal bottom transition */}
          <div
            className="absolute bottom-0 left-0 right-0 h-20 bg-background"
            style={{ clipPath: "polygon(100% 0%, 100% 100%, 0 100%)" }}
          />

          <div className="relative mx-auto max-w-7xl px-4 py-20 md:px-6">
            {/* Admin — full width */}
            <AdminSection />

            {/* Organogram + Systems — side by side below */}
            <div className="mt-10 grid gap-8 lg:grid-cols-2">
              <Organogram />
              <SystemsGrid />
            </div>
          </div>
        </section>

        {/* ─── Bottom Section: Other Areas + Birthdays ─── */}
        <section className="mx-auto max-w-7xl px-4 py-8 md:px-6">
          <div className="grid items-start gap-8 lg:grid-cols-[1.1fr_1fr]">
            <OtherAreas />
            <BirthdaysSection />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
