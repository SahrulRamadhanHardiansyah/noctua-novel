"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, Image as ImageIcon } from "lucide-react";
import Link from "next/link";

export default function CreateChapterPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  // Safe unwrapping for client components in next 15 if needed, but standard params still works for static structure mostly.
  const novelId = params.id;

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    orderIndex: "1",
  });

  const insertImageTag = () => {
    const url = prompt("Enter image URL:");
    if (url) {
      setFormData(prev => ({
        ...prev,
        content: prev.content + `\n\n![Image](${url})\n\n`
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/user-chapter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          novelId,
          ...formData,
          orderIndex: parseInt(formData.orderIndex, 10)
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create chapter");
      }

      toast.success("Chapter published!");
      router.push(`/dashboard/novel/${novelId}`);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-6 md:px-16 lg:px-36 py-24 min-h-screen">
      <Link href={`/dashboard/novel/${novelId}`} className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Novel
      </Link>

      <div className="max-w-4xl mx-auto bg-gray-900 p-8 rounded-xl border border-gray-800">
        <h1 className="text-2xl font-bold text-white mb-6">Write New Chapter</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex gap-4">
            <div className="w-24">
              <label className="block text-sm font-medium text-gray-300 mb-2">Ch. Number</label>
              <input
                required type="number" min="0" step="1"
                value={formData.orderIndex}
                onChange={(e) => setFormData({ ...formData, orderIndex: e.target.value })}
                className="w-full bg-gray-950 border border-gray-800 rounded-md p-3 text-white focus:outline-none focus:border-primary"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300 mb-2">Chapter Title</label>
              <input
                required type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-gray-950 border border-gray-800 rounded-md p-3 text-white focus:outline-none focus:border-primary"
                placeholder="e.g. The Beginning"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-end mb-2">
              <label className="block text-sm font-medium text-gray-300">Content</label>
              <Button type="button" variant="outline" size="sm" onClick={insertImageTag} className="h-8 gap-2">
                <ImageIcon className="w-3 h-3" /> Insert Image
              </Button>
            </div>
            <p className="text-xs text-gray-500 mb-2">Markdown is supported. Use the button above to insert images via URL.</p>
            <textarea
              required rows={20}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full bg-gray-950 border border-gray-800 rounded-md p-4 text-white focus:outline-none focus:border-primary resize-y font-mono text-sm leading-relaxed"
              placeholder="Write your chapter content here..."
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading} className="w-40">
              {isLoading ? "Publishing..." : "Publish Chapter"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
