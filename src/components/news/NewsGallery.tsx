import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Images, GripVertical, Check, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/hooks/use-i18n";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface GalleryImage {
  id: string;
  url: string;
  caption: string;
  sort_order: number;
}

interface NewsGalleryProps {
  newsId: string;
}

export function NewsGallery({ newsId }: NewsGalleryProps) {
  const { lang } = useI18n();
  const { user } = useAuth();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const originalOrder = useRef<GalleryImage[]>([]);

  const canEdit = user?.role === "admin" || user?.role === "manager" || user?.role === "editor";

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("news_gallery" as any)
        .select("*")
        .eq("news_id", newsId)
        .order("sort_order", { ascending: true });

      const mapped = ((data as any[]) ?? []).map((d: any) => ({
        id: d.id,
        url: d.url,
        caption: d.caption ?? "",
        sort_order: d.sort_order,
      }));
      setImages(mapped);
      originalOrder.current = mapped;
      setLoading(false);
    };
    void load();
  }, [newsId]);

  const openLightbox = (index: number) => {
    if (!editMode) setLightboxIndex(index);
  };
  const closeLightbox = () => setLightboxIndex(null);

  const goNext = useCallback(() => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % images.length);
    }
  }, [lightboxIndex, images.length]);

  const goPrev = useCallback(() => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + images.length) % images.length);
    }
  }, [lightboxIndex, images.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxIndex, goNext, goPrev]);

  const handleEnterEdit = () => {
    originalOrder.current = [...images];
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    setImages(originalOrder.current);
    setEditMode(false);
  };

  const handleSaveOrder = async () => {
    setSaving(true);
    try {
      const updates = images.map((img, i) =>
        supabase
          .from("news_gallery" as any)
          .update({ sort_order: i } as any)
          .eq("id", img.id)
      );
      await Promise.all(updates);
      originalOrder.current = images.map((img, i) => ({ ...img, sort_order: i }));
      setEditMode(false);
      toast.success(lang === "pt" ? "Ordem salva com sucesso" : "Order saved successfully");
    } catch {
      toast.error(lang === "pt" ? "Erro ao salvar ordem" : "Failed to save order");
    } finally {
      setSaving(false);
    }
  };

  if (loading || images.length === 0) return null;

  const gridCols =
    images.length === 1
      ? "grid-cols-1"
      : images.length === 2
        ? "grid-cols-2"
        : images.length === 3
          ? "grid-cols-3"
          : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4";

  return (
    <section className="mt-10">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          <Images className="h-3.5 w-3.5" />
          {lang === "pt" ? "Galeria de Imagens" : "Image Gallery"}
        </h3>

        {canEdit && images.length > 1 && (
          <div className="flex items-center gap-1.5">
            {editMode ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelEdit}
                  disabled={saving}
                  className="h-7 px-2 text-[11px] text-muted-foreground"
                >
                  {lang === "pt" ? "Cancelar" : "Cancel"}
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleSaveOrder}
                  disabled={saving}
                  className="h-7 gap-1 px-2.5 text-[11px]"
                >
                  <Check className="h-3 w-3" />
                  {saving
                    ? (lang === "pt" ? "Salvando..." : "Saving...")
                    : (lang === "pt" ? "Salvar Ordem" : "Save Order")}
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEnterEdit}
                className="h-7 gap-1 px-2 text-[11px] text-muted-foreground"
              >
                <Pencil className="h-3 w-3" />
                {lang === "pt" ? "Reordenar" : "Reorder"}
              </Button>
            )}
          </div>
        )}
      </div>

      {editMode ? (
        <Reorder.Group
          axis="x"
          values={images}
          onReorder={setImages}
          className={`grid ${gridCols} gap-2`}
          as="div"
        >
          {images.map((img, i) => (
            <Reorder.Item
              key={img.id}
              value={img}
              as="div"
              className="group relative aspect-square cursor-grab overflow-hidden rounded-lg border-2 border-dashed border-primary/40 bg-muted/30 active:cursor-grabbing"
              whileDrag={{ scale: 1.05, zIndex: 50, boxShadow: "0 8px 30px rgba(0,0,0,0.3)" }}
            >
              <img
                src={img.url}
                alt={img.caption || `Image ${i + 1}`}
                className="h-full w-full object-cover pointer-events-none"
                draggable={false}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                <GripVertical className="h-6 w-6 text-white drop-shadow-md" />
              </div>
              <span className="absolute left-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-[10px] font-bold text-white">
                {i + 1}
              </span>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      ) : (
        <div className={`grid ${gridCols} gap-2`}>
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => openLightbox(i)}
              className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <img
                src={img.url}
                alt={img.caption || `Image ${i + 1}`}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              {img.caption && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-2 pb-2 pt-6 opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="text-[11px] leading-tight text-white">
                    {img.caption}
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
            onClick={closeLightbox}
          >
            <button
              onClick={closeLightbox}
              className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>

            {images.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}

            <motion.div
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="flex max-h-[85vh] max-w-[90vw] flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={images[lightboxIndex].url}
                alt={images[lightboxIndex].caption || ""}
                className="max-h-[80vh] max-w-full rounded-lg object-contain"
              />
              {images[lightboxIndex].caption && (
                <p className="mt-3 text-center text-sm text-white/80">
                  {images[lightboxIndex].caption}
                </p>
              )}
              <span className="mt-2 text-xs text-white/50">
                {lightboxIndex + 1} / {images.length}
              </span>
            </motion.div>

            {images.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); goNext(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
