---
name: run-app
description: Launches the resume app locally and drives it — renders every lens, exports a PDF, screenshots a page. Use when asked to run or start the app, screenshot a resume, or confirm a content/config/template change actually renders.
argument-hint: [optional: config name, defaults to every config in resumes/]
---

# Run the app

Launch the Next.js dev server, then drive it. A 200 from a render route proves
almost nothing here — see step 2.

## 1. Launch

```bash
PORT=3111 pnpm dev -p 3111 > /tmp/dev.log 2>&1 &
sleep 10 && tail -3 /tmp/dev.log
```

`PORT` must match `-p`. The export route builds its own base URL from
`process.env.PORT` (`src/app/api/export-pdf/route.ts`) rather than from the
incoming request, so leaving it unset makes PDF export fetch localhost:3000 —
either nothing, or some other project's server.

Stop it with `pkill -f 'ne[x]t dev'`. The bracket is load-bearing: a plain
`next dev` pattern matches the invoking shell's own command line and kills it.

## 2. Drive the render routes

`sections:` in a config matches `##` headings by exact string and fails
silently, so check the HTML body, not the status code:

```bash
for c in $(ls resumes/*.yaml | xargs -n1 basename | sed 's/.yaml//'); do
  code=$(curl -s http://localhost:3111/render/$c -o /tmp/$c.html -w '%{http_code}')
  echo "$c $code: $(grep -oE '<h2[^>]*>[^<]+' /tmp/$c.html | sed 's/.*>//' | paste -sd' ')"
done
grep -ilE 'non-existent ID|Failed to' /tmp/*.html   # expand: errors surface as an error box
```

`grep -o`, not `grep -c` — the HTML is minified onto two lines, so a line count
reports "2 sections" for every config regardless of what rendered.

Note this lists only top-level sections. The per-entry `##` headings
(`Achievements`, `Architecture`, …) render as `<h4>`; to check those, grep `<h4`
the same way or read a screenshot. Compare against the config's `sections:`
list — a section listed there but missing from the page is a heading string
mismatch, not a render failure.

## 3. Export a PDF

```bash
curl -s -D /tmp/hdr.txt -o /tmp/out.pdf -X POST http://localhost:3111/api/export-pdf \
  -H 'Content-Type: application/json' -d '{"configName":"tech-lead"}'
file /tmp/out.pdf   # expect: PDF document, 2-4 pages
```

Page count is the signal worth reading — a template or content change that
pushes a resume from 3 pages to 5 is a regression nothing else catches.

## 4. Screenshot, and look at it

Write the script into the project root, not a temp dir — Puppeteer resolves from
the project's `node_modules`. Chrome is already present in `~/.cache/puppeteer`;
nothing needs installing.

```js
import puppeteer from 'puppeteer';
const b = await puppeteer.launch({ args: ['--no-sandbox'] });
const p = await b.newPage();
await p.setViewport({ width: 1280, height: 1600 });
await p.goto('http://localhost:3111/render/tech-lead', { waitUntil: 'networkidle0' });
await p.screenshot({ path: 'shot.png', fullPage: true });
await b.close();
```

Read the PNG back. A blank frame or missing sections is a failure even when
every status code was 200.
