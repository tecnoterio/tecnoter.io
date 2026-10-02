+++
title = "The Build Was Green and the Pipeline Was Lying"
date = 2026-03-06
weight = 355681
tags = ["cicd", "security", "supply-chain", "pipeline"]
[taxonomies]
tags = ["cicd", "security", "supply-chain", "pipeline"]
+++

A pull request target ran with write permissions to production, from a fork.
It was a test that needed access to a secret, which is a small and entirely
ordinary request, and the answer was to change the trigger so the untrusted
code could not reach the privileged runner. The specific change was the kind
most teams make by accident and most teams get wrong.

This is the standard shape of the bug and it is worth knowing precisely, because
the difference between the safe and unsafe version is one word in a trigger
name.

A workflow triggered by `pull_request` runs with a read-only token and does not
receive secrets. That is the reason it is safe, and it means untrusted code
from a fork can never reach the privileged path. A workflow triggered by
`pull_request_target` runs in the context of the base repository, with a write
token and access to secrets, while the code it checks out is still the
contributor's. That is the reason it is dangerous, and the documentation for
it contains a warning that predates the first real exploitation of the pattern.

You need `pull_request_target` for legitimate things: commenting on a pull
request, labelling it, and occasionally building a privileged artefact. The
problem is not the trigger, it is the checkout. If the job checks out the head
of the pull request and then runs anything from it, you have handed your
production credentials to a stranger.

**The cache made it worse, and this surprised me.** Caching is the standard
way to make a pipeline fast, and the standard implementation writes to a cache
scope reachable from later runs, including runs of untrusted code. An attacker
who can write into that cache does not need to execute anything in your
privileged job. They poison the cache, the privileged job restores it, and the
payload runs with your permissions in a context where nothing about the job
looks unusual.

Read-only cache scopes for untrusted triggers close that. It costs some cache
hit rate, which is the whole trade, and the trade is worth making on its own
merely because the alternative is a supply chain compromise that reaches
production.

**What we changed, in the order that mattered.** Untrusted triggers cannot
access secrets, so the job that needed one was rebuilt to not need it. Cache
scopes for untrusted runs are read-only. Third-party actions are pinned by
digest, not by tag, because a tag is mutable and a compromised maintainer
account is exactly how a supply chain gets into hundreds of repositories at
once. Workflow permissions are declared minimal at the top of every file, so
the default is read-only and a job that needs more has to say so visibly.

The one that took the longest was having a policy conversation about
`pull_request_target`, because every existing use was somebody's reasonable
solution to a real problem three years ago. All of them needed rewriting and
two of them needed deleting. That is the actual cost of this class of problem,
and it is worth being honest about rather than presenting it as a one-line fix.

If you take one thing from this: a green pipeline is evidence that the checks
you configured ran. It is not evidence that they could not have been
circumvented. The TanStack postmortem documents a worm that moved from
repository to production credentials in under twenty minutes, and none of the
builds involved were red.

## References

- [Disrupting supply chain attacks on npm and GitHub Actions](https://github.blog/security/supply-chain-security/disrupting-supply-chain-attacks-on-npm-and-github-actions/) — GitHub's full catalogue of CI-side mitigations, and the best single reference here
- [Postmortem: TanStack npm supply-chain compromise](https://tanstack.com/blog/npm-supply-chain-compromise-postmortem) — the kill chain, from the maintainer
- [Where SLSA's boundaries fall](https://slsa.dev/blog/2026/05/mini-shai-hulud-what-slsa-can-and-cannot-do) — what provenance does and does not protect against
- [GitHub Actions: OpenID Connect](https://docs.github.com/en/actions/concepts/security/openid-connect) — replacing stored credentials with short-lived ones, which limits the damage when a token does leak
