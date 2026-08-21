---
id: meridian-principal-engineer
company: Meridian Drift Cooperative
title: Principal Data Engineer
location: Lower Puddlemere, Improbability Shire
start: 2024-06
draft: false
technologies:
  - Python
  - dbt
  - Snowflake
  - Terraform
  - Kubernetes
  - AWS
  - Azure
  - Google Cloud
---

Brought in to make a tidal-freight cooperative's data trustworthy enough to bet contracts on. Forty-odd member vessels each reported in their own dialect, and the shared warehouse averaged **three contract-breaking schema changes a month**, every one of them found by a member noticing their invoices had gone strange. Replaced the convention with an enforced contract, then gave the members the tooling to check themselves before shipping.

Sets platform direction across three clouds, coaches the six engineers who maintain it, and released the contract checker as an open source package now used well outside the cooperative.

## Achievements

- **Contract breaks fell from ~3 a month to zero in 11 months** — schema changes are now rejected at pull request time rather than discovered in an invoice
- **Member onboarding cut from 6 weeks to 4 days** — a new vessel publishes against a declared contract instead of negotiating a bespoke integration
- **Warehouse spend flat across a 4x data increase** — growth stopped being a budget conversation

## Architecture

- **Contracts as the interface, not the documentation** — every producer declares a versioned schema; the platform refuses anything that does not match, so no downstream job has to defend itself
- **One pipeline definition, three clouds** — members run on whichever cloud they already had; the pipeline is declared once and compiled per target rather than forked

## Data Quality

- **Breaking changes caught before merge** — the contract checker runs in each member's CI, so the failure lands on the person who caused it while they still remember why
- **Freshness as a published promise** — every dataset carries a stated arrival window and reports against it, replacing a support channel where members asked whether numbers were current

## Cost & Efficiency

- **Warehouse cost per record down 71%** — incremental models and clustering on the columns actually queried, rather than the columns someone assumed
- **On-call load down to roughly one page a month** — most of what used to page a human is now a rejected pull request

## Leadership & Mentoring

- **Coached six engineers through the contract model** — pairing and design review until they were rejecting my proposals on the merits, which was the point
- **Two members grew their own data teams** — ran the internal workshops that let them stop depending on the cooperative for changes

## Community

- **Released ledgerlint as open source** — the contract checker, extracted and generalised; adopted by three freight cooperatives with no connection to Meridian
- **Talk at the Improbability Data Forum** — on why data contracts fail socially before they fail technically, and what to do about it
