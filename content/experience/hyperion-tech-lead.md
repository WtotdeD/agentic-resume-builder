---
id: hyperion-tech-lead
company: Hyperion Orbital Logistics
title: Tech Lead — Data Platform
location: Lower Puddlemere, Improbability Shire
start: 2023-03
end: 2024-05
draft: false
technologies:
  - Databricks
  - Delta Lake
  - Terraform
  - Kubernetes
  - Python
  - AWS
  - Azure
  - Google Cloud
---

Joined as the first internal tech lead for a platform that tracked cargo across three planets and could not reliably say how much of it existed. Went back to first principles and rebuilt around one idea: the manifest data drives everything, and anything the manifest cannot explain does not ship. The platform became the **single source of truth for every Hyperion payload**, at **41% of its former running cost**, and has not lost a crate since.

Owned the architecture across all three clouds, still wrote production code, and grew the team from two contractors to six permanent engineers.

## Achievements

- **Single source of truth for 2.3M payloads** — every downstream manifest, customs filing and insurance report reads from one platform
- **59% cost reduction** — redesigned with cost as a first-class design constraint; operational effort fell from 2 FTE to a few hours a week
- **Zero lost cargo in 18 months** — down from an average of 40 crates per quarter written off as "probably on Mars"

## Architecture

- **Manifest-driven by design** — new routes, depots and vehicle types flow into the model automatically when source data changes; no manual reconfiguration
- **Tri-cloud ingestion layer** — one declarative interface over AWS, Azure and GCP sources; adding an integration is a config entry and a schema file, nothing else

## Data Quality

- **Expectation grid (time × depot)** — knows which depots should report on which days and updates itself when routes change; missing data raises before anything is loaded
- **Two-layer validation** — structural checks run before ingest and halt the pipeline on critical failure; semantic checks run during transformation and surface warnings in a control grid

## Cost & Efficiency

- **Egress cut by a factor of 20** — moved computation to where the data already lived instead of hauling raw telemetry between clouds
- **Spot-first compute policy** — batch workloads bid for interruptible capacity with automatic fallback, absorbing a 3x volume increase at flat cost

## Leadership & Mentoring

- **Team built from scratch** — went from two contractors to six permanent engineers through pairing, structured onboarding and design review
- **Founded two engineering communities** — a platform guild and a data-quality forum, both now running without me
