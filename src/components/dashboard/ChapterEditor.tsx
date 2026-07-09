"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Bold,
  Italic,
  Minus,
  Image as ImageIcon,
  Save,
  Send,
  Clock,
  Lock,
  CheckCircle2,
} from "lucide-react";

interface ChapterData {
  id: string;
  title: string;
  content: string;
  orderIndex: number;
  isDraft: boolean;
  isLocked: boolean;
  coinPrice: number | null;
  scheduledAt: string | null;
}

interface ChapterEditorProps {
  novelId: string;
  chapter?: ChapterData;
}

export default function ChapterEditor({ novelId, chapter }: ChapterEditorProps) {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [title, setTitle] = useState(chapter?.title ?? "");
  const [content, setContent] = useState(chapter?.content ?? "");
  const [orderIndex, setOrderIndex] = useState(chapter?.orderIndex ?? 1);
  const [isDraft, setIsDraft] = useState(chapter?.isDraft ?? true);
  const [isLocked, setIsLocked] = useState(chapter?.isLocked ?? false);
  const [coinPrice, setCoinPrice] = useState(chapter?.coinPrice ?? 0);
  const [scheduledAt, setScheduledAt] = useState(chapter?.scheduledAt ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const isEditing = !!chapter;

  // ponytail: simple split-on-whitespace word count, good enough
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  // --- Toolbar helpers ---
  const wrapSelection = (before: string, after: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = content.substring(start, end);
    const newContent =
      content.substring(0, start) + before + selected + after + content.substring(end);
    setContent(newContent);
    // Restore cursor after the wrap
    requestAnimationFrame(() => {
      ta.focus();
      ta.selectionStart = start + before.length;
      ta.selectionEnd = end + before.length;
    });
  };

  const insertAtCursor = (text: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const pos = ta.selectionStart;
    setContent(content.substring(0, pos) + text + content.substring(pos));
    requestAnimationFrame(() => {
      ta.focus();
      ta.selectionStart = ta.selectionEnd = pos + text.length;
    });
  };

  const handleBold = () => wrapSelection("**", "**");
  const handleItalic = () => wrapSelection("*", "*");
  const handleSceneBreak = () => insertAtCursor("\n\n---\n\n");
  const handleInsertImage = () => {
    const url = prompt("Enter image URL:");
    if (url) insertAtCursor(`\n\n![Image](${url})\n\n`);
  };

  // --- Auto-save (only when editing an existing chapter) ---
  const doAutoSave = useCallback(async () => {
    if (!chapter?.id || !content) return;
    try {
      await fetch("/api/chapter-autosave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chapterId: chapter.id, content, title }),
      });
      setLastSaved(new Date());
    } catch {
      // ponytail: silent fail on autosave, user has manual save
    }
  }, [chapter?.id, content, title]);

  // Debounced auto-save: 30s after last content change
  useEffect(() => {
    if (!isEditing) return;
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(doAutoSave, 30_000);
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [content, title, doAutoSave, isEditing]);

  // --- Save / Publish ---
  const handleSave = async (publishMode: "draft" | "publish") => {
    if (!title.trim()) return toast.error("Title is required");
    if (!content.trim()) return toast.error("Content is required");

    setIsSaving(true);
    try {
      if (isEditing) {
        // UPDATE existing chapter via PUT /api/chapter-autosave
        const res = await fetch("/api/chapter-autosave", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chapterId: chapter.id,
            title: title.trim(),
            content: content.trim(),
            isDraft: publishMode === "draft",
            isLocked,
            coinPrice: isLocked ? coinPrice : 0,
            scheduledAt: scheduledAt || null,
          }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to update chapter");
        }
        toast.success(publishMode === "draft" ? "Draft saved!" : "Chapter updated!");
      } else {
        // CREATE new chapter via POST /api/user-chapter
        const res = await fetch("/api/user-chapter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            novelId,
            title: title.trim(),
            content: content.trim(),
            orderIndex,
            isDraft: publishMode === "draft",
            isLocked,
            coinPrice: isLocked ? coinPrice : 0,
            scheduledAt: scheduledAt || null,
          }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to create chapter");
        }
        toast.success(publishMode === "draft" ? "Draft saved!" : "Chapter published!");
        router.push(`/dashboard/novel/${novelId}`);
        router.refresh();
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const toolbarBtn =
    "p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors";

  return (
    <div className="space-y-6">
      {/* Header row: chapter number + title */}
      <div className="flex gap-4">
        <div className="w-28">
          <label className="block text-sm font-medium text-gray-400 mb-2">Chapter #</label>
          <input
            type="number"
            min={0}
            step={1}
            value={orderIndex}
            onChange={(e) => setOrderIndex(parseInt(e.target.value) || 0)}
            disabled={isEditing}
            className="w-full bg-gray-950 border border-gray-800 rounded-lg p-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-400 mb-2">Chapter Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. The Beginning"
            className="w-full bg-gray-950 border border-gray-800 rounded-lg p-4 text-white text-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-xl p-2">
        <button type="button" onClick={handleBold} className={toolbarBtn} title="Bold">
          <Bold className="w-4 h-4" />
        </button>
        <button type="button" onClick={handleItalic} className={toolbarBtn} title="Italic">
          <Italic className="w-4 h-4" />
        </button>
        <button type="button" onClick={handleSceneBreak} className={toolbarBtn} title="Scene Break">
          <Minus className="w-4 h-4" />
        </button>
        <button type="button" onClick={handleInsertImage} className={toolbarBtn} title="Insert Image">
          <ImageIcon className="w-4 h-4" />
        </button>

        <div className="flex-1" />

        {/* Word count */}
        <span className="text-sm text-gray-500 mr-2">{wordCount.toLocaleString()} words</span>

        {/* Auto-save indicator */}
        {lastSaved && (
          <span className="flex items-center gap-1.5 text-xs text-green-400/70">
            <CheckCircle2 className="w-3 h-3" />
            Saved {lastSaved.toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Content textarea */}
      <textarea
        ref={textareaRef}
        rows={30}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your chapter content here... (Markdown supported)"
        className="w-full bg-gray-950 border border-gray-800 rounded-xl p-6 text-white font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y min-h-[500px]"
      />

      {/* Options row */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Publishing Options</h3>

        {/* Scheduled publishing */}
        <div className="flex items-center gap-4">
          <Clock className="w-4 h-4 text-gray-500" />
          <label className="text-sm text-gray-400 w-40">Schedule Publish</label>
          <input
            type="datetime-local"
            value={scheduledAt ? scheduledAt.substring(0, 16) : ""}
            onChange={(e) => setScheduledAt(e.target.value ? new Date(e.target.value).toISOString() : "")}
            className="bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Premium chapter */}
        <div className="flex items-center gap-4">
          <Lock className="w-4 h-4 text-gray-500" />
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isLocked}
              onChange={(e) => setIsLocked(e.target.checked)}
              className="w-4 h-4 rounded border-gray-600 bg-gray-950 text-primary focus:ring-primary/50"
            />
            <span className="text-sm text-gray-400">Premium Chapter (requires coins to unlock)</span>
          </label>
          {isLocked && (
            <input
              type="number"
              min={1}
              value={coinPrice}
              onChange={(e) => setCoinPrice(parseInt(e.target.value) || 0)}
              placeholder="Coin price"
              className="w-28 bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          variant="outline"
          onClick={() => handleSave("draft")}
          disabled={isSaving}
          className="gap-2"
        >
          <Save className="w-4 h-4" />
          {isSaving ? "Saving..." : "Save Draft"}
        </Button>
        <Button
          onClick={() => handleSave("publish")}
          disabled={isSaving}
          className="gap-2"
        >
          <Send className="w-4 h-4" />
          {isSaving ? "Publishing..." : isEditing ? "Update Chapter" : "Publish Chapter"}
        </Button>
      </div>
    </div>
  );
}
