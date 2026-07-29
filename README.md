# Python Course Platform V2

A modern, account-based rebuild of the Python Basics course platform —
real student accounts via Supabase Auth, per-lecture access codes instead
of one course-wide code, and a fuller instructor/admin dashboard. This is
a **separate project from V1** and does not touch or depend on it.

## Architecture at a glance

| Layer | Choice | Why |
|---|---|---|
| Frontend | React + Vite + Tailwind | Fast, component-based, matches V1's proven approach |
| Auth + DB | Supabase (Postgres, free tier) | Real accounts need real password hashing, sessions, and reset emails — Supabase handles all of that so you never touch a plaintext password |
| Backend | Express.js | A thin, security-critical layer — only for the things that must never run in the browser |
| Frontend hosting | Vercel | Free tier, zero-config for Vite |
| Backend hosting | Railway | Free tier, simple Node deploys |

**The core security boundary:** the frontend talks to Supabase directly
for anything Row Level Security (RLS) can safely gate — e.g. reading the
published curriculum for the landing page. It talks to the Express
backend for anything that needs the Supabase **service role key**, which
bypasses RLS entirely and must never reach the browser: validating access
codes, and every admin operation (managing students, lectures, codes,
analytics, settings).

## How authentication works

1. A student registers with full name, email, and password on `/register`.
2. Supabase Auth hashes the password, creates the account, and (if you've
   enabled email confirmation in your Supabase project) sends a
   confirmation email.
3. A database trigger (`handle_new_user` in `schema.sql`) automatically
   creates a matching row in `profiles` for admin-facing info like name
   and account status.
4. On login, Supabase issues a session token, which it persists and
   refreshes automatically — so refreshing the page keeps the student
   logged in with no extra code.
5. `/forgot-password` sends a reset email via Supabase; the link lands on
   `/reset-password`, where the student sets a new password.
6. Every request to the Express backend carries this session token in an
   `Authorization: Bearer` header, which the backend verifies against
   Supabase before trusting who's asking (`requireAuth` middleware).

## How access codes and lecture unlocking work

Unlike V1 (one code unlocks the whole course), each code here belongs to
**exactly one lesson**:

1. All lectures are visible on the dashboard from the start, but locked.
2. Clicking a locked lecture opens a popup asking for a code.
3. The code is sent to the backend along with the lesson ID and the
   student's session token. The backend (using the service role key, so
   it can see the full `access_codes` table) checks: does the code exist,
   does it match this lesson, is it still active, not expired, not
   already used up, and not assigned to a different student.
4. If valid, the backend inserts a row into `unlocked_lessons` for that
   student + lesson. That row is the actual, server-verified proof of
   access — the frontend cannot fake it.
5. The lesson page itself re-checks `unlocked_lessons` before showing the
   video, so navigating straight to a lesson URL without unlocking it
   redirects back to the dashboard.

## How admin management works

Being an admin isn't a role flag on the user — it's membership in a
separate `admins` table that the frontend can never read (no RLS policy
grants it). When a logged-in user visits `/admin`, the frontend simply
tries an admin API call; if the backend's `requireAdmin` middleware finds
their user ID in `admins`, they're in — otherwise they're redirected back
to the dashboard. This means granting yourself admin access is a one-time
manual step in the Supabase SQL editor (see Setup below), not something
exposed in any UI — intentionally, since there's no self-serve "become an
admin" button.

## Project structure

```
python-course-platform-v2/
├── database/
│   └── schema.sql            # run this once in Supabase's SQL editor
├── backend/
│   ├── server.js
│   └── src/
│       ├── lib/supabaseAdmin.js       # the ONLY file allowed to use the service role key
│       ├── middleware/
│       │   ├── requireAuth.js         # verifies the student's Supabase session token
│       │   └── requireAdmin.js        # checks the `admins` table
│       └── routes/
│           ├── access.js              # redeem a code, list what's unlocked
│           └── admin/
│               ├── students.js
│               ├── lectures.js        # sessions + lessons
│               ├── codes.js
│               ├── analytics.js
│               └── settings.js
└── frontend/
    └── src/
        ├── pages/             # LandingPage, Login/Register/Forgot/Reset, Dashboard, LessonPage
        │   └── admin/         # AdminLayout + Students/Lectures/Codes/Analytics/Settings
        ├── components/        # Navbar, Footer, LectureCard, AccessCodeModal, VideoPlayer, etc.
        ├── context/           # AuthContext (Supabase session), ThemeContext (light/dark/system)
        ├── hooks/             # useCourseContent (public curriculum), useUnlockedLessons
        ├── lib/supabaseClient.js   # anon-key client, safe for the browser
        └── api/client.js      # talks to the Express backend, attaches the session token
```

## Setup

You need [Node.js](https://nodejs.org) 18+ and a free [Supabase](https://supabase.com) account.

**1. Create your Supabase project**
- Create a new project at supabase.com (free tier).
- Open the SQL Editor, paste the entire contents of `database/schema.sql`, and run it once.
- In **Authentication > Providers**, email/password is enabled by default — leave "Confirm email" on or off depending on whether you want students to verify their email before logging in.
- In **Project Settings > API**, copy your Project URL, `anon` public key, and `service_role` secret key.

**2. Make yourself an admin**

Register a normal account through the app first, then in the Supabase SQL Editor run:
```sql
insert into admins (user_id)
select id from auth.users where email = 'your-email@example.com';
```

**3. Start the backend**
```bash
cd backend
cp .env.example .env   # fill in SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
npm install
npm run dev
```

**4. Start the frontend** (second terminal)
```bash
cd frontend
cp .env.example .env   # fill in VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY; VITE_API_URL defaults to localhost:4000
npm install
npm run dev
```

Open `http://localhost:5173`. Register an account, then visit `/admin` — since you added yourself to the `admins` table, you'll land in the instructor dashboard instead of being redirected.

## A note on testing

I built and verified this as thoroughly as I could without your actual
Supabase credentials: the backend boots and correctly rejects
unauthenticated/non-admin requests, and the frontend builds cleanly and
serves every route with no errors. What I have **not** been able to test
end-to-end is a real signup → email confirmation → login → redeem-a-code
flow against live data, since that requires your own Supabase project.
Run through that flow once yourself after setup, before pointing real
students at it.

## Your day-to-day workflow

1. In `/admin/lectures`, create your sessions and lessons (or add more later).
2. Student registers for free on `/register`.
3. Student pays you via InstaPay for a specific lesson (or however you
   choose to structure pricing).
4. In `/admin/codes`, generate a code, pick the lesson it unlocks,
   optionally note the student's name and an expiration date.
5. Send the code to the student on WhatsApp.
6. Student clicks the locked lecture, enters the code — that lecture
   unlocks, permanently, for that account.

## Adding content

**Sessions and lessons:** use `/admin/lectures` — no code editing needed,
unlike V1's `courseData.js` file. This is the main structural upgrade:
content now lives in the database, so you (or anyone you give admin
access to) can manage it from the UI.

**Videos:** when creating or editing a lesson, set `video_url` to a
direct link to your hosted video (Bunny Stream, Mux, Cloudflare Stream,
or an S3/.mp4 URL). The player is a plain HTML5 `<video>` element.

**Thumbnails, resources (PDF/ZIP), homework:** for this MVP these are
plain URL fields (`thumbnail_url`, `resource_url`, `homework_url`) rather
than a file upload button — you host the file anywhere (Google Drive
share link, Supabase Storage, etc.) and paste the link in. Wiring up a
real upload button is a natural next step using **Supabase Storage**
(a few lines: upload the file, get back a public URL, save that URL to
the same fields) — it wasn't built here to keep the MVP's moving parts
minimal, but the schema is already shaped for it.

## What's genuinely secure vs. MVP-only

**Secure enough as-is:**
- Passwords are always hashed by Supabase Auth — this app never sees or stores a plaintext password.
- Access codes are validated entirely server-side; the frontend never has the list of codes.
- The service role key never reaches the browser — it's read from `backend/.env` only.
- RLS means even a compromised anon key can't read unpublished content, other students' unlock records, or the `access_codes`/`admins` tables.
- Admin status is a server-side allowlist check on every single admin request, not a client-side flag.

**MVP-only, worth upgrading before this scales significantly:**
- The `admins` allowlist is managed by hand via SQL — there's no UI to promote/demote admins. Fine for one instructor; add an admin-management screen if you bring on staff.
- File "uploads" are just URL fields — you're responsible for hosting the actual files somewhere. See "Adding content" above for the natural upgrade path.
- Analytics are intentionally minimal (unlock counts per lesson), as scoped — no watch-time or completion tracking.
- `listUsers` in the students route paginates up to 1000 accounts; if you pass that, the endpoint needs pagination added.
- There's no rate limiting on code redemption attempts — add it (e.g. via a small in-memory or Redis-backed limiter) before this is exposed to a large, motivated audience trying to brute-force codes.

## Deploying

- **Database/Auth:** already live once you create the Supabase project — nothing to deploy.
- **Backend → Railway:** push `backend/` as a Node service; set `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `CORS_ORIGIN` (your Vercel URL) as environment variables.
- **Frontend → Vercel:** import `frontend/`, set `VITE_API_URL` (your Railway URL + `/api`), `VITE_SUPABASE_URL`, and `VITE_SUPABASE_ANON_KEY` as environment variables, then deploy.
- After deploying, update your Supabase project's **Authentication > URL Configuration** to include your live Vercel URL (needed for password-reset email links to work correctly).

## Future-ready

The schema and route structure were shaped so these don't require a
rewrite: multiple courses (add a `courses` table, add `course_id` to
`sessions`), quizzes/assignments (new tables, same RLS pattern),
certificates, a discussion system, notifications, and real payments
(Stripe/Paymob webhook hitting a new backend route that generates codes
automatically instead of you doing it by hand).
