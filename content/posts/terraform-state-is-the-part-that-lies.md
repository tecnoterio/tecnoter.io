+++
title = "Terraform State Is the Part That Lies"
date = 2021-10-05
weight = 357294
tags = ["terraform", "iac", "infrastructure"]
[taxonomies]
tags = ["terraform", "iac", "infrastructure"]
+++

Terraform is only as honest as what it knows, and what it knows lives in the
state file. A plan is a story about reality, told by something that was last
updated whenever somebody last ran a command.

I have watched a plan destroy a subnet. Not because of a bug, but because
the resource had been created outside Terraform, the state never learned
about it, and the plan concluded it did not exist. Everything downstream was
correct. The input was fiction.

This is the failure mode people miss when they are new to the tool, because
`plan` and `apply` are safe-sounding words. The safe-sounding words are the
ones that describe a diff between a file and a database. The file is right.
The database may not be.

What I now insist on, before anyone touches a state file:

The state is in remote storage, versioned, and locked. Local state is a
single-machine toy that becomes a production problem without announcing it.

Every apply is reviewed as a plan, in CI, by a human, on a branch. Not on my
laptop where I can see the output more comfortably.

Imports and moves are used rather than hand-editing. Both exist for exactly
this, and hand-editing a state file is how you get a plan that looks fine
and is not.

And when something is created outside the tool, it gets imported the same
day. The gap between "I made this in the console" and "Terraform knows about
this" is where incidents are born.

The plan is a statement of intent, not a report of fact. Treating it as a
report is how a weekend disappears.

## References

- [State](https://developer.hashicorp.com/terraform/language/state) — what the state file is for, and why it is a database rather than a cache.
- [State locking](https://developer.hashicorp.com/terraform/language/state/locking) — concurrent applies, and the recovery path when one dies mid-run.
- [Import](https://developer.hashicorp.com/terraform/language/import) and the [`moved` block](https://developer.hashicorp.com/terraform/language/block/moved) — the supported way to reshape state rather than editing it.
