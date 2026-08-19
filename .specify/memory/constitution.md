<!--
  Sync Impact Report
  ==================
  Version change: 2.0.0 → 2.1.0
  Change type: MINOR — new principle added (X. Test-First Development)

  Amendment history:
    - 1.0.0 → 2.0.0 (2026-02-15): MAJOR — principles redefined from cross-domain input
    - 2.0.0 → 2.1.0 (2026-02-15): MINOR — added Principle X (Test-First Development)

  Added principles:
    - X. Test-First Development (NON-NEGOTIABLE) — user-requested TDD mandate

  Modified sections:
    - Development Workflow: code review checklist updated (9 → 10 items)
    - Governance: principle count updated (nine → ten)

  Templates requiring updates:
    - .specify/templates/plan-template.md — no changes needed (generic)
    - .specify/templates/spec-template.md — no changes needed (generic)
    - .specify/templates/tasks-template.md — no changes needed (generic)

  Follow-up TODOs:
    - All agents should re-read constitution on next invocation
    - Code review checklists in agent files should be verified against new principles
-->

# Digital Resume Constitution

## Core Principles

### I. Schema-Driven Type Safety

**Sources**: orchestrator (Type Safety First), resume-domain (Schema is Sole Source of Truth), backend-pdf-engineer (API Boundary Validation)

- All resume data structures MUST be defined as Zod schemas in `src/schemas/`.
  TypeScript types MUST be derived via `z.infer<>`. Hand-written interfaces,
  type aliases, or `type` declarations that duplicate or shadow schema shapes
  are prohibited.
- `strict: true` MUST be enabled in `tsconfig.json`. The `any` type is
  prohibited everywhere — no `any` casts, no `@ts-ignore`, no
  `@ts-expect-error` to suppress type errors. If a third-party library has
  poor types, a type declaration file MUST be created in `src/types/` rather
  than using `any`.
- Type assertions (`as`) MUST NOT be used unless the assertion is provably
  safe and accompanied by an inline comment explaining why. Prefer Zod
  `.parse()` or `.safeParse()` over type assertions at every boundary.
- Non-null assertions (`!`) MUST NOT be used. Use optional chaining (`?.`)
  and nullish coalescing (`??`) instead.
- Every function that accepts external input (API request bodies, URL
  parameters, JSON file loads, form submissions) MUST validate against the
  Zod schema using `.safeParse()` at the boundary. Internal functions that
  receive already-validated typed data MUST NOT re-validate.
- Validation errors at API boundaries MUST use `.safeParse()` +
  `.error.flatten().fieldErrors` to produce structured error responses.
  Validation errors shown to users (forms, editor) MUST be human-readable
  and actionable (e.g., "Start date must be before end date", not
  "Invalid input").
- All exported functions MUST have explicit return type annotations. Inferred
  return types are only acceptable on non-exported (module-private) functions.

**Rationale**: The schema is the contract between all agents. When types
diverge from schemas, data flows break silently. When `any` leaks in,
type safety becomes theater. When validation errors are cryptic, users
cannot self-correct. Every violation of this principle produces bugs that
are invisible until runtime.

---

### II. Component Purity

**Sources**: orchestrator (Component Purity), ui-ux-design (pure renderers), frontend-developer (render route isolation)

- Resume section components (`src/components/resume/*`) and template
  components (`src/components/templates/*`) MUST be pure renderers: they
  receive typed props and return JSX. They MUST NOT contain `useState`,
  `useEffect`, `useContext`, `useCallback`, `useMemo`, `useRef`,
  `useReducer`, `fetch`, `XMLHttpRequest`, event listeners that mutate
  external state, or any other side effects.
- Resume and template components MUST receive all data through props typed
  with schema-derived types from `@/types`. They MUST NOT access global
  state, context, or external data sources.
- Each resume section component (Header, Experience, Education, Skills,
  Projects, Certifications) MUST be independently usable across all
  templates. A section component MUST NOT assume which template is
  rendering it.
- The `/render/[template]` route MUST render ONLY the resume template
  component. It MUST NOT include navigation, editor chrome, UI shell,
  toolbars, buttons, or any interactive elements. This route is the
  Puppeteer PDF capture target; any UI chrome will appear in the PDF.
- Editor components (`src/components/editor/*`) are explicitly excluded
  from this purity rule — they are stateful by design and use hooks,
  effects, and form handling.

**Rationale**: Pure components are predictable, testable, and render
identically in the browser preview and in Puppeteer's headless Chrome.
When a resume component has side effects, the PDF output diverges from
the screen preview, creating "works on screen, broken in PDF" bugs that
are extremely difficult to diagnose. The render route must be pristine
because Puppeteer captures everything visible.

---

### III. Print-PDF Fidelity

**Sources**: orchestrator (Print-First Design), ui-ux-design (A4 accuracy, page breaks, self-hosted fonts), backend-pdf-engineer (font loading, PDF config, printBackground)

- Every template MUST render its root container at exactly A4 dimensions:
  210mm wide by 297mm tall. This dimension MUST be enforced in CSS, not
  approximated.
- Print CSS MUST apply `break-inside: avoid` (via the `avoid-break` utility
  class) on every section-level block element. Sections MUST NOT be split
  across page boundaries.
- All styling MUST use Tailwind utility classes. Print-specific behavior
  MUST use the `print:` variant prefix. Screen-only elements MUST use the
  `no-print` class to hide in print output.
- Fonts MUST be self-hosted as `.woff2` files in `/public/fonts/` with
  `@font-face` declarations. External font CDN links (Google Fonts, Adobe
  Fonts, Typekit, etc.) are prohibited in all resume and template
  components. A sensible fallback font stack MUST be declared in every
  `@font-face` and CSS variable definition.
- Puppeteer MUST always wait for `document.fonts.ready` before capturing
  the PDF. A font-loading timeout of 5 seconds MUST be enforced — if fonts
  fail to load, the system MUST log a warning but proceed with fallback
  fonts rather than failing the request.
- Puppeteer PDF configuration MUST always use these settings:
  - `format: 'A4'`
  - `printBackground: true` (without this, colored backgrounds vanish)
  - `margin: { top: '0', right: '0', bottom: '0', left: '0' }` (margins
    are CSS-controlled)
  - `preferCSSPageSize: true` (for accurate A4 rendering)
- Puppeteer MUST use `waitUntil: 'networkidle0'` when navigating to the
  render page.
- Print color adjustment MUST be applied where background colors are used:
  `-webkit-print-color-adjust: exact; print-color-adjust: exact`.

**Rationale**: The PDF is the primary deliverable of this application. A4
dimensional accuracy, font consistency, and correct print styling are the
difference between a professional resume and a broken document. CDN fonts
fail in headless environments. Missing `printBackground` silently strips
all colored sections. Incorrect margins double-apply (CSS + Puppeteer),
producing misaligned output. Every setting in this principle was learned
from a real PDF rendering failure.

---

### IV. Template Independence

**Sources**: ui-ux-design (template isolation), orchestrator (self-contained templates)

- Each template (modern, classic, minimal) MUST be fully self-contained in
  its own directory under `src/components/templates/`. Template A MUST NOT
  import from Template B's directory. Templates MAY import shared section
  components from `src/components/resume/`.
- Adding a new template MUST NOT require modifying any existing template.
  The only changes required are: (1) create the template directory and
  component, (2) add the template ID to `templateIdSchema` in
  `src/schemas/resume.schema.ts`, (3) register it in the template selector.
- Templates MUST accept props typed as `TemplateProps` from `@/types` and
  MUST NOT impose additional required props beyond what the schema defines.
- Theme customization MUST be implemented via CSS custom properties
  (`--resume-color-primary`, `--resume-color-secondary`, etc.) that are
  switchable per template. Templates MUST NOT hardcode color values — they
  MUST reference CSS variables so themes can be swapped without code changes.

**Rationale**: Template independence is the foundation of extensibility.
When templates share internal code, changing one breaks another. When
adding a template requires touching existing templates, the change surface
grows linearly with template count. CSS variable theming ensures visual
consistency is configurable without code duplication.

---

### V. Accessibility by Default

**Sources**: frontend-developer (keyboard accessibility, ARIA, semantic HTML, form labels)

- All resume components MUST use semantic HTML elements: `<section>`,
  `<header>`, `<article>`, `<h2>`, `<h3>`, `<ul>`, `<address>`, `<main>`,
  `<nav>` where structurally appropriate.
- Heading hierarchy MUST be correct and sequential (no skipping from `h2`
  to `h4`). Each template MUST start with exactly one `h1` (the resume
  holder's name).
- All interactive elements in the editor MUST be keyboard accessible.
  Buttons, links, and form controls MUST be focusable and operable via
  keyboard alone.
- All form inputs MUST have associated `<label>` elements (visible or
  `sr-only`). Inputs MUST NOT rely solely on placeholder text for
  identification.
- Where visual context is lost for screen readers, `aria-label` or
  `aria-labelledby` MUST be provided.
- Color MUST NOT be the sole means of conveying information. All color
  usage MUST maintain WCAG 2.1 AA contrast ratios (4.5:1 for normal text,
  3:1 for large text).

**Rationale**: Resumes are legal documents used in employment processes
that may be subject to accessibility regulations. The editor must be
usable by people with disabilities. Semantic HTML also improves SEO for
the render route and provides better structure for Puppeteer's rendering
engine. Broken heading hierarchy confuses screen readers and makes the
resume unparseable by assistive technology.

---

### VI. Single State Source

**Sources**: frontend-developer (useResume as sole state), resume-domain (useResume hook, data integrity)

- All resume data state in the application MUST flow through the
  `useResume` hook (`src/hooks/useResume.ts`). No component MUST create
  parallel state for resume data using `useState`, `useReducer`, or
  external state management libraries.
- The data pipeline MUST follow this sequence and no other: JSON data file
  (or user input) -> Zod validation -> typed state (via `useResume`) ->
  typed props -> template render.
- The `useResume` hook MUST provide explicit loading, error, and success
  states. Consumers MUST handle all three states — no component may assume
  the data is available without checking the loading state.
- Resume data modifications MUST go through `useResume`'s update functions,
  which MUST validate changes against the schema before applying them.
  Direct state mutations are prohibited.
- Adding a new resume section MUST require exactly three changes: (1) schema
  update in `src/schemas/resume.schema.ts`, (2) section component in
  `src/components/resume/`, (3) template integration in each template that
  displays it.

**Rationale**: Multiple sources of truth for the same data produce
synchronization bugs — the preview shows stale data, the editor shows
different data than the PDF, exported PDFs contain data the user thought
they deleted. A single state source with validated updates eliminates
entire categories of bugs. The three-change rule ensures schema additions
are mechanical, not architectural.

---

### VII. Resource Safety

**Sources**: backend-pdf-engineer (browser pooling, timeout, crash recovery, page lifecycle)

- Puppeteer browser instances MUST be managed via a singleton pool pattern.
  Launching a new browser per request is prohibited in all environments.
  In development, the browser instance MUST be stored on `globalThis` to
  survive hot-reload.
- Every Puppeteer page MUST be closed in a `finally` block after PDF
  generation, regardless of success or failure. Unclosed pages leak memory
  and eventually crash the server.
- A render timeout of 30 seconds MUST be enforced on every PDF generation
  request. If the page does not load within 30 seconds, the system MUST
  return HTTP 504 with a structured error response and close the page.
- The browser pool MUST handle disconnection gracefully — if the browser
  process crashes, the next `getBrowser()` call MUST detect the
  disconnection and launch a new instance rather than returning a dead
  reference.
- API responses for PDF generation MUST include proper headers:
  `Content-Type: application/pdf` and
  `Content-Disposition: attachment; filename="{name}.pdf"`.
- Backend code (`src/app/api/*`, `src/lib/pdf/*`) MUST NOT import React
  components. The backend communicates with the render layer exclusively
  via URLs.
- Stack traces MUST NOT be exposed in production API error responses. Full
  errors MUST be logged server-side.

**Rationale**: Puppeteer is a resource-intensive headless browser. Without
pooling, each PDF request launches ~100MB of Chromium. Without page
cleanup, memory leaks crash the server within hours under load. Without
timeouts, a single broken template hangs the server indefinitely. Without
crash recovery, one browser segfault takes down all subsequent requests.
Every rule here prevents a production incident.

---

### VIII. Centralized Data Formatting

**Sources**: resume-domain (pure formatting functions, centralized utilities), ui-ux-design (no inline date formatting)

- All data formatting logic (dates, durations, text truncation, markdown
  parsing) MUST live in dedicated utility files under `src/lib/formatting/`.
  Resume components and templates MUST NOT contain inline formatting logic.
- Date formatting MUST use `formatDateRange()` from
  `src/lib/formatting/dates.ts`. Duration calculation MUST use
  `calculateDuration()` from the same file. Components MUST NOT implement
  their own date formatting.
- Formatting functions MUST be pure: input in, output out, no side effects,
  no mutations. They MUST handle edge cases gracefully — empty strings,
  `null` dates (representing "Present"), undefined optional fields, and
  malformed input.
- Resume variant functions (trimming, tailoring) MUST preserve data
  integrity. They MUST remove content, never corrupt or alter existing
  content. Variant generation MUST operate on validated schema types,
  never raw JSON.
- All formatting functions MUST have explicit return types and JSDoc
  comments explaining purpose, parameters, and return values.

**Rationale**: When formatting logic is scattered across components,
inconsistencies emerge: one template shows "Jan 2020 - Present" while
another shows "2020-01 - current". Centralized formatting functions are
tested once and produce consistent output everywhere. Pure functions are
trivially testable and produce no surprises.

---

### IX. Simplicity

**Sources**: orchestrator (Simplicity, YAGNI)

- Dependencies MUST be justified. No library MUST be added for a task
  achievable with fewer than 30 lines of project code.
- Start with the minimum viable implementation. Features not currently
  needed (YAGNI) MUST NOT be built speculatively.
- Abstractions MUST NOT be introduced until a pattern repeats at least
  twice. Three similar lines of code are preferred over a premature helper
  function.
- Conditional class composition MUST use `clsx` + `tailwind-merge` (via a
  `cn()` helper). String concatenation or template literals for building
  class strings are prohibited.

**Rationale**: Premature abstraction is the root of accidental complexity.
Every unnecessary dependency is a future security vulnerability and
maintenance burden. Every speculative feature is code that must be tested,
maintained, and understood by every agent — without delivering value.

---

### X. Test-First Development (NON-NEGOTIABLE)

**Sources**: user requirement (TDD mandate)

- Every new feature, component, utility, or bug fix MUST begin with a
  failing test. The development sequence is strictly:
  1. **Write the test** that describes the expected behavior.
  2. **Run the test and confirm it fails** (Red). If the test passes
     before implementation, the test is either wrong or the feature
     already exists — investigate before proceeding.
  3. **Write the minimum code** to make the test pass (Green).
  4. **Refactor** the implementation while keeping all tests passing.
- Tests MUST be committed before or alongside the implementation code,
  never after. A PR that contains implementation without corresponding
  tests MUST be rejected.
- Test files MUST be co-located or follow the project test directory
  convention (`tests/unit/`, `tests/integration/`, `tests/e2e/`).
  Each test file MUST mirror the source file it covers.
- Tests MUST assert behavior from the consumer's perspective, not
  implementation details. Test what a function returns or what a
  component renders, not how it does it internally.
- When fixing a bug, the first action MUST be writing a test that
  reproduces the bug (the test MUST fail). Only after the reproduction
  test fails is the fix implemented.
- Skipped tests (`it.skip`, `test.skip`, `xit`) are prohibited in
  merged code. A skipped test is a broken contract. If a test cannot
  pass, it MUST be fixed or removed with a justification comment in
  the PR.
- Test coverage MUST NOT decrease on any PR. New code MUST have test
  coverage for all public interfaces and critical paths.

**Rationale**: Test-first development catches design flaws before code
is written. A test that passes before implementation proves the test
is testing nothing. Writing tests after implementation creates
confirmation bias — the test is shaped to match the code rather than
the requirement. The Red-Green-Refactor cycle ensures every line of
production code exists because a test demanded it, eliminating dead
code and untested paths. Bug fix tests prevent regressions permanently.

---

## Technology Stack

- **Framework**: Next.js 14+ (App Router) with React
- **Language**: TypeScript 5+ (strict mode, `noUncheckedIndexedAccess`,
  `noUnusedLocals`, `noUnusedParameters`)
- **Styling**: Tailwind CSS 3.4+ with CSS custom properties for theming
- **Validation**: Zod 3+ for schema definition and runtime validation
- **PDF Export**: Puppeteer (server-side, headless Chromium, singleton pool)
- **Testing**: Vitest + React Testing Library (unit/integration),
  Playwright (E2E/visual)
- **Code Quality**: ESLint (strict-type-checked), Prettier
  (prettier-plugin-tailwindcss)
- **Fonts**: Self-hosted `.woff2` via `@font-face` declarations
- **Package Manager**: pnpm
- **Class Composition**: `clsx` + `tailwind-merge`

Stack changes require a constitution amendment (MAJOR version bump).

## Development Workflow

- All code MUST pass ESLint and Prettier checks before merge. The `pnpm
  validate` script (lint + format:check + test + build) MUST pass.
- Every new resume section component MUST include at least one unit test
  verifying it renders without errors given valid props from shared
  fixtures.
- PDF export pipeline changes MUST be validated by generating a test PDF
  and confirming visual correctness against the screen preview.
- Tests MUST use shared fixtures from `tests/fixtures/` — inline test data
  objects that duplicate the schema shape are prohibited.
- Tests MUST test behavior, not implementation details. One assertion
  concept per test. Describe blocks organized by feature, not by file.
- Commits MUST be atomic: one logical change per commit, with a descriptive
  message following conventional commit format.
- Every agent MUST respect file ownership boundaries. Writing to files
  outside an agent's declared scope is prohibited.
- Code reviews MUST verify compliance with all ten core principles using
  the following checklist:
  ```
  [ ] I.    No any, no @ts-ignore, no unsafe assertions — types from schema
  [ ] II.   Resume/template components are pure — no hooks, effects, or state
  [ ] III.  A4 dimensions, self-hosted fonts, avoid-break on sections
  [ ] IV.   Templates are self-contained — no cross-template imports
  [ ] V.    Semantic HTML, correct heading hierarchy, keyboard accessible
  [ ] VI.   Resume state flows through useResume — no parallel state
  [ ] VII.  Pages closed in finally blocks, timeouts enforced, no stack traces
  [ ] VIII. Formatting uses centralized utilities — no inline date/text logic
  [ ] IX.   No unjustified dependencies, no speculative features
  [ ] X.    Tests written first, confirmed failing, then implementation passes them
  ```

## Governance

- This constitution supersedes ad-hoc decisions. When a principle conflicts
  with a proposed change, the principle wins unless the constitution is
  amended first.
- Amendments require: (1) a written rationale explaining why the change is
  necessary, (2) consultation with the affected agent domain(s), (3)
  updated version number per the semver rules below, and (4) propagation
  of changes to dependent templates, agent files, and documentation.
- Version policy:
  - MAJOR: Principle removal, redefinition, or stack replacement.
  - MINOR: New principle, new section, or materially expanded guidance.
  - PATCH: Clarifications, typo fixes, non-semantic rewording.
- Compliance review: every PR MUST be checked against all ten active
  principles before merge. The code review checklist in the Development
  Workflow section is the authoritative verification tool.
- Agent scope violations (writing to files outside declared ownership) are
  treated as principle violations and MUST be corrected before merge.

**Version**: 2.1.0 | **Ratified**: 2026-02-15 | **Last Amended**: 2026-02-15
