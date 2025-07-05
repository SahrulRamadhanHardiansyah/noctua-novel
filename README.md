# NoctuaNovel

![image](https://github.com/user-attachments/assets/144c8923-3d60-4e95-94c9-87d1579c56a3)

![image](https://github.com/user-attachments/assets/87299d67-8660-47e8-8318-9bb1a80771de)

![image](https://github.com/user-attachments/assets/32846021-ef4e-4637-b5c1-0f92bc109f88)

A modern web application for reading novels, built with Next.js and powered by a custom web scraping API. This project allows users to browse, search, and read a wide range of novels sourced from the web with a clean and responsive interface.

### [🔗 Live Preview](https://noctua-novel.vercel.app/)

## ✨ Key Features

* **Browse Novels**: View novels by latest releases, editor’s picks, and recommendations.
* **Advanced Search**: Search novels by title using a dynamic UI.
* **Detail Page**: View complete novel information including synopsis, genre, status, and chapter list.
* **Immersive Reading Page**: Distraction-free reading experience with customizable font size.
* **User Authentication**: Secure login and registration system using Clerk.
* **Responsive Design**: Optimized layout across devices, from desktop to mobile.

## 🛠️ Tech Stack

This project is split into two main parts: the frontend (web app) and backend (API).

**Frontend:**

* **Framework**: [Next.js](https://nextjs.org/) (App Router)
* **Language**: [TypeScript](https://www.typescriptlang.org/)
* **Styling**: [Tailwind CSS](https://tailwindcss.com/)
* **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
* **Authentication**: [Clerk](https://clerk.com/)
* **Icons**: [Lucide React](https://lucide.dev/)

**Backend:**

* **Framework**: [Flask](https://flask.palletsprojects.com/)
* **Language**: [Python](https://www.python.org/)
* **Web Scraping**: [Beautiful Soup 4](https://www.crummy.com/software/BeautifulSoup/) & [Requests](https://requests.readthedocs.io/en/latest/)
* **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
* **ORM**: [Prisma](https://www.prisma.io/)

**Deployment & Tools:**

* **Deployment Platforms**: Vercel (Frontend), Render (Backend)
* **Package Manager**: npm
* **Code Quality**: ESLint & Prettier

## 🚀 Getting Started

To run this project locally, you’ll need to set up the backend (API) and frontend (Next.js) separately.

### Prerequisites

* Node.js (v18.17 or newer)
* Python (v3.8 or newer) & pip

### 1. Backend Setup (Flask API)

This API handles novel data scraping.

```bash
# 1. Clone the repository
git clone https://github.com/SahrulRamadhanHardiansyah/novel-api

# 2. Navigate to the backend folder
cd novel-api

# 3. Create and activate a virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # For MacOS/Linux
# or
.\venv\Scripts\activate  # For Windows

# 4. Install dependencies
pip install -r requirements.txt

# 5. Run the Flask server
# Default port is 5001
python app.py
```

### 2. Frontend Setup (Next.js App)

This is the main web app users will interact with.

```bash
# 1. Clone the repository
git clone https://github.com/SahrulRamadhanHardiansyah/noctua-novel

# 2. Open a new terminal and go to the frontend folder
cd noctua-novel

# 3. Install dependencies
npm install

# 4. Create environment variable file
# Copy from .env.example and replace with your own keys
cp .env.example .env.local

# 5. Fill in the .env.local with your Clerk and API keys
NEXT_PUBLIC_API_URL=http://localhost:5001
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY
CLERK_SECRET_KEY=sk_test_YOUR_SECRET_KEY

# 6. Run the Next.js development server
npm run dev
```

Open `http://localhost:3000` in your browser to view the app.

---

## 🔐 Clerk Authentication Notice

Clerk currently **does not support phone number login for Indonesia (+62)** due to SMS limitations.

### ✅ Use Test Credentials for Login:

* **Phone Number:** `+15555550100`
* **Verification Code:** `424242`

Use this test number during development to log in.

> ⚠️ Do not use in production. This test number is public and not secure.

More info: [Clerk Test Phone Numbers](https://clerk.com/docs/testing/overview)

---

## 📝 To-Do / Feature Plans

This project is still under development. Upcoming features include:

* [ ] **Reading History**: Track the last-read chapter for each user.
* [ ] **Pagination**: Add navigation for long novel lists.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
