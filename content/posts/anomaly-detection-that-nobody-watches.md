+++
title = "Anomaly Detection That Nobody Watches"
date = 2023-09-12
weight = 356587
tags = ["observability", "anomaly-detection", "ml", "alerting"]
[taxonomies]
tags = ["observability", "anomaly-detection", "ml", "alerting"]
+++

We had anomaly detection on six signals, a dashboard showing the score for
each, and nobody looking at any of them. It was not a failure of discipline.
It was a failure of design, and it took a while to see that.

The model was fine. The alerts were not. We had thresholded the anomaly score
at the level that produced a manageable number of notifications, and the
result was a stream of medium-confidence anomalies on signals that were
genuinely normal. Everybody learned, correctly, that the system was noise.
The silence that followed was not laziness. It was the rational response to
a system that had lied often enough.

The thing I got wrong, and the thing I would tell my past self: the false
positive rate is not a threshold you pick once and live with. It is a
property of the signal, and it varies enormously between them. Request rate
on a service with a weekly cycle needs a seasonal baseline. Latency on a
service that is genuinely noisy should probably not be anomaly-detected at
all, and the honest answer for that signal is a fixed objective threshold or
nothing.

What worked, roughly:

Separate detection from notification. A dashboard that shows the score,
without an alert attached, lets you tune without training people to ignore
it. We ran that way for two months per signal before enabling anything.

Only alert on scores you have measured. Not a percentile chosen by feel. We
replayed historical incidents and asked, for this signal, at this threshold,
how many false alerts would this have produced in a month. If the answer was
twenty, the threshold was wrong, or the signal was.

Alert on the thing a human acts on. A score with no associated symptom is
context, not a page.

The general shape: an anomaly detector that alerts more than a person can
check has not replaced monitoring. It has added a second system to trust, and
doubled the number of things that can be wrong while you are trying to work
out what is.

## References

- [Prometheus alerting rules](https://prometheus.io/docs/prometheus/latest/configuration/alerting_rules/) — for the baseline the detector has to beat, expressed in a form a human also reads.
- [Prometheus recording rules](https://prometheus.io/docs/prometheus/latest/configuration/recording_rules/) — precomputing the seasonal baselines rather than recomputing them per query.
- [Prometheus: rules best practices](https://prometheus.io/docs/practices/rules/) — naming and aggregation conventions worth following before the rules pile up.
