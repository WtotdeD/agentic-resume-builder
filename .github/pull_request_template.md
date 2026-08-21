## What this changes

<!-- One or two sentences. What is different after this merges, and why. -->

## How it was verified

<!-- The evidence, not the intention. Paste the passing test line, the build
output, or what you saw at /render/<lens>. "Should work" is not verification. -->

## Checklist

- [ ] `pnpm validate` passes locally (lint, format check, tests, build)
- [ ] Tests cover the change, and I have seen them fail without it
- [ ] No `any`, no `@ts-ignore`, no non-null `!` — types come from the Zod
      schemas in `src/schemas/`
- [ ] Components under `src/components/templates/` stayed pure — props in, JSX
      out, no hooks, state, or fetching
- [ ] Date and text formatting goes through `src/lib/formatting/`, not inline in
      a component

If this touches `content/` or `resumes/`:

- [ ] I opened `/render/<lens>` and confirmed the sections I expected are
      actually on the page — a `sections:` heading that matches nothing fails
      silently
- [ ] Any new technology is also in `content/skills.md`, which nothing derives
      automatically

If this touches the PDF pipeline:

- [ ] Pages are closed in a `finally` block, and no stack trace reaches an API
      response
- [ ] I exported a PDF and compared it against the screen preview

`CODE_STANDARDS.md` explains each of these. `ARCHITECTURE.md` explains why the
`sections:` coupling behaves the way it does.
