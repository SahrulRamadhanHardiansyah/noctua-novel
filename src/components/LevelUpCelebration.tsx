"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

interface LevelUpData {
  oldLevel: number;
  newLevel: number;
  newBorders: string[];
}

export default function LevelUpCelebration() {
  const [data, setData] = useState<LevelUpData | null>(null);

  useEffect(() => {
    const handler = (e: CustomEvent<LevelUpData>) => {
      setData(e.detail);
      setTimeout(() => setData(null), 4000);
    };
    window.addEventListener("noctua-level-up" as any, handler);
    return () => window.removeEventListener("noctua-level-up" as any, handler);
  }, []);

  return (
    <AnimatePresence>
      {data && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-none"
        >
          <motion.div
            initial={{ scale: 0.3, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: -30 }}
            transition={{ type: "spring", damping: 15, stiffness: 200 }}
            className="text-center"
          >
            {/* Sparkle burst */}
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 2, ease: "linear", repeat: Infinity }}
              className="mb-4"
            >
              <Sparkles className="w-16 h-16 text-amber-400 mx-auto" />
            </motion.div>

            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-5xl font-bold text-white mb-2"
            >
              Level Up!
            </motion.h2>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-2xl text-violet-300 font-semibold mb-4"
            >
              Level {data.oldLevel} → Level {data.newLevel}
            </motion.div>

            {data.newBorders.length > 0 && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="bg-violet-500/20 border border-violet-500/30 rounded-xl px-6 py-3 inline-block"
              >
                <p className="text-sm text-violet-200">
                  🎨 New border{data.newBorders.length > 1 ? "s" : ""} unlocked:{" "}
                  <span className="font-bold text-white">{data.newBorders.join(", ")}</span>
                </p>
              </motion.div>
            )}

            {/* Floating particles */}
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  x: 0,
                  y: 0,
                  opacity: 1,
                  scale: Math.random() * 0.5 + 0.5,
                }}
                animate={{
                  x: (Math.random() - 0.5) * 400,
                  y: (Math.random() - 0.5) * 400,
                  opacity: 0,
                  scale: 0,
                }}
                transition={{
                  duration: 1.5 + Math.random(),
                  delay: Math.random() * 0.5,
                  ease: "easeOut",
                }}
                className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full"
                style={{
                  background: ["#8b5cf6", "#f59e0b", "#06b6d4", "#ec4899", "#10b981"][i % 5],
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
