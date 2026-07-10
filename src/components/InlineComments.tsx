"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { MessageSquare, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

type Comment = {
  id: string;
  userId: string;
  authorName: string;
  authorImageUrl: string | null;
  paragraphIndex: number;
  content: string;
  createdAt: string;
};

type GroupedComments = Record<number, Comment[]>;

export default function InlineComments({
  chapterId,
  paragraphs,
}: {
  chapterId: string;
  paragraphs: string[];
}) {
  const { user } = useUser();
  const [comments, setComments] = useState<GroupedComments>({});
  const [activeParagraph, setActiveParagraph] = useState<number | null>(null);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/inline-comments?chapterId=${chapterId}`)
      .then((r) => (r.ok ? r.json() : {}))
      .then(setComments)
      .catch(() => toast.error("Failed to load inline comments"));
  }, [chapterId]);

  const handleSubmit = async (paragraphIndex: number) => {
    if (!newComment.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/inline-comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chapterId, paragraphIndex, content: newComment }),
      });
      if (res.ok) {
        const comment = await res.json();
        setComments((prev) => ({
          ...prev,
          [paragraphIndex]: [...(prev[paragraphIndex] || []), comment],
        }));
        setNewComment("");
      }
    } catch {
      toast.error("Failed to post comment");
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string, paragraphIndex: number) => {
    try {
      const res = await fetch("/api/inline-comments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setComments((prev) => ({
          ...prev,
          [paragraphIndex]: (prev[paragraphIndex] || []).filter(
            (c) => c.id !== id
          ),
        }));
      }
    } catch {
      toast.error("Failed to delete comment");
    }
  };

  return (
    <div className="space-y-0">
      {paragraphs.map((text, idx) => {
        const paraComments = comments[idx] || [];
        const isActive = activeParagraph === idx;
        const count = paraComments.length;

        return (
          <div key={idx} className="group relative">
            {/* Paragraph text */}
            <div className="flex items-start gap-2">
              <p className="mb-6 flex-1">{text}</p>
              <button
                onClick={() =>
                  setActiveParagraph(isActive ? null : idx)
                }
                className={`flex-shrink-0 mt-1 flex items-center gap-1 text-xs rounded-full px-2 py-1 transition-all cursor-pointer ${
                  count > 0
                    ? "text-primary bg-primary/10"
                    : "text-gray-600 opacity-0 group-hover:opacity-100"
                }`}
                aria-label={`${count} comments on paragraph ${idx + 1}`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                {count > 0 && <span>{count}</span>}
              </button>
            </div>

            {/* Inline comment panel */}
            <div
              className={`overflow-hidden transition-all duration-300 ${
                isActive ? "max-h-[500px] mb-6" : "max-h-0"
              }`}
            >
              <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4 ml-4">
                {paraComments.length > 0 && (
                  <div className="space-y-3 mb-4">
                    {paraComments.map((c) => (
                      <div key={c.id} className="flex items-start gap-3">
                        {c.authorImageUrl ? (
                          <Image
                            src={c.authorImageUrl}
                            alt=""
                            width={28}
                            height={28}
                            className="rounded-full flex-shrink-0"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-gray-700 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2">
                            <span className="text-sm font-medium text-white">
                              {c.authorName}
                            </span>
                            <span className="text-[10px] text-gray-500">
                              {new Date(c.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-300 mt-0.5">
                            {c.content}
                          </p>
                        </div>
                        {user?.id === c.userId && (
                          <button
                            onClick={() => handleDelete(c.id, idx)}
                            className="text-gray-600 hover:text-red-400 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {user ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleSubmit(idx)
                      }
                      placeholder="Add a comment..."
                      className="flex-1 bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50"
                    />
                    <button
                      onClick={() => handleSubmit(idx)}
                      disabled={isSubmitting || !newComment.trim()}
                      className="text-primary hover:text-white transition disabled:opacity-30 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">
                    Sign in to leave a comment.
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
