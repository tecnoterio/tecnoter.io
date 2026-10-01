use serde_json::Value;
use std::{env, io::{self, Read}, process::Command};

fn main() {
    // Read JSON from stdin
    let mut buf = String::new();
    io::stdin().read_to_string(&mut buf).unwrap();
    let v: Value = serde_json::from_str(&buf).unwrap();

    // Forward to the existing binary (adjust as needed)
    let out = Command::new("cargo")
        .args(&[
            "run",
            "--bin",
            "tecnoter-shell",
            "--",
            &v["method"].as_str().unwrap(),
            &v["args"].to_string().replace('\"', ""),
        ])
        .output()
        .expect("failed to run");
    println!("{}", String::from_utf8(out.stdout).unwrap());
}