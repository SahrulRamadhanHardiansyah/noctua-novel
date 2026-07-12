/**
 * Unit Tests — Gamification & Leveling System
 *
 * Tests the pure functions in lib/gamification.ts:
 * - xpForLevel: total XP required for a given level
 * - calculateLevel: level from total XP
 * - levelProgress: percentage within current level
 * - xpToNextLevel: XP needed for next level
 */

import { xpForLevel, calculateLevel, levelProgress, xpToNextLevel } from "@/lib/gamification";

describe("Gamification Engine", () => {
  // ─── xpForLevel ────────────────────────────────────────────────────────
  describe("xpForLevel", () => {
    it("should return 0 for level 1", () => {
      expect(xpForLevel(1)).toBe(0);
    });

    it("should return positive XP for level > 1", () => {
      expect(xpForLevel(2)).toBeGreaterThan(0);
    });

    it("should increase monotonically", () => {
      for (let i = 2; i <= 50; i++) {
        expect(xpForLevel(i)).toBeGreaterThan(xpForLevel(i - 1));
      }
    });

    it("should match quadratic formula: floor(100 * N^1.5)", () => {
      expect(xpForLevel(5)).toBe(Math.floor(100 * Math.pow(5, 1.5)));
      expect(xpForLevel(10)).toBe(Math.floor(100 * Math.pow(10, 1.5)));
      expect(xpForLevel(50)).toBe(Math.floor(100 * Math.pow(50, 1.5)));
    });
  });

  // ─── calculateLevel ────────────────────────────────────────────────────
  describe("calculateLevel", () => {
    it("should return level 1 for 0 XP", () => {
      expect(calculateLevel(0)).toBe(1);
    });

    it("should return level 1 for small XP", () => {
      expect(calculateLevel(50)).toBe(1);
      expect(calculateLevel(99)).toBe(1);
    });

    it("should level up when XP reaches threshold", () => {
      const level2Xp = xpForLevel(2);
      expect(calculateLevel(level2Xp)).toBe(2);
    });

    it("should handle multi-level jumps correctly", () => {
      // Give enough XP to skip multiple levels
      const level10Xp = xpForLevel(10);
      expect(calculateLevel(level10Xp)).toBe(10);

      // Just below level 10 threshold should be level 9
      expect(calculateLevel(level10Xp - 1)).toBe(9);
    });

    it("should handle large XP values", () => {
      const level = calculateLevel(100000);
      expect(level).toBeGreaterThan(1);
      expect(level).toBeLessThanOrEqual(100);
    });

    it("should be consistent with xpForLevel", () => {
      // For any level N, xpForLevel(N) should map back to level N
      for (let lvl = 1; lvl <= 30; lvl++) {
        const xp = xpForLevel(lvl);
        expect(calculateLevel(xp)).toBe(lvl);
      }
    });
  });

  // ─── levelProgress ─────────────────────────────────────────────────────
  describe("levelProgress", () => {
    it("should return 0% at the start of a level", () => {
      const xp = xpForLevel(5);
      expect(levelProgress(xp, 5)).toBe(0);
    });

    it("should return ~100% just before next level", () => {
      const xp = xpForLevel(6) - 1;
      const progress = levelProgress(xp, 5);
      expect(progress).toBeGreaterThan(90);
    });

    it("should be between 0 and 100", () => {
      for (let xp = 0; xp < 10000; xp += 100) {
        const level = calculateLevel(xp);
        const progress = levelProgress(xp, level);
        expect(progress).toBeGreaterThanOrEqual(0);
        expect(progress).toBeLessThanOrEqual(100);
      }
    });
  });

  // ─── xpToNextLevel ─────────────────────────────────────────────────────
  describe("xpToNextLevel", () => {
    it("should return positive number", () => {
      expect(xpToNextLevel(1)).toBeGreaterThan(0);
    });

    it("should increase per level (harder to level up)", () => {
      expect(xpToNextLevel(10)).toBeGreaterThan(xpToNextLevel(1));
    });
  });

  // ─── Multi-level jump scenario ─────────────────────────────────────────
  describe("multi-level jump", () => {
    it("should correctly identify all levels crossed", () => {
      const oldLevel = 1;
      const newXp = xpForLevel(10);
      const newLevel = calculateLevel(newXp);

      expect(newLevel).toBe(10);

      // Verify all intermediate levels exist
      const crossedLevels: number[] = [];
      for (let lvl = oldLevel + 1; lvl <= newLevel; lvl++) {
        crossedLevels.push(lvl);
      }
      expect(crossedLevels).toEqual([2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });
  });
});
