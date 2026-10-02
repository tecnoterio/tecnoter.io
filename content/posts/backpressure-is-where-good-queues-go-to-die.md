+++
title = "Backpressure Is Where Good Queues Go to Die"
date = 2026-02-26
weight = 355689
tags = ["event-driven", "kafka", "streaming", "reliability"]
[taxonomies]
tags = ["event-driven", "kafka", "streaming", "reliability"]
+++

A consumer fell behind. Not by a lot, and not for long. It fell behind by
enough that the lag alert fired, and then the system did the thing every
system does when a consumer falls behind: it retried, more aggressively, with
a shorter interval, which made the consumer slower still.

It is such a predictable failure that I have now watched it in three
different systems, and it is worth writing down because the fix is never in
the place people look.

**Retries are not backpressure.** Backpressure is the producer slowing down
because the consumer cannot keep up. Retries are the consumer trying harder
against a resource it already does not have. The difference is whether the
signal reaches the party that can actually relieve the pressure. A retry loop
generates load against a system that is already saturated and reports nothing
to the producer, who keeps producing at full rate because nothing told them
otherwise.

Worse, retries usually multiply. If the consumer makes three attempts per
message and the failure rate is high, the effective load on the failing
dependency is three times the load of the work you actually need done. Under
exactly the conditions where the system has least spare capacity.

**The queue is a lie about capacity.** An unbounded queue does not remove
backpressure, it converts it into latency. Every message that arrives goes in.
The work is not smaller, the consumer is not faster, and the only thing that
changed is that the failure is now spread over time instead of concentrated at
the front. A request that used to fail immediately now waits nineteen seconds
and then fails, which is strictly worse: the same failure, more work, more
memory, and no signal that anything went wrong.

The symptom that gives it away is memory. If a queue is growing, something is
holding the messages, and in most systems that something is memory that
started as available capacity. A backlog is a resource decision you did not
make.

**What actually works.** Bounded queues, with a defined behaviour when full.
Either the producer blocks, which is real backpressure, or the producer drops,
which is a decision you have to make deliberately and tell people about. The
sin is the default, which is usually to grow without limit.

Bounded retries with a real ceiling, and an exponential backoff that is wide
enough that retries are not a second load source. If the ceiling is reached,
the message goes to a dead-letter queue, and somebody is responsible for
emptying it. A dead-letter queue with nobody looking at it is a delayed
incident.

And a queue-depth alert that is about the rate of change rather than the
absolute depth. Depth tells you the backlog is large. The derivative tells you
whether it is getting worse, which is the one that decides whether you have
time to do something about it.

A consumer that cannot keep up is not a scaling problem, it is a design
question about which of the four things the producer is allowed to do: slow
down, retry later, drop, or shed. All four are valid. What is not valid is
letting the queue grow while the system quietly burns memory and the dashboards
stay green.

## References

- [Message delivery semantics](https://docs.confluent.io/kafka/design/delivery-semantics.html) — what the guarantees actually cover
- [Idempotent consumer](https://microservices.io/patterns/communication-style/idempotent-consumer.html) — required before retries are safe
- [Unified streaming and batch pipelines at LinkedIn](https://www.linkedin.com/blog/engineering/data-streaming-processing/unified-streaming-and-batch-pipelines-at-linkedin-reducing-proc) — what happens at scale when the flow is not bounded
- [Reactive Streams](https://www.reactive-streams.org/) — the specification behind most modern backpressure implementations, and the clearest short statement of why a subscriber that cannot keep up must be allowed to say so
