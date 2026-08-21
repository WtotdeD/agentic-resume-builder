# Security policy

## Reporting a vulnerability

**Use GitHub's private reporting: [open a draft advisory](https://github.com/WtotdeD/agentic-resume-builder/security/advisories/new).**
It is enabled on this repository. Please do not open a public issue for a
vulnerability — an issue is visible to everyone the moment you file it.

Expect an acknowledgement within a week. This is a small project maintained in
spare time, so treat that as a realistic estimate rather than a guarantee, and
feel free to nudge the advisory thread if it goes quiet.

## Supported versions

There are no releases. The supported version is whatever is on `main`, and fixes
land there.

## What is worth reporting

This is a self-hosted tool that renders local files. It has no accounts, no
sessions, no database, and stores nothing about you. That rules out most of the
usual categories, but there is a real attack surface:

- **The PDF export route** (`/api/export-pdf`) drives headless Chromium against a
  page this app renders. Anything that gets a payload from `content/` or
  `resumes/` into that browser in a way that escapes the page — SSRF against the
  host, local file reads, code execution — is in scope.
- **Path handling in the content and config loaders.** These read from disk by
  name. A traversal that reaches a file outside `content/` or `resumes/` is in
  scope.
- **The container's hardening.** `docker-compose.yml` drops all capabilities,
  runs a read-only rootfs and sets `no-new-privileges`, while Chromium runs with
  `--no-sandbox` because it cannot use its own sandbox without loosening Docker's
  seccomp filter. A way to escape the container, or to make those controls
  ineffective, is in scope.
- **Dependency vulnerabilities** that are actually reachable from this code. A
  CVE in a transitive package that no code path touches is worth mentioning but is
  not urgent.

## What is not a vulnerability

- **Exposing the app to the internet.** It is built to run on localhost or a
  trusted network. There is no authentication and none is planned; anyone who can
  reach it can read the resume and generate PDFs. That is the design.
- **Content in `content/` doing something odd.** Your vault is trusted input — you
  wrote it. Breaking your own render with your own markdown is a bug, not a
  vulnerability.
- **The fictional demo data.** Dr. Ignatius Featherstone-Bloom is not a real person
  and his details are not a leak.

## Handling

Confirmed issues are fixed on `main` and disclosed through a GitHub Security
Advisory once a fix exists. You will be credited unless you would rather not be.
