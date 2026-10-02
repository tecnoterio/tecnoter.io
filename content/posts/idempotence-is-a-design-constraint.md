+++
title = "Idempotence Is a Design Constraint, Not a Feature"
date = 2021-02-08
weight = 357533
tags = ["ansible", "configuration", "automation"]
[taxonomies]
tags = ["ansible", "configuration", "automation"]
+++

The first playbook I wrote for a new role would run cleanly against a fresh
host. On the second run it would also pass. On the third, it changed
something, and I spent an afternoon working out what.

The answer was an apt source list I had appended rather than declared, and a
cron file I was writing with a template that included a date. Both were
obvious in hindsight. Neither was visible as a bug, because the playbook did
not fail. It succeeded in making the system slightly different from how it
found it, every single time.

That is the part I have watched people get wrong. Idempotence is not a
feature you add. It is a constraint you design under, and it changes what the
role is allowed to look like. If a task cannot be expressed as "make it so",
you are not writing a configuration management task, and you should not be
relying on the tool to hide that from you.

The practical rules I use now:

State is declared, not appended. Full file content, not a line. State is
managed in one place, and it is versioned.

Anything that genuinely cannot be idempotent is a one-time migration, and it
belongs in a directory named for that, with a guard, and with a date in the
name. You are not writing a role at that point. You are writing a piece of
history, and history should be boring.

And run the play twice in CI, against a real host, and diff. It is the
cheapest test in the repository and it catches the entire class.

## References

- [Desired state and idempotency](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_intro.html#desired-state-and-idempotency) — the official statement of the principle.
- [Check mode and diff mode](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_checkmode.html) — running without changing anything, which is the test this post is describing.
