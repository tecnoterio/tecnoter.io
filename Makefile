.PHONY: help build-wasm serve clean install-arch install-debian dev

# Default goal: list all options
help:
	@echo "Tecnoter Shell & Terminal - Makefile"
	@echo ""
	@echo "Usage:"
	@echo "  make dev             Run Hugo server and Rust watcher (automatic Wasm rebuilds)"
	@echo "  make serve           Run Hugo daemon with debug logging"
	@echo "  make build-wasm      Compile Rust Shell/Terminal logic to Wasm"
	@echo "  make install-arch    Install dependencies for Arch Linux"
	@echo "  make install-debian  Install dependencies for Debian/Ubuntu"
	@echo "  make clean           Clean build artifacts"
	@echo "  make help            Show this help message"

dev:
	@echo "Starting dev environment... (Ctrl+C to stop both)"
	(trap 'kill 0' SIGINT; \
	 cargo watch -C shell_wasm -s "wasm-pack build --target web --out-dir ../themes/tecnoter.io/static/js/wasm" & \
	 hugo server -D --disableFastRender --printI18nWarnings --logLevel debug & \
	 HUGO_PID=$$!; \
	 sleep 3; \
	 xdg-open http://localhost:1313 2>/dev/null || open http://localhost:1313 2>/dev/null || true; \
	 wait $$HUGO_PID)

serve: build-wasm
	hugo server -D --disableFastRender --printI18nWarnings --logLevel debug

build-wasm:
	cd shell_wasm && wasm-pack build --target web --out-dir ../themes/tecnoter.io/static/js/wasm

install-arch:
	sudo pacman -S --needed hugo wasm-pack wasm-bindgen binaryen rustup cargo-watch base-devel
	rustup default stable
	rustup target add wasm32-unknown-unknown

install-debian:
	sudo apt-get update
	sudo apt-get install -y hugo build-essential curl pkg-config libssl-dev binaryen
	if ! command -v rustup >/dev/null; then \
		curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y; \
		source $(HOME)/.cargo/env; \
	fi
	if ! command -v wasm-pack >/dev/null; then \
		curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh; \
	fi
	cargo install cargo-watch
	rustup default stable
	rustup target add wasm32-unknown-unknown

clean:
	rm -rf themes/tecnoter.io/static/js/wasm
	cd shell_wasm && cargo clean
