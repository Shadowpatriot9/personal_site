# personal_site (mgds.me)

Grayden Scovil's personal site — a Next.js 15 App Router rebuild that merges the
feature set of the original CRA site (v1) with the clean Next.js structure of the
v2 rewrite, styled with the classic `9a943d9` design system.

## Stack

- **Next.js 15** (App Router) + **TypeScript** + **React 18**
- Bespoke CSS design system (no UI framework) — SF Pro type, `#cccccc`/`#232323` palette
- **MongoDB** via Mongoose (optional — the site runs on a static catalog without it)
- **JWT** auth (`jsonwebtoken`) + PBKDF2 credential hashing for the admin panel
- Vercel Analytics + Speed Insights

## Features

- Editorial home page (hero / projects / contact) with a translucent sticky nav
- **Light / dark toggle**, persisted
- Client-side project **search, filter, and sort**
- Seven project sub-pages (S_im, sOS, S9, NFI, Muse, EyeLearn, Naton)
- **Contact form** that emails messages (via Resend) when configured
- **Admin dashboard** (`/admin`): login, project CRUD, drag-and-drop ordering,
  publish toggles
- SEO: sitemap, robots, dynamic OG image, per-page metadata

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in values (all optional for local dev)
npm run dev                  # http://localhost:3000
```

Without any environment variables the site runs fully on the static project
catalog in [`lib/projects.ts`](lib/projects.ts). Admin login uses a warned
dev-only fallback (`admin` / `changeme`) when credentials aren't set.

## Environment variables

See [`.env.example`](.env.example). All are optional in development; the admin
credential and JWT secrets are **required in production** (no hardcoded fallbacks
ship in the code).

| Variable | Purpose |
| --- | --- |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Admin login credentials |
| `JWT_SECRET` / `REFRESH_TOKEN_SECRET` | Token signing (`openssl rand -hex 32`) |
| `MONGO_URI` | Enables the database-backed project catalog + admin CRUD |
| `RESEND_API_KEY` | Delivers contact-form messages by email (via Resend) |
| `CONTACT_TO_EMAIL` / `CONTACT_FROM_EMAIL` | Recipient and verified sender for contact email |

## Project structure

```
app/
  layout.tsx            Root layout, fonts, providers, metadata
  page.tsx              Home (renders HomeClient)
  projects/<slug>/      Seven project sub-pages
  admin/                Admin dashboard
  api/                  Route handlers (projects, contact, admin/*)
  styles/               sub-page + admin CSS
  global.css            Design tokens + shared styles
components/             Client components (theme, search, grid, contact, admin)
contexts/               Theme + Projects providers
lib/                    Shared logic (projects, apiClient, logger)
lib/server/             db, model, auth (server-only)
```

## Build

```bash
npm run build && npm start
```

Deployed on Vercel at [mgds.me](https://mgds.me).
