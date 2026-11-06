# CLAUDE.md — CareerKit

> Project context and Software Requirements Specification (SRS) for Claude Code.
> Place this file in the root of the project folder. Claude Code reads it automatically at the start of every session.

---

## 0. How to work with me (instructions for Claude Code)

- This is a **student final project** for a React Native cross-platform mobile course. The team must be able to **understand and explain every part of the code** during the Q&A. So:
  - Build **one feature at a time**, following the Build Order in Section 11. Do not jump ahead.
  - After each change, give a **short plain-language explanation** of what was built and why (2–5 sentences).
  - Prefer **simple, readable code** over clever code. Add brief comments only where the logic isn't obvious.
- **Ask before adding any new npm package** that is not listed in Section 3.
- Keep the app runnable in **Expo Go** whenever possible. If a feature needs a development build, say so before implementing it.
- Never put SQL directly inside screen components; always go through the `src/db/repositories/` layer (Section 9).
- Use **TypeScript** everywhere. No `any` unless unavoidable (and explain why).
- When a phase is finished, update the checkboxes in Section 11.

---

## 1. Project Overview

**Name:** CareerKit
**Tagline:** *An Offline-First Career Companion for Filipino Students and Job Seekers — from OJT to Employment.*
**One-liner:** Store your career once, track every requirement, and apply with confidence — from your first OJT to your first job.

### 1.1 Problem Statement
Filipino students and fresh graduates struggle with three scattered sets of information:

1. **Career data is fragmented.** Experiences, projects, certificates, and skills are spread across folders, cloud drives, and old resume files. Every application requires rewriting and reformatting a resume.
2. **Pre-employment requirements expire.** Documents such as NBI Clearance, Police Clearance, Barangay Clearance, and Medical Certificates have validity periods. Applicants often discover a document has expired only when an employer asks for it, which delays hiring.
3. **Applications and OJT progress are hard to track.** Applicants lose track of where they applied, which resume version they sent, and the status. OJT students track rendered hours and OJT requirements manually.

### 1.2 Solution
A cross-platform mobile app (Android & iOS) built with React Native (Expo) that keeps the user's entire career toolkit in one **private, offline** app:
- Store career data once in modular **vaults** and attach proof documents.
- Generate a **tailored, ATS-friendly PDF resume** per job.
- Track **pre-employment requirements** using smart templates, with expiry reminders.
- Track **job applications** from submission to result.
- Log **OJT hours** and OJT requirements.
- See overall progress through a **Career Readiness Score**.

### 1.3 Target Users
Graduating students, OJT trainees, fresh graduates, and job seekers in the Philippines. Single user per device (no accounts, no server).

### 1.4 Why it is different (for the presentation / Q&A)
- Resume builders (e.g., Canva) treat a resume as a one-time **design**; CareerKit treats a career as **reusable data**.
- **Localized:** Philippine pre-employment requirement templates and expiry tracking.
- **End-to-end:** OJT → build resume → prepare requirements → apply → track result.
- **Offline-first and private:** no internet, no account, nothing uploaded to a server.
- Supports **UN SDG 8 — Decent Work and Economic Growth.**

---

## 2. Modules Summary

| # | Module | Purpose | CRUD |
|---|---|---|---|
| 1 | Career Vault + Document Locker | Profile, Education, Experience, Projects, Skills, Certifications; attach files/images | Full CRUD per category |
| 2 | Resume Builder | Select entries → choose template → export/share PDF; saved resume versions | Full CRUD on resume versions |
| 3 | Requirements Tracker | PH pre-employment documents with smart templates, expiry status, reminders | Full CRUD |
| 4 | Application Tracker | Job applications with status pipeline, linked resume version | Full CRUD |
| 5 | OJT Logger | Daily time records, hours progress, OJT requirements checklist | Full CRUD |
| 6 | Dashboard | Career Readiness Score, expiring documents, application stats, OJT progress | Read (aggregates) |
| — | App Lock (Phase 3) | PIN / biometric lock on app open | Settings |

---

## 3. Tech Stack

| Concern | Choice |
|---|---|
| Framework | React Native with **Expo** (latest stable SDK via `create-expo-app`) |
| Language | **TypeScript** |
| Navigation | **Expo Router** (file-based routing, bottom tabs + stacks) |
| Database | **`expo-sqlite`** (local, offline) |
| File picking | `expo-document-picker`, `expo-image-picker` |
| File storage | `expo-file-system` (copy picked files into the app's document directory) |
| PDF | `expo-print` (HTML → PDF) + `expo-sharing` |
| Notifications | `expo-notifications` (local scheduled notifications only) |
| Biometrics / lock | `expo-local-authentication`, `expo-secure-store` (store PIN hash) |
| Dates | `date-fns` |
| Icons | `@expo/vector-icons` |
| State | React hooks + React Context (no Redux/Zustand unless the team agrees) |

**Notes**
- Do **not** use WatermelonDB or Realm (they need a development build).
- Local notifications should work in Expo Go; if a platform limitation appears, report it and suggest a development build.
- Face ID on iOS may not work inside Expo Go; fingerprint/PIN fallback must always exist.

### 3.1 Commands
```bash
npx create-expo-app@latest careerkit      # initial setup (choose the TypeScript/Expo Router template)
npx expo start                            # run dev server, scan QR with Expo Go
npx expo install <package>                # always install Expo packages this way (version-compatible)
npx tsc --noEmit                          # type check
```

---

## 4. Folder Structure

> **Actual location:** the app lives in `careerkit/`. The Expo SDK 58 template puts routes in `src/app/` (not root `app/`), so everything below sits under `careerkit/src/`. Import with the `@/` alias (e.g., `@/components/Button`).

```
careerkit/
├── app/                          # Expo Router screens
│   ├── _layout.tsx               # root layout: DB init, theme, lock gate
│   ├── (tabs)/
│   │   ├── _layout.tsx           # bottom tabs
│   │   ├── index.tsx             # Dashboard
│   │   ├── vault.tsx             # Career Vault home (category list)
│   │   ├── requirements.tsx      # Requirements Tracker list
│   │   ├── applications.tsx      # Application Tracker list
│   │   └── more.tsx              # OJT Logger, Resume Builder, Settings links
│   ├── vault/
│   │   ├── [category]/index.tsx  # list entries in a category
│   │   ├── [category]/form.tsx   # add/edit entry (?id= for edit)
│   │   └── profile.tsx           # edit profile
│   ├── resume/
│   │   ├── index.tsx             # saved resume versions
│   │   ├── builder.tsx           # select entries + template
│   │   └── preview.tsx           # preview + export
│   ├── requirements/form.tsx
│   ├── requirements/templates.tsx
│   ├── applications/form.tsx
│   ├── applications/[id].tsx
│   ├── ojt/index.tsx             # OJT overview + logs
│   ├── ojt/log-form.tsx
│   ├── ojt/setup.tsx             # company, required hours, dates
│   └── settings.tsx              # app lock, data reset, about
├── src/
│   ├── components/               # reusable UI (Button, Card, Input, EmptyState, StatusBadge, ...)
│   ├── constants/
│   │   ├── theme.ts              # colors, spacing, typography, radius
│   │   └── requirementTemplates.ts
│   ├── db/
│   │   ├── client.ts             # open DB, run migrations
│   │   ├── migrations.ts         # CREATE TABLE statements, versioned
│   │   └── repositories/         # one file per table group (vaultRepo.ts, requirementRepo.ts, ...)
│   ├── hooks/                    # useVaultEntries, useRequirements, useReadinessScore, ...
│   ├── services/
│   │   ├── fileService.ts        # pick + copy + delete files
│   │   ├── pdfService.ts         # build HTML, print to PDF, share
│   │   ├── notificationService.ts
│   │   └── authService.ts        # PIN + biometrics
│   ├── templates/resume/         # HTML resume templates (atsSimple.ts, modern.ts)
│   ├── types/                    # TypeScript types matching DB tables
│   └── utils/                    # date helpers, validators, score calculator
└── CLAUDE.md
```

---

## 5. Database Schema (SQLite)

All dates are stored as ISO strings (`YYYY-MM-DD`, or full ISO for timestamps). Every table has `created_at` and `updated_at`.

```sql
-- Profile (single row, id = 1)
CREATE TABLE IF NOT EXISTS profile (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  full_name TEXT NOT NULL DEFAULT '',
  headline TEXT,               -- e.g., "BSIT Graduate | Front-End Developer"
  email TEXT,
  phone TEXT,
  address TEXT,
  summary TEXT,                -- professional summary / bio
  linkedin_url TEXT,
  portfolio_url TEXT,
  photo_uri TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS education (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  school TEXT NOT NULL,
  degree TEXT NOT NULL,
  start_date TEXT,
  end_date TEXT,               -- NULL = present
  honors TEXT,
  description TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS experiences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  organization TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'job',   -- job | ojt | volunteer | organization
  location TEXT,
  start_date TEXT,
  end_date TEXT,
  description TEXT,            -- bullet points separated by newlines
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  role TEXT,
  tech_used TEXT,              -- comma-separated
  link TEXT,
  start_date TEXT,
  end_date TEXT,
  description TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS skills (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'technical', -- technical | soft | language | tool
  level TEXT,                  -- beginner | intermediate | advanced
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS certifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  issuer TEXT,
  issue_date TEXT,
  expiry_date TEXT,
  credential_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Document Locker: files attached to any record
CREATE TABLE IF NOT EXISTS attachments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_type TEXT NOT NULL,    -- certification | project | education | experience | requirement | ojt_requirement
  owner_id INTEGER NOT NULL,
  file_uri TEXT NOT NULL,      -- path inside FileSystem.documentDirectory
  file_name TEXT NOT NULL,
  mime_type TEXT,
  size_bytes INTEGER,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Saved resume versions
CREATE TABLE IF NOT EXISTS resumes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,         -- e.g., "Front-End Dev – Accenture"
  template TEXT NOT NULL DEFAULT 'ats_simple', -- ats_simple | modern
  target_role TEXT,
  pdf_uri TEXT,                -- last exported PDF
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Which vault entries are included in a resume version
CREATE TABLE IF NOT EXISTS resume_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  resume_id INTEGER NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL,     -- education | experience | project | skill | certification
  item_id INTEGER NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- Pre-employment requirements
CREATE TABLE IF NOT EXISTS requirements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,          -- e.g., "NBI Clearance"
  category TEXT NOT NULL DEFAULT 'private', -- private | government | abroad | custom
  reference_no TEXT,
  issue_date TEXT,
  expiry_date TEXT,            -- NULL = no expiry
  status_override TEXT,        -- NULL | 'not_yet_obtained'
  notes TEXT,
  reminder_days_before INTEGER NOT NULL DEFAULT 14,
  notification_id TEXT,        -- scheduled local notification id
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Job applications
CREATE TABLE IF NOT EXISTS applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company TEXT NOT NULL,
  position TEXT NOT NULL,
  date_applied TEXT NOT NULL,
  channel TEXT,                -- JobStreet | LinkedIn | Walk-in | Referral | Company site | Other
  status TEXT NOT NULL DEFAULT 'applied', -- applied | interview | offer | rejected | withdrawn
  resume_id INTEGER REFERENCES resumes(id) ON DELETE SET NULL,
  salary_offer TEXT,
  next_step_date TEXT,         -- e.g., interview date
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- OJT setup (single row, id = 1)
CREATE TABLE IF NOT EXISTS ojt_info (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  company TEXT,
  supervisor TEXT,
  required_hours REAL NOT NULL DEFAULT 486,
  start_date TEXT,
  target_end_date TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- OJT daily time records
CREATE TABLE IF NOT EXISTS ojt_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  log_date TEXT NOT NULL,
  time_in TEXT NOT NULL,       -- HH:mm
  time_out TEXT NOT NULL,      -- HH:mm
  break_minutes INTEGER NOT NULL DEFAULT 60,
  hours REAL NOT NULL,         -- computed and stored
  tasks TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- OJT requirements checklist
CREATE TABLE IF NOT EXISTS ojt_requirements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,          -- e.g., "MOA", "Endorsement Letter"
  is_done INTEGER NOT NULL DEFAULT 0,
  due_date TEXT,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- App settings (key-value)
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT
);
```

**Rules**
- Run `PRAGMA foreign_keys = ON;` on DB open.
- Migrations are versioned using `PRAGMA user_version`. Never edit an old migration; add a new one.
- `attachments` has no FK (polymorphic). When deleting a record, its repository must also delete its attachments **and** the physical files.

---

## 6. Functional Requirements

Format: **FR-ID — requirement** → *acceptance criteria*.

### 6.1 Career Vault (Module 1)
- **FR-V1** — User can create, view, edit, and delete entries in each category: Education, Experience, Projects, Skills, Certifications.
  → Each category has a list screen (sorted newest first by end/issue date), an add/edit form, and a delete action with a confirmation dialog.
- **FR-V2** — User can edit a single Profile (name, headline, contact info, summary, links, photo).
- **FR-V3** — Forms validate input.
  → Required fields are marked; inline error messages; end date cannot be before start date; email/URL format checked.
- **FR-V4** — Empty states.
  → Every list shows a friendly empty state with an "Add" button when there is no data.
- **FR-V5** — Search within a category list (filter by text).

### 6.2 Document Locker (part of Module 1)
- **FR-D1** — User can attach one or more files (PDF or image) to a Certification, Project, Education, Experience, or Requirement entry, using the document picker or camera/gallery.
- **FR-D2** — Picked files are **copied** to `FileSystem.documentDirectory + 'attachments/'` with a unique name; the DB stores the new path (the picker's cache URI is temporary).
- **FR-D3** — User can view an attachment (images in-app; PDFs via share/open), replace it, or delete it. Deleting removes the physical file.
- **FR-D4** — Max file size 10 MB; show an error if exceeded.

### 6.3 Resume Builder (Module 2)
- **FR-R1** — User creates a resume version: enters a title/target role, then selects which entries to include using checkboxes grouped by category (profile is always included).
- **FR-R2** — User can reorder selected items within a section (up/down buttons are enough).
- **FR-R3** — User picks a template: `ats_simple` (Phase 1) and `modern` (Phase 3).
- **FR-R4** — App generates a PDF from an HTML template using `expo-print`, shows a preview, and allows **Share** (`expo-sharing`) or **Save**.
- **FR-R5** — Resume versions are saved (CRUD): list, re-open and edit selection, duplicate, delete.
- **FR-R6** — ATS-friendly rules for `ats_simple`: single column, standard section headings (Summary, Education, Experience, Projects, Skills, Certifications), real text (no text-in-images), no tables for layout, standard fonts, A4 size.

### 6.4 Requirements Tracker (Module 3)
- **FR-Q1** — User can add, view, edit, and delete requirement records (name, category, reference no., issue date, expiry date, notes, reminder days, attachment).
- **FR-Q2 — Smart Templates.** User picks a template set (Private, Government, Abroad/OFW). The app shows a checklist of common documents from `requirementTemplates.ts`; selected items are created as requirement records with status "Not yet obtained." User can still add custom items.
- **FR-Q3 — Auto status** (computed, not stored):
  - `not_yet_obtained` if `status_override = 'not_yet_obtained'` or no issue date
  - `expired` if `expiry_date < today`
  - `expiring_soon` if `expiry_date` is within **30 days**
  - `valid` otherwise (or no expiry date)
  → Shown as a colored `StatusBadge` (see Section 8).
- **FR-Q4 — Suggested expiry.** When the user enters an issue date for a templated item with a default validity, pre-fill the expiry date (user can change it).
- **FR-Q5 — Reminders.** On save, schedule a local notification `reminder_days_before` days before expiry (9:00 AM). On edit, cancel the old notification and reschedule. On delete, cancel it.
- **FR-Q6** — Filter the list by status and category.

### 6.5 Application Tracker (Module 4)
- **FR-A1** — User can add, view, edit, and delete applications (company, position, date applied, channel, status, linked resume version, next step date, salary offer, notes).
- **FR-A2** — Status pipeline: `applied → interview → offer`, plus `rejected` / `withdrawn`. Status can be changed quickly from the detail screen.
- **FR-A3** — List can be filtered by status and searched by company/position.
- **FR-A4** — Detail screen shows which resume version was sent and lets the user open/share that PDF.
- **FR-A5** *(Phase 3, optional)* — Optional reminder for `next_step_date` (e.g., interview).

### 6.6 OJT Logger (Module 5)
- **FR-O1** — OJT setup: company, supervisor, required hours (default 486, editable), start date, target end date.
- **FR-O2** — User can add, view, edit, and delete daily logs (date, time in, time out, break minutes, tasks).
  → Hours = (time_out − time_in − break) in hours, rounded to 2 decimals; time_out must be after time_in; no duplicate date entries (warn).
- **FR-O3** — OJT overview shows total rendered hours, remaining hours, a progress bar, and an estimated completion date (based on average hours per logged day).
- **FR-O4** — OJT requirements checklist (CRUD): name, done/not done, due date, notes, attachment. Seed defaults on first setup (see Section 7.2).
- **FR-O5** *(Phase 3, optional)* — Export DTR summary as PDF.

### 6.7 Dashboard (Module 6)
- **FR-H1** — Shows the **Career Readiness Score** (0–100) as a progress ring with a short message and the top 2–3 suggestions to improve.
- **FR-H2** — Shows cards: documents expiring soon/expired, application counts by status, OJT progress (if set up), quick actions (Add Experience, New Resume, Log OJT Hours).
- **FR-H3** — Data refreshes when the screen is focused.

### 6.8 App Lock (Phase 3)
- **FR-L1** — User can enable a 4–6 digit PIN in Settings. Store only a **hash** of the PIN in `expo-secure-store`.
- **FR-L2** — If enabled, the app shows a lock screen on launch and when returning from background after 1 minute. Biometrics offered if available; PIN is always the fallback.
- **FR-L3** — Settings also has "Reset all data" (with double confirmation), which clears the DB and the attachments folder.

---

## 7. Business Rules & Seed Data

### 7.1 Career Readiness Score (`src/utils/readinessScore.ts`)
Total = 100 points:

| Criterion | Points |
|---|---|
| Profile has name, email, phone, and summary | 15 |
| At least 1 Education entry | 15 |
| At least 1 Experience **or** Project | 20 |
| At least 3 Skills | 15 |
| At least 1 Certification | 10 |
| At least 1 requirement is `valid` **and** none are `expired` | 15 |
| At least 1 saved resume version | 10 |

Messages: 0–39 "Let's get started", 40–69 "Getting there", 70–89 "Almost job-ready", 90–100 "Job-ready!"
Suggestions: list the unmet criteria as short actions (e.g., "Add at least 3 skills", "Renew your expired NBI Clearance").
Keep this as a **pure function** (input: counts/statuses → output: score, label, suggestions) so it is easy to test and explain.

### 7.2 Templates (`src/constants/requirementTemplates.ts`)
Default validity values are **editable suggestions only**; rules vary by issuing office and employer, so the user can always change the expiry date. Show this note in the UI.

```ts
export const REQUIREMENT_TEMPLATES = {
  private: [
    { name: 'NBI Clearance', defaultValidityMonths: 12 },
    { name: 'Police Clearance', defaultValidityMonths: 6 },
    { name: 'Barangay Clearance', defaultValidityMonths: 6 },
    { name: 'Medical Certificate / Pre-employment Medical', defaultValidityMonths: 6 },
    { name: 'PSA Birth Certificate', defaultValidityMonths: null },
    { name: 'TIN', defaultValidityMonths: null },
    { name: 'SSS Number', defaultValidityMonths: null },
    { name: 'PhilHealth Number', defaultValidityMonths: null },
    { name: 'Pag-IBIG MID Number', defaultValidityMonths: null },
    { name: 'Transcript of Records / Diploma', defaultValidityMonths: null },
    { name: '2x2 ID Photos', defaultValidityMonths: null },
  ],
  government: [
    { name: 'Personal Data Sheet (CS Form 212)', defaultValidityMonths: null },
    { name: 'CSC Eligibility / Certificate of Eligibility', defaultValidityMonths: null },
    { name: 'NBI Clearance', defaultValidityMonths: 12 },
    { name: 'PSA Birth Certificate', defaultValidityMonths: null },
    { name: 'Transcript of Records / Diploma', defaultValidityMonths: null },
    { name: 'Medical Certificate', defaultValidityMonths: 6 },
    { name: 'Certificate of Employment / Service Record (if any)', defaultValidityMonths: null },
  ],
  abroad: [
    { name: 'Passport', defaultValidityMonths: 120 },
    { name: 'PSA Birth Certificate', defaultValidityMonths: null },
    { name: 'NBI Clearance', defaultValidityMonths: 12 },
    { name: 'Transcript of Records / Diploma', defaultValidityMonths: null },
    { name: 'Medical Exam Result', defaultValidityMonths: 3 },
  ],
} as const;

export const OJT_REQUIREMENT_DEFAULTS = [
  'Endorsement Letter',
  'Memorandum of Agreement (MOA)',
  'Parent/Guardian Consent (Waiver)',
  'Medical Certificate',
  'Insurance',
  'Resume',
  'Daily Time Record (DTR)',
  'Training Plan',
  'Weekly / Narrative Reports',
  'Certificate of Completion',
  'Supervisor Evaluation Form',
];
```

### 7.3 Dates
- Use `date-fns` for all date math. Display format: `MMM d, yyyy` (e.g., "Nov 6, 2026").
- Use a native-friendly date picker input (ask before adding a package such as `@react-native-community/datetimepicker`).

---

## 8. UI / Design Guidelines

Goal (rubric): **intuitive, visually appealing, consistent**. Every screen must use the shared theme and components; no hard-coded colors or spacing in screens.

### 8.1 Theme (`src/constants/theme.ts`)
- **Primary:** deep blue `#1E3A8A` (trust, professional); **Accent:** teal `#0D9488`
- **Background:** `#F8FAFC`; **Surface/Card:** `#FFFFFF`; **Text:** `#0F172A`; **Muted text:** `#64748B`; **Border:** `#E2E8F0`
- **Status colors:** Valid `#16A34A`, Expiring soon `#F59E0B`, Expired `#DC2626`, Not yet obtained `#64748B`
- **Application status colors:** Applied blue, Interview purple, Offer green, Rejected red, Withdrawn gray
- **Spacing scale:** 4, 8, 12, 16, 24, 32. **Radius:** 12 for cards, 8 for inputs/buttons.
- **Typography:** system font; sizes 12 / 14 / 16 / 20 / 24 / 32; headings semibold.
- Dark mode is optional (Phase 3).

### 8.2 Shared components (`src/components/`)
`Screen` (safe area + padding), `Header`, `Card`, `Button` (primary/secondary/danger), `TextField` (label + error), `DateField`, `Select`, `Checkbox`, `StatusBadge`, `EmptyState`, `ListItem`, `ProgressRing`, `ProgressBar`, `ConfirmDialog`, `FAB` (floating add button), `AttachmentPicker`.

### 8.3 UX rules
- Bottom tabs: **Home, Vault, Requirements, Applications, More**.
- Every list: FAB to add, tap to view/edit, delete with confirmation, empty state.
- Show loading indicators for PDF generation and file operations; show success feedback (toast/snackbar or alert).
- Touch targets at least 44×44; readable contrast; labels on all inputs.
- Keyboard should not cover inputs (`KeyboardAvoidingView` / scroll).

---

## 9. Architecture & Coding Conventions

- **Layers:** Screens (`app/`) → Hooks (`src/hooks/`) → Repositories (`src/db/repositories/`) / Services (`src/services/`).
  - Screens handle UI only.
  - Hooks load data and expose actions (e.g., `useRequirements()` returns `{ items, loading, create, update, remove, refresh }`).
  - Repositories contain all SQL (parameterized queries only — never string-concatenate user input).
  - Services wrap native APIs (files, PDF, notifications, auth).
- **Types:** one TypeScript type per table in `src/types/`, plus `NewX` types for inserts.
- **Naming:** components `PascalCase.tsx`, hooks `useCamelCase.ts`, others `camelCase.ts`. DB columns `snake_case`; map to `camelCase` in repositories.
- **Errors:** wrap DB/file/PDF calls in `try/catch`; show a user-friendly message; `console.warn` the details.
- **Validation:** keep validators in `src/utils/validators.ts`.
- **No magic numbers:** constants (e.g., `EXPIRING_SOON_DAYS = 30`, `MAX_FILE_MB = 10`) in `src/constants/`.
- **Formatting:** Prettier defaults; ESLint from the Expo template.
- **Git:** small commits per feature, message format `feat(vault): add experience form`. Each member works on a branch named after their module.

---

## 10. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-1 | Runs on Android and iOS from one codebase (Expo). |
| NFR-2 | Fully usable offline; no network calls. |
| NFR-3 | Data stays on the device; PIN stored only as a hash in secure storage. |
| NFR-4 | Lists and screens open in under 1 second with ~100 records per table. |
| NFR-5 | PDF generation completes in under 3 seconds for a typical resume. |
| NFR-6 | Consistent UI using the shared theme and components (Section 8). |
| NFR-7 | Code is organized by the layers in Section 9 and passes `npx tsc --noEmit`. |

### Out of scope
Cloud sync/backup, user accounts, applying to jobs inside the app, online job search, AI-generated content, full CS Form 212 (PDS) generation.

### Future enhancements (for the presentation)
Simplified PDS auto-fill from vault data, PRC license & CPD units tracker, interview answer bank (STAR format), English/Filipino language toggle, encrypted backup/export, job-posting keyword matcher.

---

## 11. Build Order (Phases)

Work top to bottom. Check items off as they are completed.

### Phase 1 — Core (must finish)
- [x] 1.1 Project setup: Expo + TypeScript + Expo Router, folder structure, theme, shared components (`Screen`, `Card`, `Button`, `TextField`, `EmptyState`, `FAB`, `ConfirmDialog`)
- [x] 1.2 Database: `client.ts`, migrations for all tables, foreign keys on
- [x] 1.3 Bottom tabs with placeholder screens
- [x] 1.4 Profile screen (FR-V2) — text fields; photo picker added in 1.7
- [x] 1.5 Vault CRUD for one category end-to-end (Experience) — this becomes the pattern
- [x] 1.6 Vault CRUD for Education, Projects, Skills, Certifications (FR-V1, V3, V4)
- [x] 1.7 Document Locker: `fileService`, `AttachmentPicker`, attach/view/delete (FR-D1–D4)
- [x] 1.8 Resume Builder: selection screen, `ats_simple` HTML template, preview, export/share, saved versions (FR-R1–R6)

### Phase 2 — Differentiators
- [ ] 2.1 Requirements Tracker CRUD + `StatusBadge` + auto status (FR-Q1, Q3, Q6)
- [ ] 2.2 Smart Templates + suggested expiry (FR-Q2, Q4)
- [ ] 2.3 Expiry notifications (FR-Q5)
- [ ] 2.4 Application Tracker CRUD + status pipeline + linked resume (FR-A1–A4)
- [ ] 2.5 OJT setup, daily logs, progress, OJT requirements checklist (FR-O1–O4)
- [ ] 2.6 Dashboard + Career Readiness Score (FR-H1–H3, Section 7.1)

### Phase 3 — Polish & Stretch
- [ ] 3.1 App Lock with PIN + biometrics; Reset all data (FR-L1–L3)
- [ ] 3.2 `modern` resume template
- [ ] 3.3 Search/filters polish (FR-V5), interview reminders (FR-A5), OJT DTR PDF (FR-O5)
- [ ] 3.4 UI polish pass: consistency check on every screen, loading/success states, app icon & splash screen
- [ ] 3.5 Seed **demo data** script (a sample student profile) for the presentation video
- [ ] 3.6 Final test on a real Android **and** iOS device (or emulator)

---

## 12. Team Roles (edit names)

| Member | Module ownership | Also responsible for |
|---|---|---|
| Member 1 (Leader) | Project setup, DB layer, Dashboard & Readiness Score | Code review, merging |
| Member 2 | Career Vault + Document Locker | — |
| Member 3 | Resume Builder (PDF templates) | Demo data |
| Member 4 | Requirements Tracker + Notifications | — |
| Member 5 | Application Tracker + OJT Logger | App Lock |
| All | UI consistency, testing, presentation | Reflections |

Each member should be able to explain: the screens in their module, the tables they use, how their repository/hook works, and one challenge they solved (for the Reflection part of the presentation).

---

## 13. Demo Scenario (for the system demonstration)

1. Open the app → (unlock) → Dashboard shows a low Readiness Score with suggestions.
2. Fill in Profile, add Education, an OJT Experience, 2 Projects, Skills, and a Certification with an attached image.
3. OJT Logger: show logged hours and the progress bar.
4. Requirements: apply the **Private** template, enter NBI Clearance issue date → expiry auto-filled → show an **Expired** Police Clearance badge.
5. Resume Builder: select specific entries for "Junior Web Developer" → generate and share PDF.
6. Application Tracker: log an application using that resume version → move status to **Interview**.
7. Return to Dashboard → score has increased → explain the offline, private design.
