---
id: kraken-senior-data-engineer
company: Kraken Freight Collective
title: Senior Data Engineer
location: Port Grimsby, Improbability Shire
start: 2019-08
end: 2021-05
draft: false
technologies:
  - AWS
  - Redshift
  - Glue
  - EMR
  - Kinesis
  - S3
  - Athena
  - Step Functions
  - Terraform
---

A deep-sea freight cooperative whose AWS bill had grown faster than its revenue for six straight quarters, with nobody able to say which pipeline was responsible. Built cost attribution down to the individual job, then spent a year making the expensive things cheap: **monthly spend fell 47%** while ingest volume roughly doubled.

Owned the Redshift and Glue estate, and wrote the control-plane tool the team still uses to promote pipelines.

## Achievements

- **47% lower AWS spend on 2x volume** — attribution first, optimisation second; no workload was cut to get there
- **Ingest latency 6 hours to 9 minutes** — replaced nightly batch dumps with Kinesis streams into a staging layer
- **Pipeline promotion in one command** — previously a 30-step runbook that only two people could execute correctly

## Architecture

- **Staging-to-final pattern** — every load writes to a staging table and swaps atomically, so a failed run never leaves a partial table readable
- **Config-driven pipelines** — a new source is a YAML entry and a schema definition; the framework handles orchestration, retries and lineage

## Cost & Efficiency

- **Per-job cost attribution** — tagged every workload so spend could be traced to a pipeline, a team and a customer
- **Automatic table lifecycle** — cold partitions age out of Redshift to S3 and stay queryable through Athena, cutting warehouse storage by two thirds
