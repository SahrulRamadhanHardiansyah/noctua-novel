"use client";

import { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import Link from "next/link";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

type UserComment = {
  id: string;
  content: string;
  novelSlug: string;
  createdAt: string;
};

export const UserCommentSection = () => {
  const [comments, setComments] = useState<UserComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAllComments, setShowAllComments] = useState(false);

  const fetchUserComments = async () => {
    try {
      const response = await fetch("/api/user/comments", { cache: "no-store" });
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error("Failed to fetch user comments:", error);
      toast.error("Could not load your comments.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserComments();
  }, []);

  const handleDelete = async (commentId: string) => {
    const originalComments = [...comments];
    setComments(comments.filter((c) => c.id !== commentId));

    const response = await fetch(`/api/comments/${commentId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      toast.success("Comment deleted successfully.");
    } else {
      setComments(originalComments);
      toast.error("Failed to delete comment.");
    }
  };

  const displayedComments = showAllComments ? comments : comments.slice(0, 10);

  return (
    <div className="w-full">
      <h2 className="text-3xl font-bold mb-6 text-white">My Comments</h2>
      {isLoading ? (
        <p className="text-gray-400">Loading your comments...</p>
      ) : comments.length > 0 ? (
        <>
          <div className="space-y-4">
            {displayedComments.map((comment) => (
              <div key={comment.id} className="bg-gray-800/50 p-4 rounded-lg flex justify-between items-center">
                <div>
                  <p className="text-gray-300">"{comment.content}"</p>
                  <Link href={`/novel/${comment.novelSlug}`} className="text-xs text-gray-200 hover:underline mt-2 block">
                    on novel: {comment.novelSlug.replace(/-/g, " ")}
                  </Link>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="icon">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>This will permanently delete your comment.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(comment.id)}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </div>

          {!showAllComments && comments.length > 10 && (
            <div className="text-center mt-8">
              <Button variant="secondary" onClick={() => setShowAllComments(true)}>
                View All Comments ({comments.length})
              </Button>
            </div>
          )}
        </>
      ) : (
        <p className="text-gray-400">You haven't made any comments yet.</p>
      )}
    </div>
  );
};
