+++
title = "Posts"
sort_by = "weight"
+++

Posts are ordered by `weight`, which is derived from the publication date so
that the newest has the lowest weight and therefore sorts first. This Zola
version has no `sort_reverse` and no `-date` prefix for `sort_by`, and a
`weight` is also reviewable in a diff, which a derived ordering is not.

See `scripts/zola/set-post-weights.py` to regenerate after adding a post.
