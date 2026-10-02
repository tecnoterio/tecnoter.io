+++
title = "Seven Years of Notes From One Node"
date = 2026-01-06
weight = 355740
tags = ["system", "hardware", "practice"]
[taxonomies]
tags = ["system", "hardware", "practice"]
+++

An index, since the archive has grown past the point where anyone remembers
what they wrote. Grouped by what they turned out to be about, which is not
always what they claimed to be about at the time.

**On Unix and Linux, the foundation.** The systemd unit that deadlocked
itself, and why the fix was to remove an ordering dependency rather than add
one. The DNS lookup that took eleven seconds, and why every dashboard was
green while it happened. [The OOM killer chose
wrong](posts/the-oom-killer-chose-wrong.md), and why cgroups are the answer
rather than a tunable. The text editor on the server, which is a rule about
when automation is premature rather than a claim about editors.

**On making systems reproducible.** Drift as a symptom of bad tooling rather
than bad discipline. Idempotence as a constraint you design under. Terraform
state as the part of the story that lies. Rendering configuration as a build
artefact, so the review is of the output and not the intent.

**On delivery.** The pipeline nobody skips, and the observation that a
process people work around is a performance. A Dockerfile as a
reproducibility problem rather than a packaging problem. [The build was green
and the pipeline was
lying](posts/the-build-was-green-and-the-pipeline-was-lying.md), which is the
`pull_request_target` and cache poisoning story. Signing what you build, and
the year of SBOMs nobody read before it became a gate.

**On observing systems.** A bill that grew four hundred percent from one
label. Cardinality as a cross product, not a column. [We ran out of connection
pool](posts/we-ran-out-of-connection-pool-not-database.md), not database.
[We deleted a dashboard and incident time went
down](posts/we-deleted-a-dashboard-and-incident-time-went-down.md). Sampling
as the real design decision in tracing, and the one slow request whose missing
three seconds were a pool. Logs as a cost model, split by value rather than
thinned by retention.

**On event-driven systems.** The outbox, and why the obvious fix couples
everything. Exactly-once, and what the guarantee does not cover. [Backpressure
is where good queues go to
die](posts/backpressure-is-where-good-queues-go-to-die.md), and why retries
are not it. Capacity planning from data you already have, and the alert on
the forecast being worth more than the forecast.

**On the work itself.** Thirty years, and mostly what survived: knowing what
to be suspicious of. A model reading our failed pipelines for three months,
and the task it turned out to be good at being summarising rather than
diagnosing.

**On the machine.** Node 1, seven years on, with the observation that the
interesting property of a well-built machine is how little of it anybody
thinks about.

**On small machines.** [Sixty-four kilobytes](posts/sixty-four-kilobytes-and-every-abstraction-that-hid-it.md),
and every abstraction that hid it. [Recreating
hardware](posts/recreating-hardware-and-the-word-everyone-gets-wrong.md), and
the word everyone gets wrong. [Preemptive multitasking in 64
kilobytes](posts/preemptive-multitasking-in-64-kilobytes.md).

**Reading lists.** Periodically, one post per area, with a note on where each
source comes from: [five things worth
reading](posts/reading-five-things-worth-reading.md) is the current short
list, with the longer roundups behind it on
[observability](posts/reading-observability-worth-your-time.md),
[supply chain](posts/reading-supply-chain-after-the-attacks.md),
[event-driven](posts/reading-event-driven-at-scale.md), and
[Kubernetes](posts/reading-kubernetes-and-gitops.md).
