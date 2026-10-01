{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = with pkgs; [
    rustc
    cargo
    wasm-bindgen
    nodejs
    jq
  ];

  # Optional: expose cargo aliases for convenience
  shellHook = ''
    export CARGO_TARGET_DIR=${pkgs.lib.makeLibraryPath [pkgs.rustc]}/../target
  '';
}