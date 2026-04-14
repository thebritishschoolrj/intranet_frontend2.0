import { useState, useEffect, useCallback } from "react";
import { MessageSquare, Send, Trash2, User as UserIcon, CornerDownRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";

interface Comment {
  id: string;
  content: string;
  userId: string;
  userName: string;
  avatarUrl?: string;
  createdAt: string;
  parentId: string | null;
  replies: Comment[];
}

interface NewsCommentsProps {
  newsId: string;
}

export function NewsComments({ newsId }: NewsCommentsProps) {
  const { user, hasAnyRole } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canModerate = hasAnyRole(["admin", "manager"]);

  const loadComments = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("news_comments" as any)
        .select("*")
        .eq("news_id", newsId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const allComments = (data ?? []) as any[];
      const userIds = [...new Set(allComments.map((c) => c.user_id))];
      let profileMap: Record<string, { name: string; avatar_url?: string }> = {};

      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, name, avatar_url")
          .in("user_id", userIds);
        for (const p of profiles ?? []) {
          profileMap[p.user_id] = { name: p.name, avatar_url: p.avatar_url ?? undefined };
        }
      }

      const mapped = allComments.map((c) => ({
        id: c.id,
        content: c.content,
        userId: c.user_id,
        userName: profileMap[c.user_id]?.name ?? "Usuário",
        avatarUrl: profileMap[c.user_id]?.avatar_url,
        createdAt: c.created_at,
        parentId: c.parent_id,
        replies: [] as Comment[],
      }));

      // Build tree
      const byId = new Map<string, Comment>();
      for (const c of mapped) byId.set(c.id, c);
      const roots: Comment[] = [];
      for (const c of mapped) {
        if (c.parentId && byId.has(c.parentId)) {
          byId.get(c.parentId)!.replies.push(c);
        } else {
          roots.push(c);
        }
      }

      setComments(roots);
    } catch {
      toast.error("Erro ao carregar comentários");
    } finally {
      setLoading(false);
    }
  }, [newsId]);

  useEffect(() => { void loadComments(); }, [loadComments]);

  const totalCount = comments.reduce((sum, c) => sum + 1 + c.replies.length, 0);

  const handleSubmit = async (parentId: string | null = null) => {
    if (!user) return;
    const text = parentId ? replyText.trim() : newComment.trim();
    if (!text) return;
    setSubmitting(true);
    try {
      const insertData: any = { news_id: newsId, user_id: user.id, content: text };
      if (parentId) insertData.parent_id = parentId;
      const { error } = await supabase.from("news_comments" as any).insert(insertData);
      if (error) throw error;
      if (parentId) { setReplyText(""); setReplyTo(null); } else { setNewComment(""); }
      await loadComments();
      toast.success(parentId ? "Resposta adicionada" : "Comentário adicionado");
    } catch {
      toast.error("Erro ao adicionar comentário");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      const { error } = await supabase.from("news_comments" as any).delete().eq("id", commentId);
      if (error) throw error;
      await loadComments();
      toast.success("Comentário removido");
    } catch {
      toast.error("Erro ao remover comentário");
    }
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <div key={comment.id} className={isReply ? "ml-8 mt-2" : ""}>
      <div className="flex gap-3">
        <div className={`flex shrink-0 items-center justify-center rounded-full bg-accent ${isReply ? "h-6 w-6" : "h-8 w-8"}`}>
          {comment.avatarUrl ? (
            <img src={comment.avatarUrl} alt="" className={`rounded-full object-cover ${isReply ? "h-6 w-6" : "h-8 w-8"}`} />
          ) : (
            <UserIcon className={isReply ? "h-3 w-3 text-muted-foreground" : "h-3.5 w-3.5 text-muted-foreground"} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={`font-medium text-foreground ${isReply ? "text-xs" : "text-sm"}`}>{comment.userName}</span>
            <span className="text-[10px] text-muted-foreground">
              {new Date(comment.createdAt).toLocaleDateString("pt-BR", {
                day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
              })}
            </span>
          </div>
          <p className={`mt-1 leading-relaxed text-foreground/80 whitespace-pre-wrap ${isReply ? "text-xs" : "text-sm"}`}>
            {comment.content}
          </p>
          {/* Reply button */}
          {!isReply && user && (
            <button
              className="mt-1 flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
              onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
            >
              <CornerDownRight className="h-3 w-3" /> Responder
            </button>
          )}
        </div>
        {(comment.userId === user?.id || canModerate) && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
            onClick={() => handleDelete(comment.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {/* Reply form */}
      {replyTo === comment.id && (
        <div className="ml-8 mt-2 space-y-1.5">
          <Textarea
            placeholder="Escreva uma resposta..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            rows={2}
            maxLength={1000}
            className="resize-none text-xs"
          />
          <div className="flex gap-1.5 justify-end">
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => { setReplyTo(null); setReplyText(""); }}>
              Cancelar
            </Button>
            <Button size="sm" className="h-7 gap-1 text-xs" onClick={() => handleSubmit(comment.id)} disabled={submitting || !replyText.trim()}>
              <Send className="h-3 w-3" /> Responder
            </Button>
          </div>
        </div>
      )}

      {/* Replies */}
      {comment.replies.length > 0 && (
        <div className="mt-1.5 space-y-2 border-l-2 border-border pl-2">
          {comment.replies.map((reply) => renderComment(reply, true))}
        </div>
      )}
    </div>
  );

  return (
    <Card>
      <CardContent className="p-5">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
          <MessageSquare className="h-4 w-4" />
          Comentários ({totalCount})
        </h3>

        {user && (
          <div className="mb-4 space-y-2">
            <Textarea
              placeholder="Escreva um comentário..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
              maxLength={2000}
              className="resize-none text-sm"
            />
            <div className="flex justify-end">
              <Button size="sm" onClick={() => handleSubmit()} disabled={submitting || !newComment.trim()} className="gap-1.5">
                <Send className="h-3.5 w-3.5" /> Enviar
              </Button>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex justify-center py-6">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}

        {!loading && comments.length === 0 && (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Nenhum comentário ainda. Seja o primeiro!
          </p>
        )}

        {!loading && comments.length > 0 && (
          <div className="space-y-4">
            {comments.map((comment, idx) => (
              <div key={comment.id}>
                {idx > 0 && <Separator className="mb-4" />}
                {renderComment(comment)}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
