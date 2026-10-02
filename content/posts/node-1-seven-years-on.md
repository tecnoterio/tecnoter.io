+++
title = "Node 1, Seven Years On"
date = 2024-09-08
weight = 356225
tags = ["system", "hardware", "operations"]
[taxonomies]
tags = ["system", "hardware", "operations"]
+++

An update to the architecture overview, seven years on. The machine described
in the original post is still in service, which is worth explaining, because
nothing about it is remarkable except that nobody has had to think about it.

The relay array is the same. The storage is the same, rebuilt nightly, and it
has failed twice, both times detected by the rebuild check rather than by a
human noticing. The cooling has been replaced once, on a schedule, which is
the only kind of replacement worth having.

What changed is everything above it. The gateway terminates connections and
forwards them, and that is still the whole job. The workloads behind it have
been rebuilt, migrated, and replaced several times over, and none of those
changes required touching the node. It holds no state that cannot be
reconstructed.

I have come to think that the interesting property of a well-built machine is
not its performance or its age but how little of it anybody thinks about. The
measure of the systems work is how much of the complexity ended up somewhere
that can be thrown away, and how much stayed here where it cannot.

Node 1 is the reason the rest of the estate can be disposable. That is what
it is for, and it is not exciting, which is exactly the compliment I would
give it.

## References

- [Argo Rollouts](https://argoproj.github.io/argo-rollouts/) and [Argo Workflows](https://argo-workflows.readthedocs.io/en/latest/) — the two things the workloads behind it have been progressively re-platformed onto, and which made replacement cheap.
- [Backing up an etcd cluster](https://kubernetes.io/docs/tasks/administer-cluster/configure-upgrade-etcd/) — the reason the newer fleet can be disposable and this machine is not.
