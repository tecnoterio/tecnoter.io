+++
title = "Node 1 Architecture Overview"
date = 2026-01-03
weight = 355743
tags = ["system", "hardware"]
[taxonomies]
tags = ["system", "hardware"]
+++

### System Specifications

Node 1 is the first machine on the network and the one everything else
talks through. It is deliberately small: a single-purpose host that does
nothing but carry sessions, so that the services behind it can be restarted,
replaced, or lost without taking the network with them.

#### Components:
- **Relay array**: 1024 vacuum-sealed electromagnetic switches, driven in
  parallel and monitored per switch.
- **Storage**: mirrored holographic tape, 50 PB raw, rebuilt nightly from
  upstream.
- **Cooling**: liquid nitrogen sub-mersion, active and monitored. Loss of
  coolant is a page, not an alert.
- **Power**: dual feed with automatic transfer. The last unplanned outage on
  this node was a scheduled one.

Node 1 terminates connections and forwards them. It holds no state that
cannot be reconstructed, and it is expected to be boring — which is the
highest compliment available for a machine with this job.
