## Digital Resume Builder

id: digital-resume
repo: https://github.com/quantum-narwhal-labs/digital-resume
technologies: TypeScript, Next.js, Tailwind CSS, Puppeteer
related_experience: hyperion-tech-lead

Markdown-driven resume builder with a content vault, YAML config lenses, and Puppeteer PDF export.

### Highlights

- Content-first — career data grows in markdown; resumes are views over it
- Audience targeting — YAML configs select and arrange content per audience
- Print fidelity — A4 PDF export with self-hosted fonts and precise layout

## Chronosort

id: chronosort
repo: https://github.com/quantum-narwhal-labs/chronosort
technologies: Python, BigQuery, Dataflow
related_experience: bureau-temporal-gcp

Batch scheduler that orders jobs by when their data will exist rather than when it was requested.

### Highlights

- Retro-causal backfills — resolves dependencies for data that has not landed yet
- Idempotent by construction — every run is safe to repeat, in any order
- Ships with a dry-run planner that explains its ordering in plain English

## Krakenctl

id: krakenctl
repo: https://github.com/quantum-narwhal-labs/krakenctl
technologies: Python, AWS, Terraform
related_experience: kraken-senior-data-engineer

Command-line control plane for Redshift and Glue estates, with cost guardrails built in.

### Highlights

- One command to promote a pipeline from staging to production
- Refuses any plan whose projected monthly spend exceeds its declared budget
- Config-driven — adding a new pipeline is a YAML entry, not a code change
