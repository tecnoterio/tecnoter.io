+++
title = "Log Aggregation Is a Cost Model, Not a Storage Problem"
date = 2024-06-17
weight = 356308
tags = ["observability", "loki", "logging", "cost"]
[taxonomies]
tags = ["observability", "loki", "logging", "cost"]
+++

The instinct when logs get expensive is to lower retention. It is the wrong
first move and I have watched teams do it twice.

Retention is a blunt instrument. It throws away everything, including the
incident you are currently debugging and the slow drift that led up to it. The
bill falls and the capability falls with it, silently, and nobody notices
until the one time they needed the old logs.

Logs are not one thing. They are several things with completely different
economics, and treating them uniformly is what makes the bill frightening.

Debug logs from a request are high volume, low value, and worthless a week
later. They want aggressive retention and aggressive sampling, because the
question they answer is almost always "what happened to this one request",
and that question arrives while the request is recent.

Application logs about business state, a balance changed, a permission
denied, a record created, are low volume, high value, and worth keeping for
years. They are frequently the only evidence that an incorrect thing
happened, and they are usually a fraction of the total.

Access logs sit in between, and are the ones most likely to be retained by
default out of habit rather than need.

Once you split them, the bill usually stops being a problem. Debug retention
goes to days, business state to the full retention window, and the total
drops by more than anyone expected, because the volume was never evenly
distributed across value.

The second thing that mattered for us: log volume correlates with something
interesting, and if you sample the high-volume debug logs by trace ID you
keep a representative subset of every trace rather than a random third of the
system. Sampling by trace is the unit that makes the sample useful.

The general point: you cannot tune what you have not classified. The first
question is not how much to keep, it is which of these logs have ever
answered a question for you.

## References

- [Loki: label design best practices](https://grafana.com/docs/loki/latest/get-started/labels/bp-labels/) — static versus dynamic labels, and why label values have to stay bounded.
- [Loki: query best practices](https://grafana.com/docs/loki/latest/query/bp-query/) — narrowing before parsing, and when a query should be a recording rule instead.
