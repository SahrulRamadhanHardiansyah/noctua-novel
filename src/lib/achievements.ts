/**
 * Achievement definitions and unlock logic.
 * Seed these into the database on first run.
 */

export const ACHIEVEMENT_DEFS = [
  {
    key: "night_owl",
    title: "Night Owl",
    description: "Read a chapter after midnight",
    icon: "Moon",
    category: "reading",
    requirement: 1,
  },
  {
    key: "marathon_reader",
    title: "Marathon Reader",
    description: "Read 10 chapters in a single day",
    icon: "Zap",
    category: "reading",
    requirement: 10,
  },
  {
    key: "first_review",
    title: "Critic",
    description: "Write your first review",
    icon: "Star",
    category: "social",
    requirement: 1,
  },
  {
    key: "bookworm",
    title: "Bookworm",
    description: "Read 50 chapters total",
    icon: "BookOpen",
    category: "reading",
    requirement: 50,
  },
  {
    key: "social_butterfly",
    title: "Social Butterfly",
    description: "Post 10 comments",
    icon: "MessageSquare",
    category: "social",
    requirement: 10,
  },
  {
    key: "streak_7",
    title: "Week Warrior",
    description: "Maintain a 7-day check-in streak",
    icon: "Flame",
    category: "streak",
    requirement: 7,
  },
  {
    key: "coin_collector",
    title: "Coin Collector",
    description: "Accumulate 500 coins",
    icon: "Coins",
    category: "reading",
    requirement: 500,
  },
  {
    key: "author_debut",
    title: "Author Debut",
    description: "Publish your first novel",
    icon: "PenTool",
    category: "author",
    requirement: 1,
  },
  {
    key: "early_bird",
    title: "Early Bird",
    description: "Read a chapter before 6 AM",
    icon: "Sunrise",
    category: "reading",
    requirement: 1,
  },
  {
    key: "genre_explorer",
    title: "Genre Explorer",
    description: "Read novels from 5 different genres",
    icon: "Compass",
    category: "reading",
    requirement: 5,
  },
] as const;
