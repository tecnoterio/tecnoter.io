+++
title = "GitOps for a Fleet You Do Not Own"
date = 2026-01-08
weight = 355738
tags = ["gitops", "argocd", "platform", "multi-tenant"]
[taxonomies]
tags = ["gitops", "argocd", "platform", "multi-tenant"]
+++

Everything I had learned about GitOps assumed one team and one cluster. The
moment you have a platform team running an Argo CD instance that forty
product teams sync to, the interesting questions are not about sync at all.
They are about authority.

Who can create an Application is the entire security model. If product teams
can point an Application at an arbitrary repository and path, you have given
every one of them write access to every cluster, in a few clicks and entirely
in good faith. Project-scoped RBAC on the Argo CD side is not a hardening
measure, it is the thing that makes the tool safe to expose at all, and it has
to be the default rather than something the platform team grants on request.

Repository structure becomes a trust boundary. The ApplicationSet walks a
directory tree, so what sits in that tree is a policy decision. Ours is one
repository per service, with a path per environment, and the platform repo
holds only shared components. A team that can write to the root of a shared
repository can change every workload, so the root is not writable by product
teams and the CI that writes to it runs with different credentials.

Then there is the failure mode that took us longest to accept: the cluster
drifts, Argo CD sees it, self-heal reverts it, and the team whose change was
reverted has no idea that their work disappeared. Two teams, both acting
reasonably. The reversion is correct and the surprise is total. We now treat
a drift event as a communication event first, and a system event second.

And the one nobody warns you about: the platform team becomes the bottleneck
for every application, every repository, every cluster registration. We had
not planned for that, and the fix was not technical. It was a self-service
path and a paved road, so the common case does not need us.

The general thing I would tell my past self: GitOps scales fine as a system.
It scales surprisingly badly as an organisation, and the difference is almost
entirely about who is allowed to do what, which is a policy you have to
decide before you have the incident that makes you decide it.

## References

- [Argo CD: projects and project-scoped RBAC](https://argo-cd.readthedocs.io/en/stable/user-guide/projects/) — the thing that has to be the default, not a grant.
- [Argo CD: RBAC configuration](https://argo-cd.readthedocs.io/en/stable/operator-manual/rbac/) — the global model, and how AppProject roles fit into it.
- [Kubernetes RBAC good practices](https://kubernetes.io/docs/concepts/security/rbac-good-practices/) — the upstream least-privilege guidance this borrows from.
- [CNCF State of Cloud Native Development](https://www.cncf.io/reports/state-of-cloud-native-development-q1-2026/) — the broader trend this organisational problem sits inside.
