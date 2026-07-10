/**
 * Noctua Novel — Gamification & Leveling Engine
 *
 * XP Sources:
 *   - Read a chapter:  10 XP
 *   - Daily check-in:  5 XP + streak bonus
 *   - Post a comment:  3 XP
 *   - Write a review:  15 XP
 *   - Save a quote:    2 XP
 *   - Achievement:     xpReward from Achievement table
 *
 * Level Curve: quadratic — each level requires more XP than the last.
 *   Level N requires: floor(100 * N^1.5) total XP
 *
 * Border Unlocks:
 *   Level 5  → "Bronze Frame"   (common)
 *   Level 10 → "Silver Frame"   (rare)
 *   Level 20 → "Golden Glow"    (epic)
 *   Level 35 → "Violet Aura"    (epic)
 *   Level 50 → "Diamond Crown"  (legendary)
 */

import prisma from "@/lib/prisma";
import { toast } from "sonner";

// ─── XP Rewards ──────────────────────────────────────────────────────────────
export const XP_REWARDS = {
  chapter_read: 10,
  daily_checkin: 5,
  comment_posted: 3,
  review_posted: 15,
  quote_saved: 2,
} as const;

// ─── Level Curve ─────────────────────────────────────────────────────────────
/** Total XP required to reach a given level */
export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.floor(100 * Math.pow(level, 1.5));
}

/** XP required to go from current level to next level */
export function xpToNextLevel(currentLevel: number): number {
  return xpForLevel(currentLevel + 1) - xpForLevel(currentLevel);
}

/** Calculate level from total XP */
export function calculateLevel(totalXp: number): number {
  let level = 1;
  while (xpForLevel(level + 1) <= totalXp) {
    level++;
  }
  return level;
}

/** Get progress percentage within current level */
export function levelProgress(totalXp: number, currentLevel: number): number {
  const currentLevelXp = xpForLevel(currentLevel);
  const nextLevelXp = xpForLevel(currentLevel + 1);
  const xpIntoLevel = totalXp - currentLevelXp;
  const xpNeeded = nextLevelXp - currentLevelXp;
  return xpNeeded > 0 ? Math.min(100, Math.round((xpIntoLevel / xpNeeded) * 100)) : 100;
}

// ─── Border Definitions ──────────────────────────────────────────────────────
export const BORDER_DEFS = [
  {
    key: "none",
    name: "No Border",
    description: "Default appearance",
    cssClass: "",
    requiredLvl: 0,
    rarity: "common",
  },
  {
    key: "bronze_frame",
    name: "Bronze Frame",
    description: "Unlocked at Level 5",
    cssClass: "ring-2 ring-amber-700/60 shadow-[0_0_8px_rgba(180,120,60,0.3)]",
    requiredLvl: 5,
    rarity: "common",
  },
  {
    key: "silver_frame",
    name: "Silver Frame",
    description: "Unlocked at Level 10",
    cssClass: "ring-2 ring-slate-400/60 shadow-[0_0_10px_rgba(148,163,184,0.3)] bg-gradient-to-br from-slate-300/10 to-slate-500/10",
    requiredLvl: 10,
    rarity: "rare",
  },
  {
    key: "golden_glow",
    name: "Golden Glow",
    description: "Unlocked at Level 20",
    cssClass: "ring-2 ring-amber-400/70 shadow-[0_0_15px_rgba(251,191,36,0.4)] animate-pulse",
    requiredLvl: 20,
    rarity: "epic",
  },
  {
    key: "violet_aura",
    name: "Violet Aura",
    description: "Unlocked at Level 35",
    cssClass: "ring-2 ring-violet-400/70 shadow-[0_0_20px_rgba(139,92,246,0.5)] bg-gradient-to-br from-violet-500/10 to-purple-500/10",
    requiredLvl: 35,
    rarity: "epic",
  },
  {
    key: "diamond_crown",
    name: "Diamond Crown",
    description: "Unlocked at Level 50 — Legendary",
    cssClass: "ring-2 ring-cyan-300/80 shadow-[0_0_25px_rgba(103,232,249,0.6)] bg-gradient-to-r from-cyan-400/10 via-violet-400/10 to-pink-400/10 animate-pulse",
    requiredLvl: 50,
    rarity: "legendary",
  },
] as const;

// ─── Core: Award XP and Handle Level-Up ──────────────────────────────────────
export interface XpResult {
  xpGained: number;
  totalXp: number;
  newLevel: number;
  oldLevel: number;
  leveledUp: boolean;
  newBorders: string[];
  unlockedTitle?: string;
}

/**
 * Award XP to a user. Handles level calculation, border unlocks, and returns result.
 */
export async function awardXp(
  userId: string,
  amount: number,
  reason: string
): Promise<XpResult> {
  const profile = await prisma.userProfile.upsert({
    where: { userId },
    update: {},
    create: { userId, displayName: "User" },
  });

  const oldLevel = profile.level;
  const newTotalXp = profile.xp + amount;
  const newLevel = calculateLevel(newTotalXp);
  const leveledUp = newLevel > oldLevel;

  // Update profile
  await prisma.userProfile.update({
    where: { userId },
    data: { xp: newTotalXp, level: newLevel },
  });

  // If leveled up, unlock new borders
  const newBorders: string[] = [];
  if (leveledUp) {
    for (const border of BORDER_DEFS) {
      if (border.requiredLvl > oldLevel && border.requiredLvl <= newLevel) {
        // Upsert the border definition
        await prisma.profileBorder.upsert({
          where: { key: border.key },
          update: {},
          create: {
            key: border.key,
            name: border.name,
            description: border.description,
            cssClass: border.cssClass,
            requiredLvl: border.requiredLvl,
            rarity: border.rarity,
          },
        });
        const borderRecord = await prisma.profileBorder.findUnique({ where: { key: border.key } });
        if (borderRecord) {
          await prisma.userBorder.upsert({
            where: { userId_borderId: { userId, borderId: borderRecord.id } },
            update: {},
            create: { userId, borderId: borderRecord.id },
          });
          newBorders.push(border.name);
        }
      }
    }
  }

  return {
    xpGained: amount,
    totalXp: newTotalXp,
    newLevel,
    oldLevel,
    leveledUp,
    newBorders,
  };
}

/**
 * Client-side: call the XP API and show toast notifications for level-ups.
 */
export async function grantXpClient(trigger: string): Promise<XpResult | null> {
  try {
    const res = await fetch("/api/gamification/xp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trigger }),
    });
    if (!res.ok) return null;
    const data: XpResult = await res.json();

    if (data.leveledUp) {
      toast.success(`🎉 Level Up! You are now Level ${data.newLevel}!`, {
        duration: 5000,
      });
      if (data.newBorders.length > 0) {
        toast.info(`New border unlocked: ${data.newBorders.join(", ")}!`, {
          duration: 4000,
        });
      }
    }

    return data;
  } catch {
    return null;
  }
}
