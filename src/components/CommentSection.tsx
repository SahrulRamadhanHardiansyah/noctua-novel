"use client";

import { useState, useEffect, FormEvent } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import Image from "next/image";
import Link from "next/link";

type Comment = {
  id: string;
  authorName: string;
  authorImageUrl: string;
  content: string;
  createdAt: string;
};

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
        setComments(data);
      }
    } catch (error) {
      console.error("Failed to fetch comments:", error);
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
    const response = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ novelSlug, content: newComment }),
    });

    if (response.ok) {
      setNewComment("");
      await fetchComments();
    }
    setIsLoading(false);
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
          comments.map((comment) => (
            <div key={comment.id} className="flex items-start gap-4">
              <Image src={comment.authorImageUrl} alt={comment.authorName} width={40} height={40} className="rounded-full" />
              <div className="bg-gray-800/50 p-4 rounded-lg w-full">
                <div className="flex items-baseline gap-2">
                  <p className="font-semibold text-white">{comment.authorName}</p>
                  <p className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleDateString()}</p>
                </div>
                <p className="mt-2 text-gray-300 whitespace-pre-wrap">{comment.content}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-400">No comments yet. Be the first to comment!</p>
        )}
      </div>
    </section>
  );
};
