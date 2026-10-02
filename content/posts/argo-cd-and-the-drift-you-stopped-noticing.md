+++
title = "Argo CD and the Drift You Stopped Noticing"
date = 2024-01-23
weight = 356454
tags = ["gitops", "argocd", "kubernetes", "operations"]
[taxonomies]
tags = ["gitops", "argocd", "kubernetes", "operations"]
+++

The argument for GitOps is usually about audit and about rollback, and both
are real. The benefit I did not expect was subtler: it changed what
"production" means to the people working on it.

Before Argo CD, the running system was a place. It was where things were, it
had a history you could not read, and the way you found out what had happened
was to ask the person who deployed it or to read somebody's terminal history.
The repository was documentation. After Argo CD, the running system is a
rendering of a file, and the file is the thing with the history. That sounds
like a small semantic change and it was not.

The failure I care about is not the cluster that drifts. Argo CD is
extremely good at the mechanical part of that, and self-heal catches it
within seconds. The failure is a repository that is wrong. Argo CD will
reconcile the cluster to a bad decision with perfect faithfulness and at high
speed, which is exactly what you want from a tool and exactly what you do not
want from a system nobody is reading.

Which makes review the load-bearing part. The diff in the pull request is the
entire meaningful check. If it is not being read, you have replaced silent
manual changes with silent declarative changes, which is not an improvement
in trust, only in repeatability.

The configuration that changed our behaviour:

Sync windows and waves, so a multi-service change does not land everywhere at
once and take the cluster down with it.

Health checks that mean something. Argo CD will consider an application
healthy because the pods are running, which is not the same as working. The
checks that matter are the ones written by the team that owns the service.

ApplicationSets with project-scoped RBAC, so a team can only sync what it
owns. Without this the tool becomes a very efficient way for one team to
change another team's production.

And a drift alert that reaches a human. Self-heal is right for a
transient thing. A configuration that keeps being reverted is a decision
somebody is making outside the system, and that is worth knowing about
rather than resolving automatically.

## References

- [Argo CD: projects and project-scoped RBAC](https://argo-cd.readthedocs.io/en/stable/user-guide/projects/) — the trust boundary this post is mostly about.
- [Argo CD: sync waves](https://argo-cd.readthedocs.io/en/stable/user-guide/sync-waves/) — ordering multi-service changes so they do not land all at once.
- [Argo CD: ApplicationSet](https://argo-cd.readthedocs.io/en/stable/operator-manual/applicationset/) — the generators, and why a directory tree is a policy decision.
