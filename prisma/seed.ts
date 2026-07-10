import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient();

const ACHIEVEMENTS = [
  { key: "first_step", title: "First Step", description: "Read your very first chapter", icon: "Footprints", category: "reading", requirement: 1 },
  { key: "night_owl", title: "Night Owl", description: "Read a chapter after midnight", icon: "Moon", category: "reading", requirement: 1 },
  { key: "early_bird", title: "Early Bird", description: "Read a chapter before 6 AM", icon: "Sunrise", category: "reading", requirement: 1 },
  { key: "marathon_reader", title: "Marathon Reader", description: "Read 10 chapters in a single day", icon: "Zap", category: "reading", requirement: 10 },
  { key: "bookworm", title: "Bookworm", description: "Read 50 chapters total", icon: "BookOpen", category: "reading", requirement: 50 },
  { key: "genre_explorer", title: "Genre Explorer", description: "Read novels from 5 different genres", icon: "Compass", category: "reading", requirement: 5 },
  { key: "coin_collector", title: "Coin Collector", description: "Accumulate 500 coins", icon: "Coins", category: "reading", requirement: 500 },
  { key: "first_review", title: "Critic", description: "Write your first review", icon: "Star", category: "social", requirement: 1 },
  { key: "social_butterfly", title: "Social Butterfly", description: "Post 10 comments", icon: "MessageSquare", category: "social", requirement: 10 },
  { key: "quote_collector", title: "Quote Collector", description: "Save 5 quotes from chapters", icon: "Quote", category: "social", requirement: 5 },
  { key: "streak_7", title: "Week Warrior", description: "Maintain a 7-day check-in streak", icon: "Flame", category: "streak", requirement: 7 },
  { key: "author_debut", title: "Author Debut", description: "Publish your first novel", icon: "PenTool", category: "author", requirement: 1 },
];

async function main() {
  console.log("Seeding achievements...");

  for (const ach of ACHIEVEMENTS) {
    await prisma.achievement.upsert({
      where: { key: ach.key },
      update: {
        title: ach.title,
        description: ach.description,
        icon: ach.icon,
        category: ach.category,
        requirement: ach.requirement,
      },
      create: ach,
    });
    console.log(`  ✓ ${ach.title}`);
  }

  console.log(`\nSeeded ${ACHIEVEMENTS.length} achievements.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
