"use client";

import { useState, useEffect, FormEvent } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import { BORDER_DEFS } from "@/lib/gamification";

type CommentProfile = {
  level: number;
  equippedTitle: string | null;
  equippedBorder: string | null;
} | null;

type Comment = {
  id: string;
  authorName: string;
  authorImageUrl: string;
  content: string;
  createdAt: string;
  authorProfile?: CommentProfile;
};

/** Get CSS classes for avatar border based on equipped border key */
function getAvatarBorder(borderKey: string | null | undefined, level: number): string {
  // If user has an equipped border, use it
  if (borderKey && borderKey !== "none") {
    const border = BORDER_DEFS.find((b) => b.key === borderKey);
    if (border) return border.cssClass;
  }
  // Fallback: auto-border based on level
  if (level >= 50) return BORDER_DEFS.find(b => b.key === "diamond_crown")!.cssClass;
  if (level >= 35) return BORDER_DEFS.find(b => b.key === "violet_aura")!.cssClass;
  if (level >= 20) return BORDER_DEFS.find(b => b.key === "golden_glow")!.cssClass;
  if (level >= 10) return BORDER_DEFS.find(b => b.key === "silver_frame")!.cssClass;
  if (level >= 5) return BORDER_DEFS.find(b => b.key === "bronze_frame")!.cssClass;
  return "";
}

function getRarityColor(rarity: string): string {
  switch (rarity) {
    case "legendary": return "text-cyan-300";
    case "epic": return "text-violet-300";
    case "rare": return "text-blue-300";
    default: return "text-amber-300";
  }
}

export const CommentSection = ({ novelSlug }: { novelSlug: string }) => {
  const { user } = useUser();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const fetchComments = async () => {
    setIsFetching(true);
    try {
      const response = await fetch(`/api/novels/${novelSlug}/comments`, { cache: "no-store" });
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments ?? data);
      }
    } catch {
      toast.error("Failed to load comments");
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [novelSlug]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ novelSlug, content: newComment }),
      });

      if (response.ok) {
        setNewComment("");
        await fetchComments();
        // Trigger achievement check
        fetch("/api/achievements", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ trigger: "comment_posted", value: 1 }),
        }).catch(() => {});
        // Grant XP
        fetch("/api/gamification/xp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ trigger: "comment_posted" }),
        }).then(r => r.ok ? r.json() : null).then(data => {
          if (data?.leveledUp) {
            toast.success(`🎉 Level Up! You are now Level ${data.newLevel}!`, { duration: 5000 });
          }
        }).catch(() => {});
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to submit comment");
      }
    } catch {
      toast.error("Failed to submit comment");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-12">
      <h2 className="text-3xl font-bold mb-6 text-white">Comments</h2>
      {user ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <Textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Write your comment here..." className="bg-gray-800 border-gray-700 p-2 px-4 text-white" />
          <Button type="submit" disabled={isLoading} className="mt-4">
            {isLoading ? "Submitting..." : "Submit Comment"}
          </Button>
        </form>
      ) : (
        <p className="text-gray-400 mb-8">
          Please{" "}
          <Link href="/sign-in" className="text-primary hover:underline">
            sign in
          </Link>{" "}
          to leave a comment.
        </p>
      )}

      <div className="space-y-6">
        {isFetching ? (
          <p className="text-gray-400">Loading comments...</p>
        ) : comments.length > 0 ? (
          comments.map((comment) => {
            const profile = comment.authorProfile;
            const level = profile?.level ?? 1;
            const borderClasses = getAvatarBorder(profile?.equippedBorder, level);

            return (
              <div key={comment.id} className="flex items-start gap-4">
                {/* Avatar with level-based border */}
                <div className={`relative w-11 h-11 rounded-full flex-shrink-0 ${borderClasses}`}>
                  <Image
                    src={comment.authorImageUrl}
                    alt={comment.authorName}
                    width={40}
                    height={40}
                    className="rounded-full absolute inset-0.5"
                  />
                  {/* Level badge */}
                  <span className="absolute -bottom-1 -right-1 bg-violet-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border-2 border-[#09090b] leading-none">
                    {level}
                  </span>
                </div>

                <div className="bg-gray-800/50 p-4 rounded-lg w-full">
                  <div className="flex items-center gap-2 mb-1">
                    {/* Name with equipped title */}
                    <p className="font-semibold text-white">{comment.authorName}</p>
                    {profile?.equippedTitle && (
                      <span className="text-xs font-medium text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
                        {profile.equippedTitle}
                      </span>
                    )}
                    <p className="text-xs text-gray-400 ml-auto">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-gray-300 whitespace-pre-wrap">{comment.content}</p>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-gray-400">No comments yet. Be the first to comment!</p>
        )}
      </div>
    </section>
  );
};
