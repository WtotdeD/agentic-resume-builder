# Architecture

The idea in one line: **your career is a vault of markdown, and each resume is a
lens over it.** Nothing is duplicated between resumes, because a resume is a
selection, not a copy.

## The pipeline

```
content/                 resumes/<lens>.yaml
   |                            |
   | src/lib/content/*.ts       | src/lib/config/parse-config.ts
   | -> loadContentVault()      | -> parseResumeConfig()
   v                            v
ContentVault ------------> assembleResume() <---- src/lib/assemble/
                                 |
                                 | validated by assembledResumeSchema
                                 v
                          AssembledResume
                                 |
              src/app/render/[config]/page.tsx
                                 |
              src/components/templates/ResumeTemplate.tsx
                                 |
                    +------------+------------+
                    |                         |
              browser preview           POST /api/export-pdf
                                              |
                                   src/lib/pdf/exporter.ts
                                   -> Puppeteer visits /render/<lens>
                                   -> A4 PDF
```

Both sides read from disk on every request. Edit a file, reload the page — that
is the whole feedback loop. There is no database, no build step for content, and
no cache to invalidate.

## The parts

| Path                        | What lives there                                                                                                    |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `content/`                  | The vault. Markdown with YAML frontmatter, plus `settings.yaml`.                                                    |
| `resumes/`                  | The lenses. One YAML file per audience.                                                                             |
| `src/lib/content/`          | One parser per content file, and `vault.ts` which loads them all.                                                   |
| `src/lib/config/`           | `parse-config.ts` for one lens, `list-configs.ts` for the index page.                                               |
| `src/lib/assemble/`         | `assembleResume()` — applies a lens to the vault.                                                                   |
| `src/schemas/`              | Zod schemas. Every type in the app is derived from these.                                                           |
| `src/components/templates/` | `ResumeTemplate.tsx` and `sections/` — pure renderers.                                                              |
| `src/lib/formatting/`       | Dates, markdown, URLs. All formatting lives here, never in a component.                                             |
| `src/lib/pdf/`              | `browser-pool.ts` (singleton Chromium) and `exporter.ts`.                                                           |
| `src/lib/i18n/`             | Section heading translations. The app derives locale from a `.nl` filename suffix; only English content ships here. |

## The two couplings, and how each one fails

A lens refers to vault content by string. There are two such references, and
**they fail in opposite ways** — this is the single most important thing to know
about this codebase.

### `expand:` references an entry `id` — fails loudly

A lens lists which experience entries to render in full. An id matching no file
in `content/experience/` throws from `assembleResume()`:

```
tech-lead: experience.expand references non-existent ID "kraken-senior"
```

The render route catches it and shows an error box on the page. You will notice
this one. The same is true of `showcases:`, `certifications:`, `skills:` and
`projects:` — every one of them throws on an unknown name.

### `sections:` matches `##` headings by exact string — fails silently

A lens lists which `##` headings inside an expanded entry to show. Matching is by
exact string: case, spacing and `&` all count. A heading listed in the lens but
present in no expanded entry produces **nothing** — no error, no warning, no log
line. The section simply is not on the page.

This is deliberate. Lenses share section lists, and not every entry fills every
heading, so a missing one cannot be treated as a mistake. The cost is that a typo
is indistinguishable from an intentional omission.

`tests/integration/lenses.test.ts` covers the half of this that is decidable: if
an expanded entry _does_ provide a configured heading, that heading must reach
the assembled resume. It cannot tell you that `Cost and Efficiency` was meant to
be `Cost & Efficiency`. **Only opening the page can.**

The heading vocabulary in use: `Achievements`, `Architecture`,
`Leadership & Mentoring`, `Data Quality`, `Cost & Efficiency`, `Community`. A new
heading is allowed, but renders nowhere until its exact name is added to a lens's
`sections:` list.

## Why the render route has no chrome

`/render/<lens>` is the Puppeteer capture target. Anything visible on that route
lands in the PDF, so it renders the template and nothing else — no navigation, no
buttons, no toolbars. The viewer controls live on the index page instead.

For the same reason the template components take props and return JSX, with no
hooks, state or fetching. A component that behaves differently on the second
render produces a PDF that does not match the preview, and that class of bug is
miserable to track down.

## PDF export

`POST /api/export-pdf` with `{"configName": "<lens>"}`. The route asks
`exporter.ts` for a PDF; the exporter takes a page from the singleton browser
pool, navigates to `/render/<lens>`, waits for `document.fonts.ready` (with a 5s
cap, then proceeds with fallback fonts), and prints A4 with `printBackground`.

Chromium is expensive, so `browser-pool.ts` keeps one instance and hands out
pages. It detects a disconnected browser and relaunches rather than returning a
dead handle. Pages are closed in a `finally` block — an unclosed page is a leak
that crashes the server hours later, far from its cause.

Fonts are self-hosted in `public/fonts/`. A font CDN would work in your browser
and fail in headless Chromium.

## The agentic tooling

`.claude/skills/` is part of how this repo is meant to be used, not stray config:

- **`content-interview`** — interviews you about a role, achievement or showcase
  and writes a correctly formatted file into `content/`. It knows the frontmatter
  shape and the heading vocabulary, which is most of what makes a new entry
  tedious to write by hand.
- **`run-app`** — launches the app, renders every lens, exports a PDF, takes
  screenshots. This is how you check the silent coupling above without clicking
  through five pages yourself.

Neither is required. `content/` is plain markdown and you can write it in any
editor.
