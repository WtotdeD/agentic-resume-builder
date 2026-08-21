# agentic-resume-builder Development Guidelines

## What this repo is

A resume builder. Career content lives as markdown in `content/`; each file in
`resumes/` is a YAML "lens" that selects and arranges that content for one
audience. The app renders a lens to HTML and exports it as an A4 PDF.

**The profile in `content/` is fictional demo data.** Replace it with your own.

## Active Technologies

- TypeScript 5+ (strict mode: `noUncheckedIndexedAccess`, `noUnusedLocals`, `noUnusedParameters`) + Next.js 14+ (App Router), React 18+, Zod 4+, Puppeteer, Tailwind CSS 3.4+, clsx, tailwind-merge

## Package Manager

Use `pnpm` for all operations. Do NOT use npm or yarn.

## Validation

Run `pnpm validate` (lint + format:check + test + build) before every commit.

## Authoring content

Use the `content-interview` skill (`.claude/skills/content-interview/`) to add a
job, showcase or project. It interviews the user and writes a correctly formatted
file into `content/`.

### The two couplings, and how each one fails

1. **`expand:` references an entry `id`** — **fails loudly.** A config lists
   experience ids to render in full. An id matching no file in
   `content/experience/` throws
   `experience.expand references non-existent ID`, which the render route catches
   and displays as an error box on the page. You will notice this one.
2. **`sections:` matches `##` headings by exact string** — **fails silently.** A
   config lists the section headings it wants. A heading present in an entry but
   absent from the config does not render; a heading listed in the config but
   present in no expanded entry produces nothing. Case, spacing and `&` must match
   exactly, and there is no error, no warning, and no log line either way.

The silent one is what to watch. After changing content or configs, a clean
`pnpm validate` does not mean the resume renders what you intended — open
`/render/<config-name>` and confirm the sections you expect are actually there.

### Fixed section-heading vocabulary

Use these headings in experience entries:

`Achievements` · `Architecture` · `Leadership & Mentoring` · `Data Quality` ·
`Cost & Efficiency` · `Community`

A new heading is allowed, but it renders nowhere until its exact name is added to
a config's `sections:` list.

### Other content rules

- `draft: true` hides an entry from every resume. A vault of drafts renders an
  empty page.
- Content is **English only** in this repo. The app derives locale from a `.nl`
  filename suffix, but no Dutch content ships here.
- Nothing derives the Skills section from entry frontmatter. Technologies added
  to an entry must also be added to `content/skills.md` by hand.
- Dates are `YYYY-MM`. `showcases.md` `repo:` values and the LinkedIn/GitHub
  settings must be valid URLs; `email` must be a valid email address.
