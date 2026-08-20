# Running agentic-resume-builder in Docker

## Quick start on a clean machine

```bash
git clone <repo-url> agentic-resume-builder
cd agentic-resume-builder
./install.sh
```

The script checks the repo layout, installs Docker Engine + Compose v2 if they
are missing (Debian/Ubuntu, from Docker's official apt repository, after
confirmation), builds the image, starts the container, and smoke-tests both the
viewer and the PDF export endpoint before printing the URLs.

Options: `--port 8080`, `--yes` (non-interactive), `--build-only`.

## What the image contains

| Layer                | Contents                                                                      |
| -------------------- | ----------------------------------------------------------------------------- |
| `base`               | `node:22-bookworm-slim`, pnpm 10.29.3 pinned                                  |
| `deps` / `prod-deps` | full and production-only `node_modules`, installed from the lockfile          |
| `builder`            | `.next` production build                                                      |
| `runner`             | Chromium + fonts, production deps, `.next`, `public/`, `content/`, `resumes/` |

Puppeteer never downloads its own Chromium (`PUPPETEER_SKIP_DOWNLOAD=true`).
The runtime uses Debian's `chromium` package via `PUPPETEER_EXECUTABLE_PATH`,
which keeps the image smaller and the shared libraries consistent with the
distro.

The container runs as the unprivileged `node` user under `dumb-init`, which
reaps the child processes Chromium leaves behind.

## Ports

The container always listens on **3000**. The PDF export route renders the
resume by calling itself at `http://localhost:$PORT`, so the listener and that
URL must agree — do not override `PORT` inside the container. Change the host
side only:

```bash
HOST_PORT=8080 docker compose up -d
```

## Content updates without a rebuild

Both `/` and `/render/[config]` are server-rendered on demand and read
`content/` and `resumes/` from disk per request. Compose mounts them read-only
from the checkout, so editing a resume config or a markdown file takes effect on
the next page load.

A rebuild is only needed after changes to `src/`, `public/`, or dependencies:

```bash
docker compose up -d --build
```

## Everyday commands

```bash
docker compose logs -f agentic-resume-builder   # follow logs
docker compose ps                       # health status
docker compose restart agentic-resume-builder   # restart
docker compose down                     # stop and remove
```

## Troubleshooting

**PDF export returns 500.** Check the logs for a Chromium launch failure. The
browser is launched with `--no-sandbox` (see `src/lib/pdf/browser-pool.ts`) —
see "Security posture" below for why.

**PDF export returns 504.** The render page did not load within 30s. Usually a
malformed resume config — open `/render/<config-name>` in a browser to see the
error the page reports.

**Fonts look wrong in the PDF.** The resume's IBM Plex faces are self-hosted
from `public/fonts` and are baked into the image; system fonts only provide
fallbacks. If `public/fonts` changed, rebuild.

**Port already in use.** `./install.sh --port 8080`, or set `HOST_PORT`.

## Security posture

Chromium runs with `--no-sandbox`. Re-enabling its sandbox was tested and
rejected — it needs all three of `chromium-sandbox` installed, the
`--no-sandbox` flags removed, **and** Docker's seccomp filter relaxed:

| Configuration                             | Result                                                     |
| ----------------------------------------- | ---------------------------------------------------------- |
| default seccomp, no sandbox package       | `No usable sandbox!`                                       |
| default seccomp + `chromium-sandbox`      | `Failed to move to new namespace: Operation not permitted` |
| `seccomp=unconfined` + `chromium-sandbox` | works                                                      |

Giving up Docker's syscall filter — which protects the host — to gain
Chromium's renderer sandbox is a bad trade here: the renderer sandbox exists to
contain hostile web content, and this app renders only local, trusted markdown
from a read-only mount.

The compensating controls in `docker-compose.yml` are stronger for this threat
model and cost nothing: all capabilities dropped, `no-new-privileges`, a
read-only root filesystem, and a `tmpfs` for the only path Puppeteer needs to
write. If you ever render untrusted input, revisit this and use Chromium's
curated `chrome.json` seccomp profile rather than `unconfined`.
