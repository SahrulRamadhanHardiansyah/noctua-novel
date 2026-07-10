"use client";

import React, { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { X, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface QuoteExportModalProps {
  quoteText: string;
  source: string;
  onClose: () => void;
}

export default function QuoteExportModal({
  quoteText,
  source,
  onClose,
}: QuoteExportModalProps) {
  const [attribution, setAttribution] = useState(`— ${source}`);
  const [isExporting, setIsExporting] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      // Wait for fonts to load before rendering
      await document.fonts.ready;
      const html2canvas = (await import("html2canvas-pro")).default;
      const el = cardRef.current;
      const canvas = await html2canvas(el, {
        scale: 3, // 3x for crisp high-DPI output
        backgroundColor: "#0f0f12", // Explicit background to prevent transparency
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: el.offsetWidth,
        height: el.offsetHeight,
        windowWidth: el.scrollWidth,
        windowHeight: el.scrollHeight,
      });
      const link = document.createElement("a");
      link.download = `noctua-quote-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png", 1.0);
      link.click();
      toast.success("Quote image downloaded!");
    } catch {
      toast.error("Failed to export image");
    } finally {
      setIsExporting(false);
    }
  }, []);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-zinc-900 border border-white/[0.08] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
          <h3 className="text-lg font-semibold text-white">Export Quote</h3>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Attribution Input */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Attribution
            </label>
            <input
              type="text"
              value={attribution}
              onChange={(e) => setAttribution(e.target.value)}
              placeholder="— Character Name"
              className="w-full bg-zinc-800/50 border border-white/[0.08] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/50"
            />
            <p className="text-xs text-zinc-600 mt-1.5">
              Edit who said this quote (e.g. &ldquo;— Nephis to Sunny&rdquo;)
            </p>
          </div>

          {/* Quote Card Preview */}
          <div className="flex justify-center">
            <div
              ref={cardRef}
              className="w-[400px] rounded-2xl overflow-hidden shadow-2xl"
              style={{
                background:
                  "linear-gradient(145deg, #0f0f12 0%, #1a1128 40%, #0f0f12 100%)",
              }}
            >
              {/* Top decorative bar */}
              <div
                className="h-1.5"
                style={{
                  background:
                    "linear-gradient(90deg, #8b5cf6, #6d28d9, #4c1d95)",
                }}
              />

              <div className="px-10 py-12 flex flex-col items-center text-center">
                {/* Decorative quote marks */}
                <svg
                  className="w-10 h-10 text-violet-500/30 mb-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" />
                </svg>

                {/* Quote text */}
                <p
                  className="text-white/90 leading-relaxed mb-8"
                  style={{
                    fontFamily: "'Georgia', 'Times New Roman', serif",
                    fontSize: "17px",
                    fontStyle: "italic",
                    lineHeight: "1.8",
                    letterSpacing: "0.01em",
                  }}
                >
                  {quoteText}
                </p>

                {/* Divider */}
                <div className="w-12 h-px bg-violet-500/40 mb-6" />

                {/* Attribution */}
                {attribution && (
                  <p
                    className="text-violet-300/80 text-sm tracking-wide"
                    style={{
                      fontFamily: "'Georgia', 'Times New Roman', serif",
                    }}
                  >
                    {attribution}
                  </p>
                )}

                {/* Watermark */}
                <div className="mt-10 flex items-center gap-2 opacity-30">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                    />
                  </svg>
                  <span
                    className="text-white text-xs tracking-widest uppercase"
                    style={{ fontFamily: "sans-serif" }}
                  >
                    Noctua Novel
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleDownload}
              disabled={isExporting}
              className="gap-2"
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {isExporting ? "Exporting..." : "Download Image"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
