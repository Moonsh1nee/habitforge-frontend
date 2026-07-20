"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Loader2, Pencil, Trash2, Check, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { useTaskComments, useCreateComment, useUpdateComment, useDeleteComment } from "@/lib/hooks/useTasks";
import { useAuthStore } from "@/lib/stores/authStore";
import { cn } from "@/lib/utils";

interface TaskCommentsProps {
  taskId: string;
}

export function TaskComments({ taskId }: TaskCommentsProps) {
  const { data: comments = [], isLoading } = useTaskComments(taskId);
  const createComment = useCreateComment();
  const updateComment = useUpdateComment();
  const deleteComment = useDeleteComment();
  const currentUser = useAuthStore((s) => s.user);

  const [newBody, setNewBody] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState("");

  const handleCreate = () => {
    const body = newBody.trim();
    if (!body) return;
    createComment.mutate({ taskId, body });
    setNewBody("");
  };

  const startEdit = (id: string, body: string) => {
    setEditingId(id);
    setEditBody(body);
  };

  const submitEdit = () => {
    if (!editingId || !editBody.trim()) return;
    updateComment.mutate({ taskId, commentId: editingId, body: editBody.trim() });
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditBody("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="overflow-hidden"
    >
      <div className="mt-2 ml-7 space-y-2 border-l border-border pl-3">
        {isLoading && (
          <div className="flex items-center gap-1.5 py-1">
            <Loader2 size={12} className="animate-spin text-muted" />
            <span className="text-xs text-muted">Загрузка...</span>
          </div>
        )}

        <AnimatePresence initial={false}>
          {comments.map((comment) => {
            const isOwn = comment.userId === currentUser?.id;
            const isEditing = editingId === comment.id;
            const authorName = comment.author?.firstName ?? comment.author?.username ?? "?";
            const initials = authorName.slice(0, 1).toUpperCase();
            const timeAgo = formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: ru });

            return (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                className="group/comment flex items-start gap-2"
              >
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[9px] font-bold text-primary shrink-0 mt-0.5">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <div className="flex items-center gap-1">
                      <input
                        autoFocus
                        value={editBody}
                        onChange={(e) => setEditBody(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") submitEdit();
                          if (e.key === "Escape") cancelEdit();
                        }}
                        className="text-xs bg-white/5 border border-border rounded px-2 py-1 outline-none focus:border-primary/50 flex-1"
                      />
                      <button onClick={submitEdit} className="text-success hover:opacity-70 transition-opacity">
                        <Check size={12} />
                      </button>
                      <button onClick={cancelEdit} className="text-muted hover:text-text transition-colors">
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-text leading-relaxed">{comment.body}</p>
                  )}
                  <p className="text-[10px] text-muted/60 mt-0.5">{timeAgo}</p>
                </div>
                {isOwn && !isEditing && (
                  <div className="flex items-center gap-0.5 opacity-0 group-hover/comment:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={() => startEdit(comment.id, comment.body)}
                      className="text-muted hover:text-primary transition-colors p-0.5 rounded"
                    >
                      <Pencil size={10} />
                    </button>
                    <button
                      onClick={() => deleteComment.mutate({ taskId, commentId: comment.id })}
                      className="text-muted hover:text-danger transition-colors p-0.5 rounded"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* New comment input */}
        <div className="flex items-center gap-1.5 pt-0.5">
          <div className={cn(
            "w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[9px] font-bold text-primary shrink-0",
          )}>
            {currentUser?.firstName?.slice(0, 1).toUpperCase() ?? "?"}
          </div>
          <input
            value={newBody}
            onChange={(e) => setNewBody(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); }}
            placeholder="Написать комментарий..."
            className="text-xs bg-transparent outline-none text-text placeholder:text-muted/50 flex-1 py-0.5"
          />
          {newBody.trim() && (
            <button
              onClick={handleCreate}
              disabled={createComment.isPending}
              className="text-primary hover:opacity-70 transition-opacity"
            >
              <Check size={12} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
