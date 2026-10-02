+++
title = "About"
slug = "bio"
group = "directory"
weight = 1
+++

Tecnoter.io is a systems engineering company with a long career building
software and the infrastructure it runs on. Both halves of that work are done
by the same engineers: the service and the systems, the code and the cluster,
the design and the page at 3 a.m.

That is not an unusual combination to describe, but it is an unusual one to
deliver. Teams that split development from operations inherit a coordination
tax on every incident, and pay it hardest at the moment the clock is running.
Working across both layers means the diagnosis does not have to be handed over
to find where the fault actually is.

The work is broad on purpose. Systems work, networking, and infrastructure were
the foundation; the recent centre of gravity is large event-driven systems,
where the interesting failures are in ordering, idempotency, and replay rather
than in uptime. Observability is the other deep well: Prometheus, Loki,
Tempo, and Mimir behind Grafana, run open source and vendor-neutral, because
that stack is cheaper at volume and a licensing change is not an incident. The
data work sits next to it rather than in a separate data team: the same people
who build the datasources are the ones who query them. A career that spans all
of this is worth more than the sum of the parts, because the difficult
problems rarely respect the boundary.

We started from a simple position: systems should be reproducible,
inspectable, and boring to operate. A system nobody can explain is a system
nobody can fix under pressure. That conviction has not changed as the tooling
around us has.

Our work leans on declarative configuration. Terraform, Ansible, Helm, and
Argo CD are the same idea in four languages, and we treat them that way: the
repository is the source of truth, a pipeline proves it still converges, and
the runtime is a rendering target rather than a hand-built accumulation of
drift. Cloud-agnosticism is not a slogan for us. It is the practical
consequence of that model, and it is what lets a platform move between
providers without being rewritten.

We also use AI where it earns its place in the workflow: reading logs and
alert context, summarising incident timelines, and drafting the first pass of
documentation and test fixtures. It accelerates the work around the code. It
does not decide how the system behaves, and it is never the only thing
standing between a change and production.

Most of the systems we work on belong to other companies and stay there.
Engagements are usually under NDA, which is the normal condition of this kind
of work and one we are happy to work within.
