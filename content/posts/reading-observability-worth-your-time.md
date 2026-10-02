+++
title = "Reading: Observability, Worth Your Time"
date = 2026-01-15
weight = 355731
tags = ["observability", "reading", "grafana", "prometheus"]
[taxonomies]
tags = ["observability", "reading", "grafana", "prometheus"]
+++

A link roundup. One post per area, periodically, with a note on what each
source is and where it is coming from, because half the observability
blogosphere is vendors writing about their own products and it helps to know
which is which before you spend an hour on it.

**Start here, and it is not close.** Charity Majors,
[There Is Only One Key Difference Between Observability 1.0 and 2.0](https://www.honeycomb.io/blog/one-key-difference-observability1dot0-2dot0).
The argument that three separate datasources is an architectural choice with
a cost, not a neutral one, and that a single high-cardinality event stream
changes what you can debug. It is a vendor writing about a vendor's
preference, and the argument is still better than most of the alternatives.

**On cost, with real numbers.** The same author on
[the cost crisis in metrics tooling](https://www.honeycomb.io/blog/cost-crisis-metrics-tooling-excerpt),
which walks a single HTTP latency metric up to sixty-three million series at
moderate scale. This is the post that made the cardinality conversation
mainstream, and it is worth reading before you argue about it again.

**On the sampling decision.** Grafana Labs on
[tail sampling with Adaptive Traces](https://grafana.com/blog/capture-high-value-traces-without-managing-a-pipeline-tail-sampling-with-adaptive-traces/),
and Yuna Verheyden on
[volumetric sampling](https://grafana.com/blog/how-volumetric-sampling-makes-the-most-of-your-trace-budget-in-grafana-cloud/)
arguing that probabilistic sampling disproportionately discards
low-volume services, which is usually where the interesting bug is. Both are
Grafana marketing their own product. The underlying point about
low-volume services is correct and worth stealing regardless of where you run
your traces.

**On operating it at size.** [Scaling Alloy as a central telemetry
gateway](https://grafana.com/blog/how-to-scale-alloy-as-a-central-telemetry-gateway-capacity-planning-load-testing-and-production-lessons/)
has the most honest numbers I have seen published: seventeen million active
series, a terabyte a day each of logs and traces, and a load testing
methodology you could copy. Grafana Professional Services wrote it, which
usually means it came from a paid engagement, and the detail is worth more
than the neutrality.

**On instrumentation quality.** Grafana on
[measuring and improving instrumentation quality](https://grafana.com/blog/how-to-measure-and-improve-instrumentation-quality-for-better-full-stack-observability/),
which scores services on things like emitting logs and setting a valid
`service.name`. Unglamorous and correct. Most of your traces are bad because
the instrumentation is bad, and nothing tells you that until you measure it.

**The reference material.** [Alerting on SLOs](https://sre.google/workbook/alerting-on-slos/)
from the Google SRE Workbook. Multiwindow multi-burn-rate alerting with the
actual PromQL, including the low-traffic case that breaks the naive version.
Old, canonical, and still the thing most people should be reading before they
design an alerting scheme.

**Vendor take, flagged.** [Error budgets and burn rate](https://last9.io/blog/error-budget/)
from Last9. Competent and well-structured, with complete recording and
alerting rules you can copy, but it is a product company explaining a concept
the SRE book already covers. Read the book first.

## What I would actually read in this order

Charity Majors on observability 1.0 versus 2.0, the cost crisis post, then
the SRE Workbook chapter. Everything else is detail on top of an argument you
should already agree with by then.
