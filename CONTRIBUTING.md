# Contributing

Thanks for looking. This is a small project with a deliberately small surface —
the most useful contributions are usually bug fixes, a section component, or
making an existing thing simpler.

**If you only want your own resume, you do not need this file.** Fork the repo,
replace `content/` with your own career, and never open a pull request. That is
the intended use.

## Setup

You need Node 18.17+ (CI and the container run 22) and pnpm. The repo pins its
pnpm version in `package.json`, so [corepack](https://nodejs.org/api/corepack.html)
will pick up the right one:

```bash
corepack enable
pnpm install
pnpm dev
```

Open <http://localhost:3000>. You will see the lenses in `resumes/`; each links
to its rendered resume.

**PDF export needs Chromium.** `pnpm install` fetches one for Puppeteer, which
works on most machines. If export fails locally, use the container instead — it
ships a known-good Chromium:

```bash
docker compose up -d --build
```

`docs/docker.md` covers ports, volumes and troubleshooting.

## The loop

Content and lenses are read from disk on every request. Edit a file, reload the
page. No rebuild, no restart.

## Before you open a pull request

```bash
pnpm validate
```

That runs lint, format check, tests and build — the same four things CI runs. CI
additionally builds the Docker image and smoke-tests a render route and a PDF
export against the running container.

**A green `pnpm validate` does not mean your resume renders what you intended.**
A `sections:` heading that matches nothing produces no error and no warning. If
you touched `content/` or `resumes/`, open `/render/<lens>` and confirm the
sections you expect are on the page. `ARCHITECTURE.md` explains why this coupling
behaves the way it does.

## Tests

Write the test first and watch it fail. A test that has never failed proves
nothing — the mutation is the evidence, not the green tick.

- Unit tests: `tests/unit/`, mirroring the source file they cover.
- Integration: `tests/integration/`. `lenses.test.ts` assembles every lens in
  `resumes/` against the real `content/` vault, and must stay free of lens names
  and demo-persona strings so a fork inherits a working suite.

```bash
pnpm test          # once
pnpm test:watch    # while working
```

## Pull requests

1. Fork, then branch off `main`. Name the branch after the change.
2. Keep the PR to one logical change. Two unrelated fixes are two PRs — it is
   not pedantry, it is so one can be reverted without the other.
3. Commit messages: short imperative first line, body explaining _why_. The
   diff already shows _what_.
4. Fill in the PR template. The checklist is the same one in
   `CODE_STANDARDS.md`.
5. Say how you verified it. Paste the passing test, the build line, or what you
   saw on the page. "Should work" is not verification.

`CODE_STANDARDS.md` is the full set of rules a PR is judged against.
`ARCHITECTURE.md` explains how the pieces fit, and is worth ten minutes before a
first change.

## Adding content

The `content-interview` skill in `.claude/skills/` interviews you about a role
and writes a correctly formatted entry into `content/`. Or copy an existing file
— it is plain markdown with YAML frontmatter.

## Reporting a bug

Use the issue templates. If a section is missing from a rendered resume, check
the exact-string match first — it is almost always that.
