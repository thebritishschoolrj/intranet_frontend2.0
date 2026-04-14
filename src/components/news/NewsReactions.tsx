import { useState, useEffect, useCallback } from "react";
import { ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";

interface NewsReactionsProps {
  newsId: string;
}

export function NewsReactions({ newsId }: NewsReactionsProps) {
  const { user } = useAuth();
  const [count, setCount] = useState(0);
  const [hasReacted, setHasReacted] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    const [{ count: total }, { data: mine }] = await Promise.all([
      supabase.from("news_reactions" as any).select("*", { count: "exact", head: true }).eq("news_id", newsId),
      user
        ? supabase.from("news_reactions" as any).select("id").eq("news_id", newsId).eq("user_id", user.id).maybeSingle()
        : Promise.resolve({ data: null }),
    ]);
    setCount(total ?? 0);
    setHasReacted(!!mine);
  }, [newsId, user]);

  useEffect(() => { void load(); }, [load]);

  const toggle = async () => {
    if (!user) return;
    setLoading(true);
    try {
      if (hasReacted) {
        await supabase.from("news_reactions" as any).delete().eq("news_id", newsId).eq("user_id", user.id);
        setCount((c) => Math.max(0, c - 1));
        setHasReacted(false);
      } else {
        await supabase.from("news_reactions" as any).insert({ news_id: newsId, user_id: user.id, reaction_type: "like" } as any);
        setCount((c) => c + 1);
        setHasReacted(true);
      }
    } catch {
      toast.error("Erro ao processar reação");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={hasReacted ? "default" : "outline"}
      size="sm"
      className="gap-2"
      onClick={toggle}
      disabled={loading || !user}
    >
      <ThumbsUp className={`h-4 w-4 ${hasReacted ? "fill-current" : ""}`} />
      <span>{count}</span>
    </Button>
  );
}
