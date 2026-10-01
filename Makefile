.PHONY: help build serve dev clean build-wasm accept-content

help:
	@echo "tecnoterio - Zola + Rust/WASM"
	@echo ""
	@echo "  make build          Full production build (WASM + Zola + index.json + parity)"
	@echo "  make serve          Zola dev server on :1111"
	@echo "  make dev            Zola server + WASM watch (live reload)"
	@echo "  make build-wasm     Compile Rust shell to WASM into zola_spike/static/js/wasm"
	@echo "  make accept-content Accept current build as the parity baseline (after an intentional content edit)"
	@echo "  make clean          Remove build artifacts"

# Production build. WASM goes to static/ first so the Zola build copies it into
# public/ with everything else; zola build clears public/, so building straight
# into public/ would be undone on the next run.
build: build-wasm
	cd zola_spike && zola build
	@python3 zola_spike/scripts/build-index-json.py zola_spike
	@python3 zola_spike/scripts/check-parity.py zola_spike
	@echo "build complete: $$(du -sh zola_spike/public | cut -f1) in zola_spike/public/"

build-wasm:
	cd shell_wasm && wasm-pack build --target web --out-dir ../zola_spike/static/js/wasm

# `make build` fails when content changes, because the parity reference is a
# snapshot rather than a live comparison. Run this to accept the new baseline.
accept-content:
	@python3 zola_spike/scripts/check-parity.py zola_spike --update

serve:
	@python3 zola_spike/scripts/build-index-json.py zola_spike >/dev/null
	cd zola_spike && zola serve --port 1111

# Development: rebuild WASM on change; Zola reloads HTML on change.
dev:
	(trap 'kill 0' SIGINT; \
	 cargo watch -C shell_wasm -s "wasm-pack build --target web --out-dir ../zola_spike/static/js/wasm" & \
	 (cd zola_spike && zola serve --port 1111) & \
	 wait)

clean:
	rm -rf zola_spike/public
	cd shell_wasm && cargo clean
