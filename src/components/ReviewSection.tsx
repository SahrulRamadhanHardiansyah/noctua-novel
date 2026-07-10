"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Image from "next/image";

type Review = {
  id: string;
  userId: string;
  authorName: string;
  authorImageUrl: string | null;
  rating: number;
  title: string | null;
  content: string;
  createdAt: string;
};

function StarRating({
  value,
  onChange,
  size = "md",
}: {
  value: number;
  onChange?: (v: number) => void;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClass = size === "sm" ? "w-4 h-4" : size === "lg" ? "w-7 h-7" : "w-5 h-5";
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange?.(i)}
          className={onChange ? "cursor-pointer" : "cursor-default"}
          disabled={!onChange}
        >
          <Star
            className={`${sizeClass} transition ${
              i <= value
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-600"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function ReviewSection({ novelId }: { novelId: string }) {
  const { user } = useUser();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ rating: 5, title: "", content: "" });

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews?novelId=${novelId}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
        setAverageRating(data.averageRating || 0);
        setTotalReviews(data.totalReviews || 0);
      }
    } catch {
      toast.error("Failed to load reviews");
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [novelId]);

  const userReview = user
    ? reviews.find((r) => r.userId === user.id)
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.content.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ novelId, ...form }),
      });
      if (res.ok) {
        toast.success(userReview ? "Review updated!" : "Review submitted!");
        // Trigger achievement check
        fetch("/api/achievements", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ trigger: "review_posted", value: 1 }),
        }).catch(() => {});
        setShowForm(false);
        setForm({ rating: 5, title: "", content: "" });
        await fetchReviews();
      }
    } catch {
      toast.error("Failed to submit review");
    }
    setIsSubmitting(false);
  };

  const handleDelete = async () => {
    try {
      const res = await fetch("/api/reviews", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ novelId }),
      });
      if (res.ok) {
        toast.success("Review deleted");
        await fetchReviews();
      }
    } catch {
      toast.error("Failed to delete review");
    }
  };

  // Rating breakdown
  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    pct: totalReviews > 0
      ? Math.round(
          (reviews.filter((r) => r.rating === star).length / totalReviews) * 100
        )
      : 0,
  }));

  return (
    <section className="py-12">
      <h2 className="text-3xl font-bold mb-8 text-white">Reviews & Ratings</h2>

      {/* Overview */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-8 mb-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Average */}
          <div className="flex flex-col items-center justify-center gap-2 md:pr-8 md:border-r border-gray-800">
            <span className="text-5xl font-bold text-white">
              {averageRating.toFixed(1)}
            </span>
            <StarRating value={Math.round(averageRating)} size="lg" />
            <span className="text-sm text-gray-400">
              {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
            </span>
          </div>

          {/* Breakdown */}
          <div className="flex-1 space-y-2">
            {ratingCounts.map(({ star, count, pct }) => (
              <div key={star} className="flex items-center gap-3">
                <span className="text-sm text-gray-400 w-6 text-right">
                  {star}
                </span>
                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                <div className="flex-1 bg-gray-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-yellow-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-12">
                  {count} ({pct}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Write / Edit Review */}
      {user && (
        <div className="mb-8">
          {!showForm ? (
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  if (userReview) {
                    setForm({
                      rating: userReview.rating,
                      title: userReview.title || "",
                      content: userReview.content,
                    });
                  }
                  setShowForm(true);
                }}
              >
                {userReview ? "Edit Your Review" : "Write a Review"}
              </Button>
              {userReview && (
                <Button variant="destructive" size="sm" onClick={handleDelete}>
                  <Trash2 className="w-4 h-4 mr-1" /> Delete
                </Button>
              )}
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Your Rating
                </label>
                <StarRating
                  value={form.rating}
                  onChange={(v) => setForm({ ...form, rating: v })}
                  size="lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Title (Optional)
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Summarize your review..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Review
                </label>
                <Textarea
                  value={form.content}
                  onChange={(e) =>
                    setForm({ ...form, content: e.target.value })
                  }
                  rows={4}
                  className="bg-gray-950 border-gray-800 text-white"
                  placeholder="Share your thoughts about this novel..."
                />
              </div>
              <div className="flex gap-3">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Review"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Review List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-gray-500">
            No reviews yet. Be the first to review!
          </p>
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              className="bg-gray-900/50 border border-gray-800 rounded-xl p-5"
            >
              <div className="flex items-start gap-4">
                {review.authorImageUrl ? (
                  <Image
                    src={review.authorImageUrl}
                    alt=""
                    width={40}
                    height={40}
                    className="rounded-full flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-700 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-semibold text-white">
                      {review.authorName}
                    </span>
                    <StarRating value={review.rating} size="sm" />
                    <span className="text-xs text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {review.title && (
                    <h4 className="font-medium text-white mb-1">
                      {review.title}
                    </h4>
                  )}
                  <p className="text-gray-300 text-sm whitespace-pre-wrap">
                    {review.content}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
