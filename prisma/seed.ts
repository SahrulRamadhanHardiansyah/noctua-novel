import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient();

const ACHIEVEMENTS = [
  { key: "first_step", title: "First Step", description: "Read your very first chapter", icon: "Footprints", category: "reading", requirement: 1, coinReward: 10, titleReward: null, xpReward: 25 },
  { key: "night_owl", title: "Night Owl", description: "Read a chapter after midnight", icon: "Moon", category: "reading", requirement: 1, coinReward: 20, titleReward: "Night Owl", xpReward: 50 },
  { key: "early_bird", title: "Early Bird", description: "Read a chapter before 6 AM", icon: "Sunrise", category: "reading", requirement: 1, coinReward: 20, titleReward: "Early Bird", xpReward: 50 },
  { key: "marathon_reader", title: "Marathon Reader", description: "Read 10 chapters in a single day", icon: "Zap", category: "reading", requirement: 10, coinReward: 100, titleReward: "Marathon Reader", xpReward: 200 },
  { key: "bookworm", title: "Bookworm", description: "Read 50 chapters total", icon: "BookOpen", category: "reading", requirement: 50, coinReward: 200, titleReward: "The Bookworm", xpReward: 500 },
  { key: "genre_explorer", title: "Genre Explorer", description: "Read novels from 5 different genres", icon: "Compass", category: "reading", requirement: 5, coinReward: 75, titleReward: "Genre Explorer", xpReward: 150 },
  { key: "coin_collector", title: "Coin Collector", description: "Accumulate 500 coins", icon: "Coins", category: "reading", requirement: 500, coinReward: 0, titleReward: "Coin Collector", xpReward: 100 },
  { key: "first_review", title: "Critic", description: "Write your first review", icon: "Star", category: "social", requirement: 1, coinReward: 15, titleReward: "The Critic", xpReward: 30 },
  { key: "social_butterfly", title: "Social Butterfly", description: "Post 10 comments", icon: "MessageSquare", category: "social", requirement: 10, coinReward: 50, titleReward: "Social Butterfly", xpReward: 100 },
  { key: "quote_collector", title: "Quote Collector", description: "Save 5 quotes from chapters", icon: "Quote", category: "social", requirement: 5, coinReward: 25, titleReward: "Quote Collector", xpReward: 50 },
  { key: "streak_7", title: "Week Warrior", description: "Maintain a 7-day check-in streak", icon: "Flame", category: "streak", requirement: 7, coinReward: 100, titleReward: "Week Warrior", xpReward: 150 },
  { key: "author_debut", title: "Author Debut", description: "Publish your first novel", icon: "PenTool", category: "author", requirement: 1, coinReward: 50, titleReward: "The Author", xpReward: 100 },
];

const BORDERS = [
  { key: "none", name: "No Border", description: "Default appearance", cssClass: "", requiredLvl: 0, rarity: "common" },
  { key: "bronze_frame", name: "Bronze Frame", description: "Unlocked at Level 5", cssClass: "ring-2 ring-amber-700/60 shadow-[0_0_8px_rgba(180,120,60,0.3)]", requiredLvl: 5, rarity: "common" },
  { key: "silver_frame", name: "Silver Frame", description: "Unlocked at Level 10", cssClass: "ring-2 ring-slate-400/60 shadow-[0_0_10px_rgba(148,163,184,0.3)] bg-gradient-to-br from-slate-300/10 to-slate-500/10", requiredLvl: 10, rarity: "rare" },
  { key: "golden_glow", name: "Golden Glow", description: "Unlocked at Level 20", cssClass: "ring-2 ring-amber-400/70 shadow-[0_0_15px_rgba(251,191,36,0.4)] animate-pulse", requiredLvl: 20, rarity: "epic" },
  { key: "violet_aura", name: "Violet Aura", description: "Unlocked at Level 35", cssClass: "ring-2 ring-violet-400/70 shadow-[0_0_20px_rgba(139,92,246,0.5)] bg-gradient-to-br from-violet-500/10 to-purple-500/10", requiredLvl: 35, rarity: "epic" },
  { key: "diamond_crown", name: "Diamond Crown", description: "Unlocked at Level 50", cssClass: "ring-2 ring-cyan-300/80 shadow-[0_0_25px_rgba(103,232,249,0.6)] bg-gradient-to-r from-cyan-400/10 via-violet-400/10 to-pink-400/10 animate-pulse", requiredLvl: 50, rarity: "legendary" },
];

async function main() {
  console.log("🎮 Seeding achievements...");

  for (const ach of ACHIEVEMENTS) {
    try {
      await prisma.achievement.upsert({
        where: { key: ach.key },
        update: {
          title: ach.title,
          description: ach.description,
          icon: ach.icon,
          category: ach.category,
          requirement: ach.requirement,
          coinReward: ach.coinReward,
          titleReward: ach.titleReward,
          xpReward: ach.xpReward,
        },
        create: ach,
      });
      console.log(`  ✅ ${ach.title} (+${ach.xpReward} XP, +${ach.coinReward} coins${ach.titleReward ? `, title: "${ach.titleReward}"` : ""})`);
    } catch (err) {
      console.error(`  ❌ Failed to seed "${ach.key}":`, err);
    }
  }

  console.log(`\n🎨 Seeding profile borders...`);

  for (const b of BORDERS) {
    try {
      await prisma.profileBorder.upsert({
        where: { key: b.key },
        update: { name: b.name, description: b.description, cssClass: b.cssClass, requiredLvl: b.requiredLvl, rarity: b.rarity },
        create: b,
      });
      console.log(`  ✅ ${b.name} (${b.rarity}, Lv${b.requiredLvl})`);
    } catch (err) {
      console.error(`  ❌ Failed to seed border "${b.key}":`, err);
    }
  }

  // Verify
  const count = await prisma.achievement.count();
  console.log(`\n✅ Done! ${count} achievements in database.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
