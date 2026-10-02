+++
title = "Sampling Is the Whole Design Decision in Tracing"
date = 2023-06-27
weight = 356664
tags = ["observability", "tempo", "tracing", "opentelemetry"]
[taxonomies]
tags = ["observability", "tempo", "tracing", "opentelemetry"]
+++

Every distributed tracing setup I have worked on has the same architecture
diagram, and in a good number of them the diagram is roughly accurate and
the tracing is still useless. The variable is almost never the collector or
the storage. It is the sampling decision, made once, early, by someone who
had not yet had a bad afternoon with a production system.

Head sampling, where the decision is made at the start of a trace, is cheap
and simple and it has a failure mode that only shows up when you need it. If
you sample at one percent and the interesting traces are the slow, rare
errors, you will have thrown away ninety-nine percent of them. You will have
kept a beautiful, complete, uniformly sampled picture of the requests that
were already fine.

The alternative is tail sampling, where the collector holds traces in memory
and decides at the end. Now you can keep every error, every trace above some
latency, and a low-rate sample of everything else. The trade is memory and
complexity: the collector is now stateful, you have to size it for the
in-flight volume, and a collector restart loses whatever it was holding.

For a system at meaningful volume I now think of it as a hard requirement
rather than a refinement. Errors are rare by definition. If you sample before
you know the outcome, you are sampling away the only thing you kept the
tracing for.

Three things that caught me out.

Sampling has to be consistent across the trace. If the probability is decided
per-span you get fragments, and a fragmented trace is worse than no trace
because it looks like evidence.

The sampling configuration is a cost decision and should be reviewed like
one. "One percent of requests" means something very different before and
after traffic tripled.

And a sampling rate that nobody has revisited is a rate chosen by somebody who
has since left. Put it in the same place as your retention policy, and check
it when the bill moves.

## References

- [Tail sampling with the Grafana Collector](https://grafana.com/docs/tempo/latest/set-up-for-tracing/instrument-send/set-up-collector/tail-sampling/) — the pipeline, the decision periods, and the memory trade.
- [OpenTelemetry: sampling](https://opentelemetry.io/docs/concepts/sampling/) — head versus tail, and the SDK-level configuration that decides it.
- [CNCF: OpenTelemetry](https://www.cncf.io/projects/opentelemetry/) — the project page, and a useful source of case studies from people running this at volume.
