---
id: fjord-azure-engineer
company: Fjord & Sons Artisanal Compute
title: Data Engineer
location: Nordvik, Improbability Shire
start: 2017-10
end: 2019-07
draft: false
technologies:
  - Azure
  - Azure Data Factory
  - Synapse Analytics
  - Azure Databricks
  - ADLS Gen2
  - Delta Lake
  - Unity Catalog
  - PySpark
---

A family firm that hand-finished compute clusters and ran its reporting on a spreadsheet nobody was allowed to close. Migrated the whole operation onto Azure and delivered the first numbers the family had ever agreed on, having reconciled four decades of records that disagreed with each other.

Built the platform solo for the first year, then as one of three, and wrote the documentation that let a non-technical operations team run their own reports.

## Achievements

- **Four decades of ledgers reconciled** — four incompatible record systems merged into one model with full lineage back to source
- **Month-end close from 9 days to 4 hours** — automated a reporting process that had been manual since 1978
- **First self-service reporting** — operations built their own reports without engineering involvement

## Architecture

- **Medallion layering on Delta Lake** — bronze landing, silver conformed, gold published, with schema enforcement at every boundary
- **Metadata-driven ingestion** — one parameterised Data Factory pipeline serving all sources instead of a pipeline per table

## Data Quality

- **Reconciliation harness** — every load compared against source control totals, with mismatches quarantined rather than published
- **Historical corrections without rewrites** — Delta time travel let the team correct the past while preserving what was previously reported
