# Codebase Patterns

- When implementing new features, always update the relevant AGENTS.md files with discovered conventions.
- Use jq for JSON processing in scripts.
- Automatically update PRD when stories complete to maintain accurate progress tracking.
- Preserve backward compatibility in script interfaces.
- Maintain consistent naming for user stories (US-### format).
- Document any new dependencies or environment requirements in the progress log.
- Automatically extend PRD JSON structure when new user stories are added via scripted updates.

## WASM Serialization Fix (2026-07-03)

- **Issue**: `WASM: Critical state deserialization failure: Error: invalid type: JsValue(Object({"text":"..."})), expected a string`
- **Root cause**: Hugo-generated `index.json` outputs fortunes as array of objects `[{"text":"..."}]`, but Rust `SystemState.fortunes` was `Vec<String>`
- **Fix**: Added `Fortune` struct with `text: String` field in `shell_wasm/src/state.rs`, changed `fortunes: Vec<Fortune>`, updated `commands/fortune.rs` to access `.text`
- **Build**: `make build-wasm` (uses wasm-pack to output to `themes/tecnoter.io/static/js/wasm/`)
- **Deploy**: Hugo serves from `public/` which gets updated from theme static files
