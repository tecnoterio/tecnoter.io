+++
title = "A Pipeline That Nobody Skips"
date = 2022-03-09
weight = 357139
tags = ["cicd", "pipelines", "practice"]
[taxonomies]
tags = ["cicd", "pipelines", "practice"]
+++

Every team I have worked with that skips CI has a good reason and the reason
is always reasonable. The test suite takes forty minutes. The integration
environment is down. The deploy needs a credential nobody has. Release is
under time pressure and the change is small.

All of those are true. The question is what you did about them, and most
teams respond by adding a way around the gate rather than by making the gate
worth using.

We ended up with three rules that have held for years.

The first: the fast path is the safe path. Whatever you do to make the
fifteen-second check pass has to be the same thing you do to make the
forty-minute check pass. If merging to main is quick and merging to
production is slow and scary, people will ship from main and you have built
a second, unofficial release process. We got the path to production down to
about the same duration as the path to main, and the skipping largely
stopped without anyone being told to stop.

The second: a skipped gate is a bug with a deadline. Not a discussion. The
bypass flag gets an issue, an owner, and an expiry. Most bypasses turn out
to be a missing test double, a flaky dependency, or a credential that should
have been federated. None of those need to keep happening.

The third: we do not gate on things a human will approve anyway. A four-eye
review on a changelog is a queue. If the gate is about machine-checkable
correctness, automate it completely. If it is about judgement, do it
informally and quickly.

None of this is about trust. It is about the observation that a process
people work around is not a process, it is a performance, and its only
function is to make people feel that something was controlled.

## References

- [GitHub Actions: OpenID Connect](https://docs.github.com/en/actions/concepts/security/openid-connect) — removing long-lived credentials from CI, which is the most common reason a gate gets bypassed for lack of a key.
- [GitHub Actions: OIDC in cloud providers](https://docs.github.com/en/actions/how-tos/secure-your-work/security-harden-deployments/oidc-in-cloud-providers) — the worked examples for AWS, Azure, and GCP.
- [CNCF State of Cloud Native Development](https://www.cncf.io/reports/state-of-cloud-native-development-q1-2026/) — the adoption data behind treating pipeline design as a platform problem rather than a local one.
