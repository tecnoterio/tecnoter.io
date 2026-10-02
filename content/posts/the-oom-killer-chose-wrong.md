+++
title = "The OOM Killer Chose Wrong, and That Was Predictable"
date = 2026-02-18
weight = 355697
tags = ["linux", "memory", "cgroups", "debugging"]
[taxonomies]
tags = ["linux", "memory", "cgroups", "debugging"]
+++

A batch job started killing the API. Not the batch job, which was the one
running out of memory, but the API, which was comfortably within its limit
and had nothing to do with the problem. The OOM killer had made a decision,
the decision was wrong, and the interesting part is that it was wrong in a
completely predictable way.

The Linux OOM killer scores processes and kills the highest. The score is
based on how much memory a process holds, with adjustments, and the practical
effect is that a large process that has done nothing recently scores well and
a busy small process that has been working hard for an hour scores poorly.

The API process was small and busy. The batch job was large and had allocated
a great deal of memory over twenty minutes, most of which it was not currently
touching. From the kernel's point of view the batch job was the better
candidate, and it was right about memory and wrong about consequences.

**The modern answer is not to tune the OOM killer.** It is to stop the kernel
having a global opinion, which is what cgroups are for. A cgroup gives a
process group a memory limit and a memory pressure threshold, and the kernel
kills inside that group rather than across the machine. A job that exceeds its
own limit dies; it does not get to choose a victim outside itself.

The v2 hierarchy, which is the current default on every current distribution,
also brings memory pressure information as a first-class signal rather than
something reconstructed from the page cache. A cgroup knows what percentage of
its limit is working set versus reclaimable, which is the difference between
"we are out of memory" and "we are about to be, and here is what to do". That
information is what you alert on, because it is available before the kill
happens rather than after.

The part most teams get wrong is the allocation shape. We were using memory
limit and request interchangeably, which means the limit was the only number
that mattered, and the limit was generous. Setting a limit that a process
should never approach converts a memory leak from a machine-wide outage into
one container restarting, which is the entire point of running containers in
the first place.

There is also a QoS question underneath it. Kubernetes classifies pods by how
their requests and limits are set, and that classification is what decides
which pod is evicted first when the node runs out of memory. Get the requests
right from measured usage and the eviction order matches your business
importance. Guess them and the order is effectively random.

Three things I would check the next time something unusual gets killed,
before reaching for any of the scoring tunables:

What was the cgroup limit, and how close was it. Not the node total.

What was the actual resident set, versus the virtual size, versus what the
process had mapped and was not touching. These are three different numbers
and the OOM killer's opinion is closer to the first than people expect.

And whether memory pressure information showed a climb before the kill. If
it did, this was predictable, and the fix belongs in the limit rather than in
the scoring.

## References

- [Control Group v2](https://www.kernel.org/doc/html/latest/admin-guide/cgroup-v2.html) — the authoritative document, by Tejun Heo, and long
- [Managing resources for containers](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/) — requests, limits, and what they mean
- [Pod Quality of Service classes](https://kubernetes.io/docs/concepts/workloads/pods/pod-qos/) — how the class is assigned and what it controls
- [systemd-oomd](https://man7.org/linux/man-pages/man8/systemd-oomd.service.8.html) — the user-space equivalent, for the case where cgroups are not available
