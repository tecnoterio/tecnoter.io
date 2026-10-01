.PHONY: help build serve dev clean build-wasm accept-content preview

help:
	@echo "tecnoterio - Zola + Rust/WASM"
	@echo ""
	@echo "  make build          Full production build (WASM + Zola + index.json + parity)"
	@echo "  make serve          Zola dev server on :1111"
	@echo "  make dev            Zola server + WASM watch (live reload)"
	@echo "  make build-wasm     Compile Rust shell to WASM into static/js/wasm"
	@echo "  make preview N=42     Build like PR 42, for checking a preview locally"
	@echo "  make accept-content Accept current build as the parity baseline (after an intentional content edit)"
	@echo "  make clean          Remove build artifacts"

# Production build. WASM goes to static/ first so the Zola build copies it into
# public/ with everything else; zola build clears public/, so building straight
# into public/ would be undone on the next run.
build: build-wasm
	zola build
	@python3 scripts/zola/build-index-json.py .
	@python3 scripts/zola/check-parity.py .
	@echo "build complete: $$(du -sh public | cut -f1) in public/"

build-wasm:
	cd shell_wasm && wasm-pack build --target web --out-dir ../static/js/wasm

# `make build` fails when content changes, because the parity reference is a
# snapshot rather than a live comparison. Run this to accept the new baseline.
accept-content:
	@python3 scripts/zola/check-parity.py . --update

# Reproduce a pull request preview build. Serve the output from the repo root:
#   make preview N=42 && python3 -m http.server -d public 8000
# then open /tecnoter.io/pr-42/.
preview:
	@test -n "$(N)" || (echo "usage: make preview N=<pr number>" && exit 1)
	TECNOTER_BASE=/tecnoter.io/pr-$(N) $(MAKE) build

serve:
	@python3 scripts/zola/build-index-json.py . >/dev/null
	zola serve --port 1111

# Development: rebuild WASM on change; Zola reloads HTML on change.
dev:
	(trap 'kill 0' SIGINT; \
	 cargo watch -C shell_wasm -s "wasm-pack build --target web --out-dir ../static/js/wasm" & \
	 (zola serve --port 1111) & \
	 wait)

clean:
	rm -rf public
	cd shell_wasm && cargo clean
