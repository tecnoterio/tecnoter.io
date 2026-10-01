.PHONY: help build serve dev clean build-wasm build-index snapshot-golden

help:
	@echo "tecnoterio - Zola + Rust/WASM"
	@echo ""
	@echo "  make dev            Zola server + WASM watch (live reload)"
	@echo "  make serve          Zola server on :1111 (pre-built WASM)"
	@echo "  make build          Full production build (WASM + Zola + index.json + parity)"
	@echo "  make build-wasm     Compile Rust shell to WASM into zola_spike/static/js/wasm"
	@echo "  make build-index    Regenerate public/index.json"
	@echo "  make accept-content Accept current build as the parity baseline"
	@echo "  make snapshot-golden Re-record the baseline from Hugo (pre-migration only)"
	@echo "  make clean          Remove build artifacts"

# Production build: WASM first so Zola copies it into public/ via static/.
build: build-wasm
	cd zola_spike && zola build
	@python3 zola_spike/scripts/build-index-json.py zola_spike
	@python3 zola_spike/scripts/check-parity.py zola_spike
	@echo "build complete: $$(du -sh zola_spike/public | cut -f1) in zola_spike/public/"

build-wasm:
	cd shell_wasm && wasm-pack build --target web --out-dir ../zola_spike/static/js/wasm

build-index:
	@python3 zola_spike/scripts/build-index-json.py zola_spike

# Accept the current build output as the new parity baseline. Run after an
# intentional content edit, otherwise `make build` will fail.
accept-content:
	@python3 zola_spike/scripts/check-parity.py zola_spike --update

# Re-record the parity reference from a Hugo build. Only valid while Hugo is
# still installed; delete this target once the migration is final.
snapshot-golden:
	rm -rf public
	hugo --quiet
	@python3 zola_spike/scripts/snapshot-golden.py .

serve:
	@python3 zola_spike/scripts/build-index-json.py zola_spike >/dev/null
	cd zola_spike && zola serve --port 1111

# Development: rebuild WASM on change, Zola server reloads HTML on change.
dev:
	(trap 'kill 0' SIGINT; \
	 cargo watch -C shell_wasm -s "wasm-pack build --target web --out-dir ../zola_spike/static/js/wasm" & \
	 (cd zola_spike && zola serve --port 1111) & \
	 wait)

clean:
	rm -rf zola_spike/public
	cd shell_wasm && cargo clean
