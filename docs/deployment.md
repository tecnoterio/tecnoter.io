# Deployment

How the site gets published, and what to check when it does not.

## The model: a `gh-pages` branch

The site is published by pushing to a `gh-pages` branch, not by
`actions/deploy-pages`. That is deliberate: pull request previews need each PR
to live in its own subfolder, and GitHub Pages serves a single location, so the
two approaches cannot be combined.

| Event | What happens |
|-------|--------------|
| Push to `main` | Site publishes to the `gh-pages` root. Open previews are preserved. |
| PR opened / updated / reopened | Builds to `/<repo>/pr-<n>/` and publishes there. |
| PR closed | The `/pr-<n>/` subfolder is removed. |

A preview for pull request 42:

    https://tecnoterio.github.io/tecnoter.io/pr-42/

## Repository settings

**Pages → Source must be "Deploy from a branch", branch `gh-pages`, folder
`/ (root)`.**

This is the one manual step. With the source left on "GitHub Actions", the
deploy job goes green and the site never updates — a failure that looks like
success.

## Jobs

| Job | Runs on | Does |
|-----|---------|-----|
| `build` | every event | Installs Zola and Rust, builds WASM, builds the site, runs the parity gate, uploads an artifact. |
| `deploy-production` | push to `main` | Publishes the artifact to the `gh-pages` root, keeping `pr-*` subfolders. |
| `deploy-preview` | PR, not closed | Publishes the artifact to `/<repo>/pr-<n>/`. |
| `cleanup-preview` | PR closed | Removes the subfolder. |

Publishing uses `peaceiris/actions-gh-pages`. It was hand-rolled git first,
which failed twice in CI — once on `git config` running before `git init`, and
once on the push itself. The action handles token auth, orphan branches and
`keep_files`, none of which are worth reimplementing.

`build` is the gate. If it fails, nothing deploys. The most likely cause is the
parity check rejecting a content change — run `make accept-content` locally and
push the result.

## The base path

Previews only work because every path is expressed relative to a base:

- empty on the live site
- `/<repo>/pr-<n>/` for a pull request

It reaches the templates through `get_env(name="TECNOTER_BASE")`, and
`static/js/terminal.js` reads the same value from `window.SITE_BASE`. The
`url` fields inside `index.json` carry the prefix too, which is what lets the
Rust terminal's `cat` work unchanged — it derives its fetch URL from that JSON.

`check-parity.py` strips the prefix before comparing, so the gate verifies
content and formatting rather than deployment path.

**Adding a new absolute path?** Route it through `{{ base }}`. A literal
`href="/..."` will resolve to the site root and break in a preview.

## Reproducing a preview locally

```bash
make preview N=42
python3 -m http.server -d public 8000
# http://127.0.0.1:8000/tecnoter.io/pr-42/
```

Serve from the repository root, not from `public/` — the prefix includes the
repository name.

## What is not committed

`public/` and `static/js/wasm/` are generated and gitignored. The build
artifacts travel between jobs as workflow artifacts, never through the
repository.

`tests/golden/` *is* committed: it is the reference `check-parity.py` compares
against, not build output.

## Rolling back

Deployments are force-pushes to a branch, so history is not kept on `gh-pages`.
To restore a previous state, revert the commit and let `main` redeploy.
