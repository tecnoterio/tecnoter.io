+++
title = "Capacity Planning From the Data You Already Have"
date = 2025-09-23
weight = 355845
tags = ["observability", "forecasting", "capacity", "data"]
[taxonomies]
tags = ["observability", "forecasting", "capacity", "data"]
+++

We were adding nodes reactively, which is a perfectly reasonable strategy
until the month you need to add eleven of them and procurement takes six
weeks. That month is when I learned to do this properly.

The naive version is a linear extrapolation of last week's average, and it is
useless for two reasons. The interesting signals have seasonality, including a
weekly cycle that will convince you a system is growing when it is actually
the Tuesday peak. And averages are the wrong statistic, because the thing
that breaks is not the mean, it is the tail.

So the work split into two parts, and the second was the valuable one.

Forecasting volume is mostly straightforward once you use a seasonal model
and forecast the whole cycle rather than the point. Predicting resource
consumption per unit of volume turned out to be the harder problem, because
it was not stable: the same throughput cost meaningfully more CPU in March
than in January, and finding the reason (a query plan regression, shipped in
a release, unnoticed) was worth more than the forecast.

The genuinely useful part was asking what the limit actually is. Not
"average CPU is 40 percent" but: at what concurrency does the tail latency
breach the objective, and how far in front of that point are we? That is a
load test result, a saturation curve, and a slope, not a monitoring
dashboard. Saturation is where the curve stops being linear, and everything
after it is a latency cliff rather than a gradual degradation.

What we keep now is small. A forecast on ingest and storage with a stated
confidence interval. A saturation figure per service from a scheduled load
test rather than from a live estimate. And an alert when actual usage
diverges from forecast, which is the one that matters, because it catches the
regression above before the node runs out.

The forecast is the easy part and it is also the part everybody does. The
alert on the forecast is what turns planning into something that survives
contact with a busy quarter.

## References

- [Managing resources for containers](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/) — requests and limits, which is where a saturation estimate becomes a scheduling decision.
- [Quality of Service (QoS) classes](https://kubernetes.io/docs/concepts/workloads/pods/pod-qos/) — why the wrong QoS class means eviction decides which of your services dies.
- [CNCF: the Infrastructure of AI's Future](https://www.cncf.io/reports/the-cncf-annual-cloud-native-survey/) — current data on where platform work is going, and why capacity planning keeps moving.
