"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreateNovelPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    synopsis: "",
    imageUrl: "",
    genres: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/user-novel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          // Convert comma-separated string to array
          genres: formData.genres.split(",").map(g => g.trim()).filter(Boolean),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create novel");
      }

      toast.success("Novel created successfully!");
      router.push("/dashboard");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#09090b] min-h-screen text-zinc-300 pt-24 pb-16">
      <div className="container mx-auto px-6 md:px-16 lg:px-36">
        <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-violet-400 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Link>

        <div className="max-w-3xl mx-auto bg-zinc-900/50 shadow-2xl shadow-black/20 p-8 md:p-12 rounded-2xl border border-white/[0.06]">
          <div className="mb-8 border-b border-white/[0.06] pb-6">
            <h1 className="text-3xl font-bold text-white mb-2">Create New Novel</h1>
            <p className="text-zinc-500">Fill in the details below to start your new masterpiece.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-2">Title <span className="text-red-500">*</span></label>
                <input
                  required
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-zinc-900/50 border border-white/[0.08] rounded-lg p-4 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/50 transition-all"
                  placeholder="e.g. My Awesome Light Novel"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-2">Image URL (Optional)</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full bg-zinc-900/50 border border-white/[0.08] rounded-lg p-4 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/50 transition-all"
                  placeholder="https://example.com/cover.jpg"
                />
                <p className="text-xs text-zinc-600 mt-2">Provide a direct link to an image. This will be used as the novel cover.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-2">Genres (Optional)</label>
                <input
                  type="text"
                  value={formData.genres}
                  onChange={(e) => setFormData({ ...formData, genres: e.target.value })}
                  className="w-full bg-zinc-900/50 border border-white/[0.08] rounded-lg p-4 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/50 transition-all"
                  placeholder="Fantasy, Action, Adventure (comma separated)"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-2">Synopsis</label>
                <textarea
                  rows={6}
                  value={formData.synopsis}
                  onChange={(e) => setFormData({ ...formData, synopsis: e.target.value })}
                  className="w-full bg-zinc-900/50 border border-white/[0.08] rounded-lg p-4 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/50 resize-y transition-all leading-relaxed"
                  placeholder="Write a catchy synopsis to attract readers..."
                />
              </div>
            </div>

            <div className="pt-6 border-t border-white/[0.06]">
              <Button type="submit" size="lg" className="w-full md:w-auto md:min-w-[200px] text-base font-semibold" disabled={isLoading}>
                {isLoading ? "Creating..." : "Publish Novel"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
