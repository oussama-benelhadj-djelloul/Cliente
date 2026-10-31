# Cliente

A feedback portal for companies. Each company gets a public page where its customers share ideas and complaints, vote on what matters most, and read the company's official replies.

**Stack:** React + Vite + TypeScript, Tailwind CSS with [shadcn/ui](https://ui.shadcn.com) components, and [Supabase](https://supabase.com) (Postgres database + auth). It builds to a static site, ready for Netlify.

## Pages

| Route | What it does |
|---|---|
| `/` | Landing page and list of companies |
| `/c/:slug` | A company's public feedback board: sort by top/newest, filter by status, upvote, share feedback (public or private) |
| `/login`, `/signup` | Email + password accounts (Supabase Auth) |
| `/dashboard` | Company owner: create the company page, stats, reply to feedback, change status, edit profile, copy the public link |

## Run locally

```bash
cp .env.example .env
npm install
npm run dev
```

## Database

- `supabase/schema.sql` — tables, enums and Row Level Security rules (already applied to the Supabase project).
- `supabase/seed.sql` — demo data. Re-run it in the Supabase SQL editor to reset the demo. All demo accounts use the password `Password123!`:
  - `sara@cliente-demo.dev` owns **Sahara Eats**
  - `karim@cliente-demo.dev` owns **PixelNote**
  - `amina`, `yacine`, `lina`, `mehdi`, `nour` `@cliente-demo.dev` are customers

Access rules are enforced by the database, not the front end: anyone can read public feedback, users can only post and vote as themselves (once per feedback), private feedback is visible only to its author and the company, and only the company owner can reply or change a status.

## Deploy to Netlify

`netlify.toml` is included. In Netlify, import the repository and set two environment variables, `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` (values in `.env.example`). Then in Supabase → Authentication → URL Configuration, set the Site URL to your Netlify address so sign-up confirmation emails link back to it.

## Adding more shadcn components

`components.json` is set up, so `npx shadcn@latest add <component>` works.
