import prisma from "@/lib/prisma";
import { ACHIEVEMENT_DEFS } from "@/lib/achievements";

/**
 * Unlock or increment progress for an achievement.
 * Returns the achievement title if newly unlocked, null otherwise.
 */
export async function unlockAchievement(
  userId: string,
  achievementKey: string,
  increment: number = 1
): Promise<string | null> {
  const def = ACHIEVEMENT_DEFS.find((a) => a.key === achievementKey);
  if (!def) return null;

  const achievement = await prisma.achievement.findUnique({
    where: { key: achievementKey },
  });
  if (!achievement) return null;

  const existing = await prisma.userAchievement.findUnique({
    where: {
      userId_achievementId: { userId, achievementId: achievement.id },
    },
  });

  // Already fully unlocked
  if (existing && existing.progress >= achievement.requirement) {
    return null;
  }

  if (existing) {
    const updated = await prisma.userAchievement.update({
      where: { id: existing.id },
      data: { progress: { increment } },
    });
    // Check if just unlocked
    if (updated.progress >= achievement.requirement && existing.progress < achievement.requirement) {
      return achievement.title;
    }
  } else {
    const created = await prisma.userAchievement.create({
      data: {
        userId,
        achievementId: achievement.id,
        progress: increment,
      },
    });
    if (created.progress >= achievement.requirement) {
      return achievement.title;
    }
  }

  return null;
}

/**
 * Check and unlock time-based achievements (Night Owl, Early Bird).
 * Call this when a user reads a chapter.
 */
export async function checkTimeBasedAchievements(userId: string): Promise<string[]> {
  const hour = new Date().getHours();
  const unlocked: string[] = [];

  // Night Owl: midnight to 5 AM
  if (hour >= 0 && hour < 5) {
    const result = await unlockAchievement(userId, "night_owl");
    if (result) unlocked.push(result);
  }

  // Early Bird: before 6 AM
  if (hour >= 0 && hour < 6) {
    const result = await unlockAchievement(userId, "early_bird");
    if (result) unlocked.push(result);
  }

  return unlocked;
}

/**
 * Seed all achievements into the database.
 * Call this on app startup or via API.
 */
export async function seedAchievements() {
  for (const def of ACHIEVEMENT_DEFS) {
    await prisma.achievement.upsert({
      where: { key: def.key },
      update: {
        title: def.title,
        description: def.description,
        icon: def.icon,
        category: def.category,
        requirement: def.requirement,
      },
      create: {
        key: def.key,
        title: def.title,
        description: def.description,
        icon: def.icon,
        category: def.category,
        requirement: def.requirement,
      },
    });
  }
}
