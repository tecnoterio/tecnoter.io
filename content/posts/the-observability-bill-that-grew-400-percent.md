+++
title = "The Observability Bill That Grew 400 Percent"
date = 2022-11-02
weight = 356901
tags = ["observability", "grafana", "prometheus", "cost"]
[taxonomies]
tags = ["observability", "grafana", "prometheus", "cost"]
+++

The bill went from four thousand a month to just over sixteen, and nothing
in the system had changed. No new services, no more traffic, no migration. The
same application, doing the same work, producing four times the bill.

The cause was a single line added to a metrics helper: the user ID. One
label. It was added because someone needed to filter by user, it took one
line, and it created roughly twelve million time series.

Nothing broke. That is the detail worth sitting with. The system was fine.
The dashboard was fine. The alerts worked. And we were paying for a data
model that could not answer a question anybody had, at a cardinality that
would eventually take the system down rather than simply costing money.

We found it the slow way, which is the way most people find it. A monthly
cost review showed a trend, someone asked why, and then someone ran a query
grouping series count by metric name. The answer was one metric with a
user_id label and 94 percent of the total series count.

Three things changed.

Label cardinality is now a reviewed decision, in the same way an index is a
reviewed decision. If you want a dimension on a metric, that is fine, but
somebody has to say they understand what it does to the series count.

Series counts are a first-class alert. We watch the total, and we watch the
per-metric breakdown, and the breakdown is the one that tells you where the
problem is. A global series count alarm tells you that you have a problem
approximately four hours after the invoice.

And we kept the data we could not index. Per-user metrics are often a
signals problem, not a metrics problem, and putting them in the right place
cost us nothing and removed twelve million series from the hot path.

The general lesson: metrics are a data model with a cardinality budget, and
like every budget it is invisible until it is exhausted. The bill is the
late warning, not the early one.

## References

- [Naming](https://prometheus.io/docs/practices/naming/) — the warning about unbounded label values, and why `user_id` appears in the list of things not to do.
- [High cardinality alerts](https://grafana.com/docs/grafana/latest/alerting/examples/high-cardinality-alerts/) — how to identify the offending series by query rather than by guess.
