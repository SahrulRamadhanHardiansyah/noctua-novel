import prisma from "@/lib/prisma";
import { ACHIEVEMENT_DEFS } from "@/lib/achievements";
import { awardXp } from "@/lib/gamification";

/**
 * Unlock or increment progress for an achievement.
 * Uses $transaction for atomicity: progress + unlock + coin/title rewards.
 * Returns the achievement title if newly unlocked, null otherwise.
 */
export async function unlockAchievement(
  userId: string,
  achievementKey: string,
  increment: number = 1
): Promise<string | null> {
  const def = ACHIEVEMENT_DEFS.find((a) => a.key === achievementKey);
  if (!def) return null;

  // Ensure achievement exists in DB
  const achievement = await prisma.achievement.upsert({
    where: { key: achievementKey },
    update: {},
    create: {
      key: def.key,
      title: def.title,
      description: def.description,
      icon: def.icon,
      category: def.category,
      requirement: def.requirement,
      coinReward: 0,
      xpReward: 50,
    },
  });

  // Check current progress
  const existing = await prisma.userAchievement.findUnique({
    where: { userId_achievementId: { userId, achievementId: achievement.id } },
  });

  // Already fully unlocked
  if (existing && existing.progress >= achievement.requirement) {
    return null;
  }

  const wasComplete = existing ? existing.progress >= achievement.requirement : false;
  const oldProgress = existing?.progress ?? 0;

  // Atomic transaction: update progress + grant rewards if just unlocked
  const result = await prisma.$transaction(async (tx) => {
    let userAchievement;

    if (existing) {
      userAchievement = await tx.userAchievement.update({
        where: { id: existing.id },
        data: { progress: { increment } },
      });
    } else {
      userAchievement = await tx.userAchievement.create({
        data: { userId, achievementId: achievement.id, progress: increment },
      });
    }

    const justUnlocked = userAchievement.progress >= achievement.requirement && oldProgress < achievement.requirement;

    if (justUnlocked) {
      // Grant coin reward
      if (achievement.coinReward > 0) {
        await tx.userProfile.update({
          where: { userId },
          data: {
            coinBalance: { increment: achievement.coinReward },
            totalEarnings: { increment: achievement.coinReward },
          },
        });
        await tx.coinTransaction.create({
          data: {
            userId,
            amount: achievement.coinReward,
            type: "achievement_reward",
            description: `Achievement unlocked: ${achievement.title}`,
          },
        });
      }

      // Grant title reward
      if (achievement.titleReward) {
        await tx.userTitle.upsert({
          where: { userId_title: { userId, title: achievement.titleReward } },
          update: {},
          create: { userId, title: achievement.titleReward, source: `achievement:${achievementKey}` },
        });
      }

      return achievement.title;
    }

    return null;
  });

  // Award XP outside transaction (gamification engine handles its own transaction)
  if (result) {
    await awardXp(userId, achievement.xpReward, `achievement:${achievementKey}`);
  }

  return result;
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
 * Includes coin and title rewards for each achievement.
 * Fault-tolerant: catches errors so API doesn't break if schema is out of sync.
 */
export async function seedAchievements() {
  const SEED_DATA = [
    { key: "first_step", coinReward: 10, titleReward: null, xpReward: 25 },
    { key: "night_owl", coinReward: 20, titleReward: "Night Owl", xpReward: 50 },
    { key: "early_bird", coinReward: 20, titleReward: "Early Bird", xpReward: 50 },
    { key: "marathon_reader", coinReward: 100, titleReward: "Marathon Reader", xpReward: 200 },
    { key: "bookworm", coinReward: 200, titleReward: "The Bookworm", xpReward: 500 },
    { key: "genre_explorer", coinReward: 75, titleReward: "Genre Explorer", xpReward: 150 },
    { key: "coin_collector", coinReward: 0, titleReward: "Coin Collector", xpReward: 100 },
    { key: "first_review", coinReward: 15, titleReward: "The Critic", xpReward: 30 },
    { key: "social_butterfly", coinReward: 50, titleReward: "Social Butterfly", xpReward: 100 },
    { key: "quote_collector", coinReward: 25, titleReward: "Quote Collector", xpReward: 50 },
    { key: "streak_7", coinReward: 100, titleReward: "Week Warrior", xpReward: 150 },
    { key: "author_debut", coinReward: 50, titleReward: "The Author", xpReward: 100 },
  ];

  try {
    for (const def of ACHIEVEMENT_DEFS) {
      const seed = SEED_DATA.find((s) => s.key === def.key);
      await prisma.achievement.upsert({
        where: { key: def.key },
        update: {
          title: def.title,
          description: def.description,
          icon: def.icon,
          category: def.category,
          requirement: def.requirement,
          coinReward: seed?.coinReward ?? 0,
          titleReward: seed?.titleReward ?? null,
          xpReward: seed?.xpReward ?? 50,
        },
        create: {
          key: def.key,
          title: def.title,
          description: def.description,
          icon: def.icon,
          category: def.category,
          requirement: def.requirement,
          coinReward: seed?.coinReward ?? 0,
          titleReward: seed?.titleReward ?? null,
          xpReward: seed?.xpReward ?? 50,
        },
      });
    }
  } catch (err) {
    console.error("[seedAchievements] Failed to seed — did you run `npx prisma db push`?", err);
    // Don't throw — let the API continue and return whatever exists in DB
  }
}
