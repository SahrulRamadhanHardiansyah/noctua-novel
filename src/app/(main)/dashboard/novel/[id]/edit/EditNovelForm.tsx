"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EditNovelForm({ novel }: { novel: any }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: novel.title,
    synopsis: novel.synopsis || "",
    imageUrl: novel.imageUrl || "",
    genres: novel.genres.join(", "),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/user-novel", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: novel.id,
          ...formData,
          genres: formData.genres.split(",").map((g: string) => g.trim()).filter(Boolean),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update novel");
      }

      toast.success("Novel updated successfully!");
      router.push(`/dashboard/novel/${novel.id}`);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-950 min-h-screen text-gray-300 pt-24 pb-16">
      <div className="container mx-auto px-6 md:px-16 lg:px-36">
        <Link href={`/dashboard/novel/${novel.id}`} className="inline-flex items-center text-sm font-medium text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Novel Details
        </Link>

        <div className="max-w-3xl mx-auto bg-gray-900 shadow-xl shadow-black/50 p-8 md:p-12 rounded-2xl border border-gray-800">
          <div className="mb-8 border-b border-gray-800 pb-6">
            <h1 className="text-3xl font-bold text-white mb-2">Edit Novel</h1>
            <p className="text-gray-400">Update the details of "{novel.title}".</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-2">Title <span className="text-red-500">*</span></label>
                <input
                  required
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-2">Image URL (Optional)</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-2">Genres (Optional)</label>
                <input
                  type="text"
                  value={formData.genres}
                  onChange={(e) => setFormData({ ...formData, genres: e.target.value })}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  placeholder="Fantasy, Action, Adventure (comma separated)"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-2">Synopsis</label>
                <textarea
                  rows={6}
                  value={formData.synopsis}
                  onChange={(e) => setFormData({ ...formData, synopsis: e.target.value })}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-y transition-all leading-relaxed"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-gray-800 flex justify-end gap-4">
              <Link href={`/dashboard/novel/${novel.id}`}>
                <Button variant="outline" type="button" className="w-full md:w-auto text-base">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" size="lg" className="w-full md:w-auto md:min-w-[200px] text-base font-semibold" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
