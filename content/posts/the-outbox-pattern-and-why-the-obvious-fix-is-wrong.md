+++
title = "The Outbox Pattern, and Why the Obvious Fix Is Wrong"
date = 2023-01-24
weight = 356818
tags = ["event-driven", "kafka", "architecture", "reliability"]
[taxonomies]
tags = ["event-driven", "kafka", "architecture", "reliability"]
+++

The bug was an order that existed in the database and never existed anywhere
else. The customer was charged, the confirmation email went out, and the
fulfilment system never heard about it. It happened roughly once in four
thousand orders, which is exactly the worst possible rate: rare enough that
nobody reproduced it by reading the code, frequent enough to be a real cost.

The cause was the oldest one in distributed systems. We wrote to the
database, then published to the broker. Two systems, no transaction between
them, and a window where the process could die. Every so often it did.

The fix everybody reaches for is a distributed transaction, and I want to be
clear that I think it is almost always the wrong answer. It couples the
liveness of your order system to the liveness of your broker, it requires
every participant to speak a protocol they were not designed for, and it
turns a recoverable failure into a stuck one. You have made the two systems
more dependent in order to make them more consistent, which is the opposite
of what you were asked for.

The outbox is smaller and, in my experience, better. Instead of publishing
after the write, write the event into a table in the same database, in the
same transaction. Now the order and the intent to publish it either both
exist or neither does. A separate process reads the outbox, publishes to the
broker, and marks rows as sent. If it dies mid-publish, it republishes. The
consumer must therefore be idempotent, which it should have been anyway.

The properties to be honest about. Delivery is at-least-once, not
exactly-once, and pretending otherwise is the usual source of duplicate
orders. There is a lag between the write and the publish, usually
milliseconds, occasionally longer under load. And the outbox table grows,
so it needs an archival policy or it becomes the largest table in your
schema.

You trade a distributed transaction for a table, a poller, and an idempotent
consumer. I have never regretted that trade.

## References

- [Transactional Outbox](https://microservices.io/patterns/data/transactional-outbox.html) — the canonical description of the pattern, including the alternatives it is a compromise between.
- [Idempotent Consumer](https://microservices.io/patterns/communication-style/idempotent-consumer.html) — the consumer half, which is not optional.
- [Saga](https://microservices.io/patterns/data/saga.html) — what to do when the outbox is not enough and steps genuinely need compensating.
