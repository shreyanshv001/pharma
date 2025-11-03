# PharmaLab

A comprehensive platform for pharmaceutical education, laboratory experiments, instrument management, and student Q&A community, built with Next.js, Prisma, and Clerk.

## Table of Contents
- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Database & Models](#database--models)
- [Main Functionality](#main-functionality)
- [Authentication & Authorization](#authentication--authorization)
- [API Reference](#api-reference)
- [Customization & Extending](#customization--extending)
- [Troubleshooting / FAQ](#troubleshooting--faq)

---

## Project Overview
PharmaLab is a web platform aimed at helping pharmaceutical students and professionals learn by exploring digital laboratory experiments, instruments, and engaging in a Q&A community. It consists of:
- **Student-facing endpoints** for experiments, instruments, Q&A, and personal profiles
- **Admin dashboard** for managing experiments and instruments
- **Community features** like voting, answers, and comments

## Features
- 📚 **Experiments Browser**: Searchable, categorized index of laboratory experiments with details
- 🧪 **Instrument Explorer**: Full instrument specs with images, SOP, guidelines, and videos
- 🙋 **Q&A Community**: Ask, answer, and vote on pharmaceutical questions
- 🛡️ **Admin Dashboard**: Manage content (CRUD) for experiments and instruments
- 👤 **User Profiles**: Track personal contributions (questions, answers, comments)
- 📬 **Contact & About Pages**: For students and external users

## Tech Stack
- **Framework:** Next.js (App Router)
- **Database:** PostgreSQL (via Prisma ORM)
- **UI/Styling:** Tailwind CSS, HeadlessUI, FontAwesome, Remixicon
- **Auth:** Clerk (users), custom JWT for Admin
- **APIs:** RESTful, routed via `/api`
- **Other:** React Query, Jodit (rich text editor), Supabase (optionally), ESLint, Typescript

---

## Getting Started
### Prerequisites
- Node.js 18+ and npm/yarn/pnpm
- PostgreSQL database
- Vercel/Bun (optional for deployment)

### 1. Clone & Install
```bash
git clone <repo-url>
cd PharmaLab
npm install   # or yarn or pnpm
```

### 2. Environment Variables
Copy and fill out your env (see `.env.example` or below):
```env
DATABASE_URL=postgresql://user:password@localhost:5432/pharmalab
ADMIN_JWT_SECRET=yourStrongSecret
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
NEXT_PUBLIC_CONTACT_ACCESS_KEY=...
# (see Clerk/Supabase/DB provider docs)
```

### 3. Database Setup
```bash
npx prisma migrate dev --name init
npx prisma db seed
```

### 4. Run the App
```bash
npm run dev  # or yarn dev
```
Visit [http://localhost:3000](http://localhost:3000).

### 5. Build for Production
```bash
npm run build && npm start
```

---

## Project Structure
```
├── app/
│   ├─ admin/               # Admin dashboard (protected)
│   ├─ api/                 # All backend APIs
│   ├─ experiment/          # Experiment browser/detail pages
│   ├─ instrument/          # Instrument browser/detail pages
│   ├─ qa/                  # Q&A routes (community)
│   ├─ profile/             # User profile/tabs
│   ├─ contact-us/          # Contact/feedback
│   ├─ about-us/            # About page
│   └─ ...
├── components/             # All major UI and page-specific logic
├── lib/                    # Utilities: db, user, supabase, helpers
├── prisma/
│   ├─ schema.prisma        # DB models
│   ├─ migrations/          # Migration SQL
│   └─ seed.ts              # Sample/admin seed script
├── middleware.ts           # Clerk-based route protection
├── admin-middleware.ts     # Custom Admin JWT guard
├── ...
```

### Key Files/Folders
- `app/api/`: Implements CRUD/browse APIs for student/admin/qa
- `components/`: Reusable UI (buttons, answer-voting, comment-section, profile, etc)
- `lib/`: `db.ts` for Prisma, `get-user.ts`, `utils.ts`, `supabase.ts`
- `prisma/schema.prisma`: Data models (see below)

---
## Database & Models
Using Prisma ORM. Main models:
- **Admin**: Email/password for admin dashboard
- **User**: Managed by Clerk (id, email, name, image, createdAt)
- **Instrument**: id, name, category, description, SOP, specs, videos, images, etc.
- **Experiment**: id, object, reference, theory, procedure, instruments via join
- **Question/Answer/Comment/Vote**: For Q&A (votes are on both Q & A)

See `prisma/schema.prisma` for full details. Use migrations to update:
```bash
npx prisma migrate dev
```
---

## Main Functionality
### 1. Experiments/Instrument Browsing
- Dynamic, filtered lists for both (in `/app/experiment` and `/app/instrument`)
- Detail pages with all core fields, images, SOPs, and video (if present)

### 2. Q&A Community
- Ask, answer, and search questions
- Vote + comment system (only one vote per user per item)
- Moderation: users can edit/delete own contributions

### 3. Admin Dashboard
- Add/edit/delete experiments and instruments
- View analytics/basic stats
- JWT-secured login for admin, separate from user login

### 4. Profile & User Dashboard
- Tabs for user's questions, answers, comments
- Manage personal info (powered by Clerk)

### 5. Miscellaneous
- About and Contact pages for external users
- Feedback form routed via Web3Forms (Contact)

---

## Authentication & Authorization
- **Students/Users**: via Clerk (email, social, etc.) – protects `/profile`, `/qa`, etc.
- **Admins**: JWT-protected via `admin-middleware.ts` for `/admin/*` routes
- **APIs**: Some APIs are open (read only); mutations/CRUD require appropriate auth

---

## API Reference
Located under `/app/api/`:
- `/api/student/*`: List experiments/instruments (public or required login)
- `/api/admin/*`: CRUD for instruments, experiments (admin only)
- `/api/qa/*`: Q&A endpoints (questions/answers/comments/votes)
- `/api/user/*`: User profile-related endpoints
- See full file listing for all available endpoints

Example (fetch all instruments as admin):
```http
GET /api/admin/all-instruments
Headers: Cookie: admin_token=JWT
```

Example (student fetch experiments):
```http
GET /api/student/experiments
```
---

## Customization & Extending
- **Add experiments/instruments:** Use Admin dashboard or extend endpoints
- **Styling/themes:** Built with Tailwind – extend `globals.css` or override classes
- **APIs:** Add new endpoints under `app/api/`
- **Components/UI:** Add/modify components in `/components`
- **Database:** Modify `prisma/schema.prisma` and run `prisma migrate dev`
- **Auth:** For new rules, see `middleware.ts` and `admin-middleware.ts`

---

## Troubleshooting / FAQ
- **Q:** Errors when running migrations?
  - _Check your `DATABASE_URL` and DB server. Run `prisma generate`._
- **Q:** Cannot log in as admin?
  - _Seed a new Admin via `prisma/seed.ts`, check `ADMIN_JWT_SECRET`._
- **Q:** Clerk login callback error?
  - _Check Clerk dashboard keys and env variables._
- **Q:** Styling is broken after deploy?
  - _Ensure Tailwind is properly built and `postcss.config.mjs` is up to date._
- **Q:** How do I deploy?
  - _Recommended: [Vercel](https://vercel.com/). Configure env vars in the dashboard._

## Resources
- [Next.js App Router](https://nextjs.org/docs)
- [Prisma ORM](https://www.prisma.io/docs)
- [Clerk Auth](https://clerk.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vercel deployment](https://vercel.com/docs)

---

_This project is open for contributions and improvements – see the Q&A community or contact us!_
