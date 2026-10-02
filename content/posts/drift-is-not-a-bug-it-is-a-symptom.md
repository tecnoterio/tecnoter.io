+++
title = "Drift Is Not a Bug, It Is a Symptom"
date = 2019-11-14
weight = 357985
tags = ["configuration", "drift", "operations"]
[taxonomies]
tags = ["configuration", "drift", "operations"]
+++

Somebody changed something in production. It was not in version control, it
was not in a ticket, and nobody remembers who. The change was correct, which
is what makes it interesting.

This happens constantly and it is not primarily a discipline problem. It is a
feedback problem. When the only way to make a change quickly is outside the
tool, people use the tool that is not the tool, and the tool becomes a
historical record of interventions rather than a description of the system.

I used to treat drift as a failure of discipline. Now I treat it as a signal
about the tooling. If drift keeps happening in one place, the tooling is
too slow, too brittle, or too dangerous to use for that particular change.
The person who edited the console at 2 a.m. during an incident was making a
rational decision about a system that was failing them.

So the first question is not "who did this" but "what did we make so
unpleasant that this was easier". Sometimes the answer is that the change
needed a five-minute review cycle and it needed ninety seconds. Sometimes it
is that the value lived in a file nobody could regenerate. Sometimes the
person simply did not know the system was managed, which is also a tooling
problem, of communication rather than code.

The fix is not detection. Detection is what everyone reaches for first, and
it works, and it makes people slightly defensive, because a drift report
tells you something is wrong without telling you what. The fix is to remove
the reason.

Once the fix is in, detection still earns its place. Not to catch people.
To catch the tool being wrong, which will happen, and which is the case you
actually want to know about.

## References

- [Ansible: desired state and idempotency](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_intro.html#desired-state-and-idempotency) — the model this post assumes, and the reason drift is theoretically impossible.
- [Packer documentation](https://developer.hashicorp.com/packer/docs) — building images as a pipeline artefact, which removes the class of drift that has no configuration file at all.
