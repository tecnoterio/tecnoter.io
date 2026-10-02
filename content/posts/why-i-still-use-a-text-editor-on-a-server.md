+++
title = "Why I Still Use a Text Editor on a Server"
date = 2019-03-12
weight = 358232
tags = ["linux", "fundamentals"]
[taxonomies]
tags = ["linux", "fundamentals"]
+++

A colleague asked why I was editing a file over SSH instead of using a
configuration management tool. The honest answer was that the file was going
to be gone in four months and I did not yet know what the system was.

That is the whole of it. Configuration management is for systems whose shape
you have settled on. A machine you are still discovering is a machine you
still need to look at, and the fastest way to look at a thing is to read it.

The tools are not wrong. They are answers to a question I could not yet ask
properly, and reaching for one early tends to produce a module with three
parameters and no owner.

What changed my habit was not maturity, it was being wrong twice with a
hand-edited file on a system I thought I understood. The edit was right. The
assumption underneath it was not, and nothing in a text editor was going to
tell me so.

The rule I settled on: hand-edit while you are still learning the system.
Everything after that goes in version control, including the hand-edits,
with a comment saying what changed and why. The comment is the part that
matters. Without it you have automation nobody can maintain.

## References

- [Ansible: desired state and idempotency](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_intro.html#desired-state-and-idempotency) — the model you move to once the system shape is settled.
- [Ansible: check mode and diff mode](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_checkmode.html) — how to make the transition reversible, by seeing the diff before applying it.
