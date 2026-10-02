+++
title = "The DNS Lookup That Took Eleven Seconds"
date = 2020-09-03
weight = 357691
tags = ["networking", "debugging", "dns"]
[taxonomies]
tags = ["networking", "debugging", "dns"]
+++

The service was fine. The database was fine. The page took eleven seconds to
load and everyone assumed the database.

It was a DNS lookup. Specifically, a resolver timeout against a server that
no longer existed, configured in a resolv.conf that nobody had looked at in
four years. The retry took two seconds, the second lookup took four, and the
answer nobody was waiting for came from the third.

The interesting part is not that DNS can be slow. It is that our monitoring
did not see it. We had dashboards for latency, error rate, and CPU, and every
one of them was green for the entire incident. The application was, by every
metric we had chosen to measure, healthy. It was just slow, in a way that
only showed up as a timeout in a place we were not looking.

Three things changed after that.

We added the resolution time itself as a metric, because it is a dependency
and it is a timeout waiting to happen. We started asserting that every
configured nameserver answers, in CI, which is a test and not a dashboard.
And we gave the resolver a shorter timeout than the application, so the
application failed fast and the retry budget belonged to the code rather than
to the network.

The general shape: a timeout is a design decision, and the default is
usually inherited from whoever wrote the config file. Defaults that nobody
chose are still decisions you have to own.

## References

- [systemd-resolved.service(8)](https://www.freedesktop.org/software/systemd/man/latest/systemd-resolved.service.html) — the stub resolver on 127.0.0.53, and the split-DNS setup this post ended up using.
- [systemd.unit(5)](https://man7.org/linux/man-pages/man5/systemd.unit.5.html) — the dependency and ordering directives involved when the resolver and the service have to be sequenced correctly.
