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
    <div className="container mx-auto px-6 md:px-16 lg:px-36 py-24 min-h-screen">
      <Link href="/dashboard" className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
      </Link>

      <div className="max-w-2xl mx-auto bg-gray-900 p-8 rounded-xl border border-gray-800">
        <h1 className="text-2xl font-bold text-white mb-6">Create New Novel</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Title <span className="text-red-500">*</span></label>
            <input
              required
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-gray-950 border border-gray-800 rounded-md p-3 text-white focus:outline-none focus:border-primary"
              placeholder="e.g. My Awesome Light Novel"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Image URL (Optional)</label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="w-full bg-gray-950 border border-gray-800 rounded-md p-3 text-white focus:outline-none focus:border-primary"
              placeholder="https://example.com/cover.jpg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Genres (Optional, comma separated)</label>
            <input
              type="text"
              value={formData.genres}
              onChange={(e) => setFormData({ ...formData, genres: e.target.value })}
              className="w-full bg-gray-950 border border-gray-800 rounded-md p-3 text-white focus:outline-none focus:border-primary"
              placeholder="Fantasy, Action, Adventure"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Synopsis</label>
            <textarea
              rows={5}
              value={formData.synopsis}
              onChange={(e) => setFormData({ ...formData, synopsis: e.target.value })}
              className="w-full bg-gray-950 border border-gray-800 rounded-md p-3 text-white focus:outline-none focus:border-primary resize-none"
              placeholder="Write a catchy synopsis..."
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Novel"}
          </Button>
        </form>
      </div>
    </div>
  );
}
