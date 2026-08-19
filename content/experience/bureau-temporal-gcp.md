---
id: bureau-temporal-gcp
company: Bureau of Temporal Statistics
title: Staff Data Engineer
location: Greenwich Annexe, Improbability Shire
start: 2021-07
end: 2023-02
draft: false
technologies:
  - Google Cloud
  - BigQuery
  - Dataflow
  - Pub/Sub
  - Dataproc
  - Cloud Composer
  - Looker
  - Python
---

The Bureau publishes statistics about events that have not happened yet, which makes late-arriving data less a nuisance than a founding principle. Inherited a warehouse where every backfill corrupted the quarter it was meant to repair. Rebuilt ingestion around event time rather than arrival time, so a record landing three years late updates its own period and nothing else.

Ran the GCP estate end to end: **380 TB in BigQuery**, 140 Dataflow pipelines, and a publication deadline every Thursday at 09:00 that was never missed after the rebuild.

## Achievements

- **Restatements dropped from 22 per quarter to zero** — event-time partitioning made backfills idempotent by construction
- **Query costs cut 64%** — clustering and partition pruning on the ten tables responsible for most of the spend
- **Thursday publication never missed in 19 months** — previously late roughly one week in five

## Architecture

- **Event-time everything** — every table partitioned by when the event occurred, never when the row arrived; late data updates one partition and leaves history intact
- **Streaming and batch on one path** — Pub/Sub into Dataflow with the same transformation code for both modes, removing a duplicate batch codebase

## Data Quality

- **Publication gate** — a release runs only if completeness, continuity and revision-size checks pass; a failed gate blocks publication and pages the on-call statistician
- **Revision ledger** — every restatement recorded with its cause, giving analysts a queryable history of what changed and why
