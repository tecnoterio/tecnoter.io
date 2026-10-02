+++
title = "Reading: Supply Chain Security, After the Attacks"
date = 2026-01-18
weight = 355728
tags = ["supply-chain", "security", "reading", "slsa"]
[taxonomies]
tags = ["supply-chain", "security", "reading", "slsa"]
+++

A link roundup. This area changed substantially in the last couple of years
because it stopped being theoretical. The best material is now postmortems,
and postmortems are far more useful than guidance.

**The one to start with.** Tanner Linsley,
[Postmortem: TanStack npm supply-chain compromise](https://tanstack.com/blog/npm-supply-chain-compromise-postmortem).
Forty-two monorepo packages, compromised, written by the person whose
packages they were. The kill chain is the interesting part: a
`pull_request_target` abuse, then Actions cache poisoning, then OIDC token
extraction from the runner, then a self-replicating worm exfiltrating cloud,
Kubernetes, Vault, GitHub and SSH credentials. Detection took twenty minutes
from compromise, which is the number I keep coming back to.

**The analysis that explains what SLSA does and does not cover.** Andrew
McNamara on
[Mini Shai-Hulud: where SLSA's boundaries fall](https://slsa.dev/blog/2026/05/mini-shai-hulud-what-slsa-can-and-cannot-do).
This is the post that made provenance feel less like a compliance exercise.
It maps the same attack against the SLSA Build levels and is clear about
where L2 stops and L3 begins, and why a signed artefact built by a compromised
workflow is still a problem.

**The defensive catalogue.** GitHub Security Lab on
[disrupting supply chain attacks on npm and GitHub Actions](https://github.blog/security/supply-chain-security/disrupting-supply-chain-attacks-on-npm-and-github-actions/).
Everything shipped in response over two years, in one place: read-only cache
for untrusted triggers, safer `pull_request_target` defaults, staged
publishing, install scripts disabled by default, and a Dependabot cooldown.
Dense and the most useful page on this list if you maintain a public package.

**Also from GitHub.** [Our plan for a more secure npm supply
chain](https://github.blog/security/supply-chain-security/our-plan-for-a-more-secure-npm-supply-chain/),
which is a roadmap rather than an explanation, and
[a year of open source vulnerability
trends](https://github.blog/security/supply-chain-security/a-year-of-open-source-vulnerability-trends-cves-advisories-and-malware/)
for the data. The number worth noticing: malware advisories up sixty-nine
percent year over year.

**On Sigstore specifically.** GitHub's
[announcing npm package provenance](https://github.blog/2023-04-19-introducing-npm-package-provenance/)
is the clearest end-to-end walkthrough of the OIDC to Fulcio to Rekor flow
anywhere. Four years old and still the one to read.

**The complete implementation.** If you want to see every stage actually
wired together rather than described,
[SLSA end-to-end with AMPEL](https://slsa.dev/blog/2025/10/slsa-e2e-with-ampel)
walks source attestations, builder image verification, SPDX SBOMs, OSV
scanning with VEX, test result attestations, and end-user verification.
Code-heavy, unglamorous, and closer to reality than any other document here.

**Two older, still relevant.** Google's
[dependency confusion and typosquatting](https://slsa.dev/blog/2024/08/dep-confusion-and-typosquatting)
explains why build provenance fixes a class of attacks that signing alone
does not, and GitHub on
[SBOMs, SCA and the CVE ecosystem](https://github.blog/security/supply-chain-security/securing-the-open-source-supply-chain-the-essential-role-of-cves/)
covers how the tools fit together.

**Vendor, flagged.** Chainguard on
[achieving SLSA Build Level 3](https://www.chainguard.dev/unchained/proven-not-promised-chainguard-containers-achieves-slsa-build-level-3).
Genuinely useful detail on what L3 isolation means, independently assessed,
but the company sells the thing the assessment is about.

## What I would actually read in this order

The TanStack post first, because it is a first-person account and you will
not forget it. Then the SLSA boundaries analysis with the attack map in front
of you. Then GitHub's defensive catalogue if you own anything published.
