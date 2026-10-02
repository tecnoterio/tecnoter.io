+++
title = "Reading: Event-Driven Systems at Scale"
date = 2026-01-20
weight = 355726
tags = ["event-driven", "reading", "kafka", "streaming"]
[taxonomies]
tags = ["event-driven", "reading", "kafka", "streaming"]
+++

A link roundup. Most writing on event-driven systems is either a pattern
catalogue or a vendor case study. The useful material is the production
write-ups, because they are the only ones that mention the parts that go
wrong.

**The pattern, properly stated.** Chris Richardson on the
[transactional outbox](https://microservices.io/patterns/data/transactional-outbox.html),
which frames it as a compromise between two other designs rather than
presenting it as the right answer. Worth reading even if you are not building
it, for how the trade-offs are described. Same author on the
[idemponent consumer](https://microservices.io/patterns/communication-style/idempotent-consumer.html)
and the [saga](https://microservices.io/patterns/data/saga.html).

**Foundational and older than it feels.** Martin Fowler on
[event sourcing](https://martinfowler.com/eaaDev/EventSourcing.html), from
2005 and still the clearest statement of the idea. Fowler's pattern language
is worth keeping open generally; the site has been stable for twenty years
precisely because it does not chase trends.

**Change data capture, done properly.** Shopify Engineering on
[capturing every change from a sharded monolith](https://shopify.engineering/blogs/engineering/capturing-every-change-shopify-sharded-monolith).
Debezium, Kafka Connect, and schema evolution against four hundred terabytes
of CDC across a hundred MySQL shards. The part I return to is how they
handled schema evolution without coordinating a fleet of consumers, which is
the problem everyone discovers late.

**Streaming at extreme scale.** LinkedIn on
[four trillion events a day with Apache Beam](https://www.linkedin.com/blog/engineering/data-streaming-processing/revolutionizing-real-time-streaming-processing--4-trillion-event).
Three thousand pipelines, and the useful detail is in the operational
sections rather than the headline number. A companion piece on
[unifying streaming and batch](https://www.linkedin.com/blog/engineering/data-streaming-processing/unified-streaming-and-batch-pipelines-at-linkedin-reducing-proc)
claims a ninety-four percent reduction in processing time, and is the best
published argument against running two separate pipeline stacks.

**Honest retrospective.** LinkedIn on
[going from Lambda to Lambda-less](https://www.linkedin.com/blog/engineering/data-science/lambda-to-lambda-less-architecture).
The name is unfortunate but the content is a candid account of the
operational cost of maintaining both a batch and a streaming path for the same
data. Short, and more persuasive than a framework argument.

**Feature consistency at scale.** Uber on
[taming the ML firehose](https://www.uber.com/br/en/blog/taming-ml-firehose/),
about the training-serving gap and using the stream itself to filter
impressions so features are logged consistently. Eight million queries per
second. Worth reading if you are running models in production, and skip it if
you are not.

**Kafka-compatible systems.** Redpanda's engineering blog on
[a log compaction bug in Apache Kafka](https://redpanda.com/blog/kafka-log-compaction-bug-fix-streaming),
with a reproducible test case. This is a vendor demonstrating a competitor
defect, so read it sceptically and check the test case yourself, but it is a
reminder that protocol compatibility is not implementation equivalence. Their
[Kafka client compatibility](https://docs.redpanda.com/streaming/current/develop/kafka-clients/) page
lists the known exceptions, which is the more useful document.

**Reference material.**
[Schema registry and compatibility
modes](https://docs.confluent.io/platform/current/schema-registry/avro.html),
for the practical rules on backward versus forward compatibility, and
[stream versus batch](https://www.confluent.io/blog/stream-processing-vs-batch-processing/)
as a primer if the distinction is still fuzzy.

## What I would actually read in this order

Fowler on event sourcing, then Richardson on the outbox, then Shopify on
change data capture. The three pattern references are short. The case studies
are long and worth it only once you know which problem you have.
