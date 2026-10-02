+++
title = "The Systemd Unit That Deadlocked Itself"
date = 2020-05-19
weight = 357798
tags = ["linux", "systemd", "debugging", "fundamentals"]
[taxonomies]
tags = ["linux", "systemd", "debugging", "fundamentals"]
+++

A service that would not start, only on one host, only after a reboot, and
only roughly one time in four. The logs were unhelpful because systemd was
cancelling a transaction and the cancellation reason was in a status line
nobody was reading.

The cause was my own unit file, and it was a mistake I have seen several
times since. I had an ordering dependency, After= on a mount unit, and the
mount unit in turn required the service. Circular. systemd does not always
detect this at load time, and what it does when it hits one at runtime is
start some things, cancel the transaction, and leave a partial system that
looks almost right.

The debugging that found it was not reading the unit file. It was asking
systemd what it thought had happened: the transaction state, and the job list,
which together tell you what was cancelled and by whom. People go straight to
the application logs because the application logs exist. The supervisor knows
why it did not run the thing, and that is a different and usually more
specific answer.

The fix was to remove the ordering I did not need. I had assumed the service
needed the mount to be up because it reads a file from it, which is true, and
which is not a reason for an ordering dependency, because the dependency I
needed was "the service needs the file", not "the service needs the mount
daemon". The correct expression is a RequiresMountsFor on the path, which
does not order the mount unit against the service globally, and therefore
cannot deadlock with anything.

The lesson I took: ordering dependencies in systemd are global and blunt, and
almost every case that needs one is really a case of needing a path. A
RequiresMountsFor, an After on a network target, a BindsTo on a unit that
genuinely represents the resource. If you cannot say what the dependency is
for, it is probably decorative and it will eventually cost you a boot.

## References

- [systemd.unit(5)](https://man7.org/linux/man-pages/man5/systemd.unit.5.html) — `RequiresMountsFor=`, and the full set of ordering directives. The man page is still the best documentation systemd has.
- [systemd.unit(5) on freedesktop.org](https://www.freedesktop.org/software/systemd/man/systemd.unit.html) — the upstream source of the above. Rate limits aggressively, but it is canonical.
- [Control Group v2](https://www.kernel.org/doc/html/latest/admin-guide/cgroup-v2.html) — useful reading on the resource side of what systemd is trying to manage.
