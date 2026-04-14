import { useState, useEffect, useCallback } from "react";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";

interface Props {
  newsId: string;
  isMandatory: boolean;
}

export function NewsAcknowledgment({ newsId, isMandatory }: Props) {
  const { user } = useAuth();
  const [acknowledged, setAcknowledged] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const check = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    const { data } = await supabase
      .from("news_acknowledgments" as any)
      .select("id")
      .eq("news_id", newsId)
      .eq("user_id", user.id)
      .maybeSingle();
    setAcknowledged(!!data);
    setLoading(false);
  }, [newsId, user]);

  useEffect(() => { void check(); }, [check]);

  if (!isMandatory || loading) return null;

  const handleAcknowledge = async () => {
    if (!user || acknowledged) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from("news_acknowledgments" as any).insert({
        news_id: newsId,
        user_id: user.id,
      } as any);
      if (error) throw error;
      setAcknowledged(true);
      toast.success("Leitura confirmada");
    } catch {
      toast.error("Erro ao confirmar leitura");
    } finally {
      setSubmitting(false);
    }
  };

  if (acknowledged) {
    return (
      <Card className="border-green-200 bg-green-50 dark:border-green-900/50 dark:bg-green-900/10">
        <CardContent className="flex items-center gap-3 p-4">
          <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
          <div>
            <p className="text-sm font-medium text-green-700 dark:text-green-300">Leitura confirmada</p>
            <p className="text-xs text-green-600/70 dark:text-green-400/70">Você confirmou a leitura deste comunicado obrigatório.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-900/10">
      <CardContent className="flex items-center justify-between gap-4 p-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          <div>
            <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Leitura obrigatória</p>
            <p className="text-xs text-amber-600/70 dark:text-amber-400/70">Este comunicado requer confirmação de leitura.</p>
          </div>
        </div>
        <Button
          size="sm"
          onClick={handleAcknowledge}
          disabled={submitting}
          className="shrink-0 gap-1.5"
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          Confirmar leitura
        </Button>
      </CardContent>
    </Card>
  );
}
