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

## Ledgerlint

id: ledgerlint
repo: https://github.com/quantum-narwhal-labs/ledgerlint
technologies: Python, dbt, GitHub Actions
related_experience: meridian-principal-engineer

Data contract checker that fails a pull request when a schema change would break a downstream consumer, rather than letting the consumer find out in production.

### Highlights

- Shift left — the break surfaces in the CI of whoever caused it, while they still remember why
- Producer-owned — contracts live beside the code that emits the data, not in a separate registry nobody updates
- Boring by design — no runtime agent, no service to operate; it is a check that exits non-zero
