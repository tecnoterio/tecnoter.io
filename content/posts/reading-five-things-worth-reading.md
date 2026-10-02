+++
title = "Reading: Five Things Worth Reading"
date = 2026-01-29
weight = 355717
tags = ["reading", "observability", "supply-chain", "event-driven"]
[taxonomies]
tags = ["reading", "observability", "supply-chain", "event-driven"]
+++

Short list, updated occasionally. Vendor posts are marked, because most of
the writing in these areas comes from companies selling something.

**Observability 1.0 versus 2.0** — Charity Majors on why three separate
datasources is an architectural choice with a cost.
[Read it](https://www.honeycomb.io/blog/one-key-difference-observability1dot0-2dot0)
(vendor). Follow with
[the cost crisis in metrics tooling](https://www.honeycomb.io/blog/cost-crisis-metrics-tooling-excerpt),
which puts real numbers on cardinality.

**Alerting on SLOs** — the Google SRE Workbook chapter, with the actual
PromQL for multiwindow burn-rate alerting and the low-traffic case that breaks
the naive version. [Read it](https://sre.google/workbook/alerting-on-slos/).
Old, canonical, free.

**The TanStack postmortem** — a supply chain compromise, written by the person
whose packages it was. The kill chain is the point:
`pull_request_target`, then cache poisoning, then OIDC token theft.
[Read it](https://tanstack.com/blog/npm-supply-chain-compromise-postmortem).
Then SLSA's own analysis of
[where its guarantees stop](https://slsa.dev/blog/2026/05/mini-shai-hulud-what-slsa-can-and-cannot-do).

**The transactional outbox** — the pattern, framed as a compromise between two
other designs rather than as the right answer. [Read
it](https://microservices.io/patterns/data/transactional-outbox.html).

**New 8-bit hardware** — for the constraint exercise. MEGA65 is a real
computer built as a realisation of the Commodore C65 that never shipped.
[Read it](https://mega65.org). MiSTer is the open-source FPGA answer.
[Read it](https://github.com/MiSTer-devel/Main_MiSTer). The best technical
writing around it is [Leaded Solder](https://www.leadedsolder.com/) and
[Pagetable](https://www.pagetable.com/).

## If you only read one

The SRE Workbook chapter. It is free, it is short, and it is correct.
