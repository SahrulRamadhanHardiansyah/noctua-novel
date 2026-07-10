<!-- ────────────────────────────────────────────────────────────────────────── -->
<!-- NOCTUA NOVEL — Enterprise-Grade Novel Reading Platform                      -->
<!-- ────────────────────────────────────────────────────────────────────────── -->

<div align="center">

<!-- Banner -->
![Noctua Novel Banner](https://github.com/user-attachments/assets/144c8923-3d60-4e95-94c9-87d1579c56a3)

# 🦉 Noctua Novel

**A next-generation novel reading platform with heavy gamification,  
aesthetic quote exports, and enterprise-grade architecture.**

*Read. Level Up. Collect. Create.*

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

[🔗 Live Preview](https://noctua-novel.vercel.app/) · [📖 Documentation](#-getting-started) · [🐛 Report Bug](https://github.com/SahrulRamadhanHardiansyah/noctua-novel/issues)

</div>

---

## 📸 Screenshots

<div align="center">

![Homepage](https://github.com/user-attachments/assets/87299d67-8660-47e8-8318-9bb1a80771de)

![Dashboard](https://github.com/user-attachments/assets/32846021-ef4e-4637-b5c1-0f92bc109f88)

</div>

---

## ✨ Key Features

### 🎮 Heavy Gamification System
- **XP & Leveling Engine** — Quadratic level curve (`floor(100 × N^1.5)`). Earn XP from reading, commenting, reviewing, and daily check-ins.
- **Dynamic Profile Borders** — 6 unlockable avatar border tiers: Bronze → Silver → Golden Glow → Violet Aura → Diamond Crown, each with unique CSS glow, gradient, and animation effects.
- **12 Achievements** — From *"First Step"* to *"Bookworm"*. Each achievement awards coins, XP, and a unique title/gelar.
- **Title/Gelar System** — Unlock titles like *"Night Owl"*, *"The Critic"*, *"Marathon Reader"* and equip them on your profile.
- **Level-Up Celebration** — Animated modal with spring physics and particle burst via Framer Motion.

### 📚 UGC & Author Studio
- **Create & Manage Novels** — Full CRUD dashboard for authors with cover images, genres, synopsis, and status tracking.
- **Chapter Editor** — Rich toolbar (bold, italic, scene breaks, images) with Markdown preview, auto-save, scheduled publishing, and premium/locked chapter support.
- **Analytics Dashboard** — Interactive Recharts-powered graphs: views, favorites, ratings, and per-novel performance breakdowns.
- **Community Originals** — User-created novels appear on the homepage alongside API-sourced novels, fully integrated into search.

### 💬 Advanced Social Features
- **Visual Prestige Comments** — Comments display the author's level badge, equipped title (gold/amber), and level-based avatar border (gradient glow at Lv20+, animated RGB at Lv50+).
- **Inline Comments** — Wattpad-style per-paragraph commenting system.
- **Reviews & Ratings** — Star-based review system with rating breakdowns.

### 🖼️ Aesthetic Quote Export
- **Text Highlight → Quote** — Select any text while reading, save it as a bookmarked quote.
- **Image Generator** — Export quotes as premium PNG cards with serif typography, decorative SVG quote marks, violet gradient background, and *"Noctua Novel"* watermark.
- **Custom Attribution** — Edit who said the quote (e.g., *"— Nephis to Sunny"*).
- **Powered by html2canvas-pro** — 3x scale rendering for crisp, high-DPI output.

### 📱 Progressive Web App (PWA)
- **Service Worker** — Cache-first for static assets, network-first for pages with offline fallback.
- **Offline Library** — Download chapters to localStorage for reading without internet.
- **Install Prompt** — "Add to Home Screen" banner for mobile users.

### 🔐 Enterprise-Grade Backend
- **Prisma `$transaction`** — All multi-step operations (XP + level + border unlock, achievement + coin + title) are atomic. No data inconsistency on network failure.
- **Concurrent Safety** — Multi-level jump handling, idempotent upserts, unique constraints prevent duplicate unlocks.
- **18 REST API Routes** — Full CRUD for novels, chapters, comments, reviews, favorites, achievements, gamification, analytics, notifications, and coins.

### 🎨 Premium UI/UX
- **Noctua Midnight Theme** — Violet-accented dark mode (`#8b5cf6`) with glassmorphism surfaces, subtle borders (`white/[0.06]`), and WCAG AA contrast.
- **Framer Motion Animations** — Level-up celebration, micro-interactions, spring physics.
- **Sonner Toast Notifications** — Elegant toast system replacing all `alert()` and silent `catch {}` blocks.
- **Responsive Design** — Mobile-first with adaptive layouts across all pages.

### 🔍 SEO & Metadata
- **Dynamic OpenGraph & Twitter Cards** — Per-novel and per-chapter metadata with images and descriptions.
- **Sitemap & Robots.txt** — Auto-generated for all public routes.
- **PWA Manifest** — Full manifest with theme color, icons, and app metadata.

---

## 🛠️ Tech Stack

<table>
<tr>
<td valign="top" width="50%">

### Frontend
| Technology | Purpose |
|---|---|
| [Next.js 16](https://nextjs.org/) | React framework (App Router, RSC) |
| [TypeScript 5](https://www.typescriptlang.org/) | Type-safe development |
| [React 19](https://react.dev/) | UI library |
| [Tailwind CSS 4](https://tailwindcss.com/) | Utility-first styling |
| [shadcn/ui](https://ui.shadcn.com/) | Accessible component primitives |
| [Framer Motion](https://www.framer.com/motion/) | Animations & gestures |
| [Recharts](https://recharts.org/) | Interactive analytics charts |
| [react-markdown](https://github.com/remarkjs/react-markdown) | Markdown rendering |
| [html2canvas-pro](https://github.com/nicolo-ribaudo/html2canvas-pro) | Quote image export |
| [Lucide React](https://lucide.dev/) | Icon system |
| [Sonner](https://sonner.emilkowal.dev/) | Toast notifications |

</td>
<td valign="top" width="50%">

### Backend & Database
| Technology | Purpose |
|---|---|
| [Prisma 6](https://www.prisma.io/) | Type-safe ORM |
| [PostgreSQL](https://www.postgresql.org/) | Primary database |
| [Clerk](https://clerk.com/) | Authentication & user management |
| [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers) | 18 REST endpoints |
| [Prisma Transactions](https://www.prisma.io/docs/guides/performance-and-optimization/prisma-client-transactions) | Atomic multi-step operations |
| [Vercel](https://vercel.com/) | Deployment & hosting |
| [ESLint](https://eslint.org/) | Code quality |

</td>
</tr>
</table>

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18.17 or newer
- **PostgreSQL** database (local or hosted — [Supabase](https://supabase.com/), [Neon](https://neon.tech/), etc.)
- **Clerk** account for authentication ([clerk.com](https://clerk.com/))

### 1. Clone the Repository

```bash
git clone https://github.com/SahrulRamadhanHardiansyah/noctua-novel.git
cd noctua-novel
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
# ─── Database ────────────────────────────────────────────────────
DATABASE_URL="postgresql://user:password@localhost:5432/noctua_novel?schema=public"
DIRECT_URL="postgresql://user:password@localhost:5432/noctua_novel?schema=public"

# ─── Clerk Authentication ────────────────────────────────────────
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY
CLERK_SECRET_KEY=sk_test_YOUR_SECRET_KEY
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# ─── External Novel API ─────────────────────────────────────────
NEXT_PUBLIC_NOVEL_API_URL=https://your-novel-api-url.com
```

### 4. Setup Database & Seed Data

```bash
# Push the Prisma schema to your database (creates all tables)
npx prisma db push

# Generate the Prisma Client
npx prisma generate

# Seed achievements, profile borders, and master data
npm run seed
```

> **⚠️ Important:** The `npm run seed` command populates the database with 12 achievements, 6 profile borders, and all gamification master data. Without this, the Achievements page will be empty.

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Build for Production

```bash
npm run build
npm start
```

---

## 📁 Project Architecture

```
noctua-novel/
├── prisma/
│   ├── schema.prisma          # 15 models: UserProfile, Achievement,
│   │                           #   ProfileBorder, UserTitle, Bookmark, etc.
│   └── seed.ts                 # Database seed script (achievements + borders)
│
├── public/
│   ├── manifest.json           # PWA manifest
│   └── sw.js                   # Service worker (offline caching)
│
├── src/
│   ├── app/
│   │   ├── (main)/             # Main layout group (Navbar + Footer)
│   │   │   ├── page.tsx        # Homepage (Hero, Latest, Community, Editors)
│   │   │   ├── bookmarks/      # Bookmarks & saved quotes page
│   │   │   ├── achievements/   # Gamification achievements page
│   │   │   ├── offline/        # Offline library (downloaded chapters)
│   │   │   ├── coins/          # Coin balance, daily check-in, missions
│   │   │   ├── favorite/       # User's favorited novels
│   │   │   ├── notifications/  # Notification center
│   │   │   ├── novel/[slug]/   # Novel detail page
│   │   │   ├── user/[username]/# Public user profile
│   │   │   ├── dashboard/      # Author Studio
│   │   │   │   ├── page.tsx    # Dashboard home (stats + novel cards)
│   │   │   │   ├── analytics/  # Recharts-powered analytics
│   │   │   │   ├── customize/  # Profile customization (border + title)
│   │   │   │   ├── create-novel/
│   │   │   │   └── novel/[id]/ # Novel management, chapters, editor
│   │   │   └── search/[keyword]/
│   │   ├── chapter/[slug]/     # Chapter reader (TTS, bookmarks, offline)
│   │   ├── api/                # 18 REST API routes
│   │   │   ├── achievements/   # Achievement CRUD + unlock logic
│   │   │   ├── gamification/   # XP, leveling, customization
│   │   │   ├── analytics/      # Author analytics data
│   │   │   ├── coins/          # Coin transactions
│   │   │   ├── comments/       # Novel comments
│   │   │   ├── favorite/       # Favorite toggle
│   │   │   ├── reviews/        # Ratings & reviews
│   │   │   └── ...             # + 10 more endpoints
│   │   ├── layout.tsx          # Root layout (Clerk, Toaster, SW registration)
│   │   ├── sitemap.ts          # Dynamic sitemap generation
│   │   └── robots.ts           # Robots.txt configuration
│   │
│   ├── components/
│   │   ├── ui/                 # shadcn/ui primitives (Button, Badge, etc.)
│   │   ├── dashboard/          # Author Studio components
│   │   │   ├── ChapterEditor.tsx    # Rich chapter editor + markdown preview
│   │   │   └── AnalyticsCharts.tsx  # Recharts visualization
│   │   ├── home/               # Homepage sections
│   │   ├── Navbar.tsx          # Glassmorphism navbar with search, XP badge
│   │   ├── ChapterClient.tsx   # Reader: TTS, bookmarks, offline, font settings
│   │   ├── CommentSection.tsx  # Gamified comments with level borders
│   │   ├── QuoteExportModal.tsx# Aesthetic quote image generator
│   │   ├── LevelUpCelebration.tsx # Framer Motion level-up animation
│   │   └── PublicProfileClient.tsx # Public user profile display
│   │
│   ├── lib/
│   │   ├── prisma.ts           # Prisma client singleton
│   │   ├── gamification.ts     # XP engine, level curve, border definitions
│   │   ├── achievements.ts     # Achievement constants (12 definitions)
│   │   └── utils/
│   │       ├── achievements.ts # unlockAchievement() with $transaction
│   │       ├── chapter.ts      # formatChapterTitle() utility
│   │       ├── reading-history.ts # localStorage-based read tracking
│   │       └── slug.ts         # URL slug utilities
│   │
│   └── types/
│       └── index.ts            # Shared TypeScript types
│
├── tailwind.config.ts
├── components.json             # shadcn/ui configuration
└── package.json
```

---

## 🗄️ Database Schema

The application uses **15 Prisma models** across 4 functional domains:

### User & Profile
| Model | Purpose |
|---|---|
| `UserProfile` | XP, level, equipped title/border, coin balance, streak |
| `UserTitle` | Unlocked titles/gelars from achievements |
| `UserBorder` | Unlocked profile borders (level rewards) |
| `ProfileBorder` | Border definitions with CSS classes and rarity |

### Content
| Model | Purpose |
|---|---|
| `UserNovel` | Author-created novels (UGC) |
| `UserChapter` | Chapters with content, scheduling, premium locking |
| `Comment` | Novel-level comments with author profile relation |
| `InlineComment` | Per-paragraph Wattpad-style comments |
| `Review` | Star ratings and reviews per novel |

### Gamification
| Model | Purpose |
|---|---|
| `Achievement` | 12 achievements with coin/title/XP rewards |
| `UserAchievement` | User progress tracking per achievement |
| `ReadingProgress` | Server-side reading position tracking |
| `ChapterView` | Granular per-chapter view analytics |

### Economy & Engagement
| Model | Purpose |
|---|---|
| `CoinTransaction` | Full coin ledger (earn/spend) |
| `DailyCheckIn` | 7-day streak tracking with scaling rewards |
| `ReadingMission` / `ReadingMissionProgress` | Gamified reading missions |
| `Favorite` | User ↔ novel bookmarks |
| `Bookmark` | Text highlights and annotations |
| `Notification` | System notifications |

---

## 🎮 Gamification Details

### XP Rewards
| Action | XP Earned |
|---|---|
| Read a chapter | 10 XP |
| Write a review | 15 XP |
| Daily check-in | 5 XP |
| Post a comment | 3 XP |
| Save a quote | 2 XP |
| Unlock achievement | `xpReward` (25–500 XP) |

### Level Curve
```
Total XP for Level N = floor(100 × N^1.5)

Level  1 →      0 XP
Level  5 →  1,118 XP
Level 10 →  3,162 XP
Level 20 →  8,944 XP
Level 35 → 20,706 XP
Level 50 → 35,355 XP
```

### Profile Border Tiers
| Level | Border | Visual Effect |
|---|---|---|
| 5 | Bronze Frame | Subtle amber ring |
| 10 | Silver Frame | Slate gradient + glow |
| 20 | Golden Glow | Amber pulse animation |
| 35 | Violet Aura | Violet gradient + glow |
| 50 | Diamond Crown | Cyan/Violet/Pink animated gradient |

---

## 🔐 Clerk Authentication Notice

Clerk currently **does not support phone number login for Indonesia (+62)** due to SMS limitations.

### ✅ Test Credentials for Development

| Field | Value |
|---|---|
| Phone Number | `+15555550100` |
| Verification Code | `424242` |

> ⚠️ Do not use in production. These test credentials are public.

More info: [Clerk Test Phone Numbers](https://clerk.com/docs/testing/overview)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'feat: add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Commit Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/):

```
feat:     new feature
fix:      bug fix
chore:    maintenance
docs:     documentation
refactor: code restructuring
perf:     performance improvement
```

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

---

<div align="center">

**Built with 🦉 by [Sahrul Ramadhan Hardiansyah](https://github.com/SahrulRamadhanHardiansyah)**

*If this project helped you, consider giving it a ⭐*

</div>
