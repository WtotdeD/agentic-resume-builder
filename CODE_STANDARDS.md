# Code standards

The rules a pull request is judged against. Every one of them describes code
that exists in this repo — if a rule here no longer matches reality, deleting it
is a valid pull request.

## Types come from schemas

- Data shapes are Zod schemas in `src/schemas/`. Types are derived with
  `z.infer<>` and re-exported from `src/types/`. Do not hand-write an interface
  that duplicates a schema — the two will drift, and the schema wins at runtime.
- No `any`, no `@ts-ignore`, no `@ts-expect-error`. If a dependency has poor
  types, declare them in `src/types/`.
- No non-null assertions (`!`). Use `?.` and `??`. `noUncheckedIndexedAccess` is
  on, so indexing gives you `T | undefined` and you are expected to handle it.
- Validate at boundaries only — API bodies, parsed files, env vars. Internal
  functions that already receive typed data must not re-validate.
- Exported functions carry explicit return types.

## Template components stay pure

- Everything under `src/components/templates/` takes props and returns JSX. No
  `useState`, no `useEffect`, no fetching, no reading globals.
- `/render/<lens>` renders the template and nothing else. It is the Puppeteer
  capture target, so any chrome added there lands in the PDF.
- Interactive pieces live outside the template — see `src/app/viewer-controls.tsx`
  and `src/hooks/useExportPdf.ts`.

## Formatting is centralised

- Dates, markdown and URLs are formatted by `src/lib/formatting/`. A component
  that formats a date inline is the bug — two templates then disagree about what
  a date looks like.
- Those functions are pure and handle the awkward cases: absent end date meaning
  "Present", missing optional fields, empty strings.

## Print fidelity

- The template renders at A4. Section-level blocks carry `break-inside: avoid`
  so a section is not split across a page boundary.
- Styling is Tailwind utilities. Print-only behaviour uses the `print:` variant;
  screen-only elements use `no-print`.
- Fonts are self-hosted `.woff2` in `public/fonts/`. No font CDN — it works in
  your browser and fails in headless Chromium.
- If you change the PDF pipeline, export a PDF and compare it against the screen
  preview. Nothing else catches a print regression.

## Resource safety in the PDF path

- Chromium comes from the singleton pool in `src/lib/pdf/browser-pool.ts`. Never
  launch a browser per request.
- Close pages in a `finally` block. An unclosed page leaks and crashes the server
  hours later, far from the code that caused it.
- Keep the 30s navigation timeout. Return a structured error, never a stack
  trace, from an API response.
- Code under `src/app/api/` and `src/lib/pdf/` must not import React components.
  It talks to the render layer over HTTP.

## Content and lenses

- A `##` heading is matched by exact string. A new heading renders nowhere until
  its exact name is in a lens's `sections:` list, and a mismatch fails silently.
  After changing content or a lens, **open `/render/<lens>` and look.**
- Nothing derives the Skills section from entry frontmatter. A technology added
  to an entry must also be added to `content/skills.md` by hand.
- Dates are `YYYY-MM`. `repo:` values and the LinkedIn/GitHub settings must be
  valid URLs; `email` must be a valid email address.
- `draft: true` hides an entry from every resume.
- Content in this repo is English only.

## Tests

- A change comes with tests. Write the test first, watch it fail, then make it
  pass — a test that has never failed proves nothing.
- Test behaviour, not internals: what a function returns, what a component
  renders.
- No `it.skip` in merged code.
- `tests/integration/lenses.test.ts` must stay generic. It discovers lenses from
  disk and asserts invariants; it must never mention a lens name or a string from
  the demo persona, or every fork that replaces `content/` inherits a broken
  suite.

## Dependencies and scope

- A dependency needs a justification. Nothing gets added for a job that fewer
  than ~30 lines of local code would do.
- Build what is needed now. No speculative features.
- Wait for the third use before abstracting. Three similar lines beat a wrong
  abstraction.
- Compose classes with `cn()` (`src/components/ui/cn.ts`), not string
  concatenation.

## Before you push

`pnpm validate` — lint, format check, tests, build. CI runs the same thing, plus
a Docker build and a smoke test against the running container.
