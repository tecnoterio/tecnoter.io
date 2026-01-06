use crate::state::SystemState;

pub fn handle(_state: &SystemState) -> String {
    let mut out = String::new();
    out.push_str("Tasks: 42 total,   1 running,  41 sleeping,   0 stopped,   0 zombie\n");
    out.push_str("%Cpu(s):  4.2 us,  1.0 sy,  0.0 ni, 94.8 id,  0.0 wa,  0.0 hi,  0.0 si,  0.0 st\n");
    out.push_str("MiB Mem :  128.0 total,   42.1 free,   64.2 used,   21.7 buff/cache\n\n");
    out.push_str("  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND\n");
    out.push_str("    1 root      20   0    4242    128     64 S   0.0   0.1   0:01.42 systemd\n");
    out.push_str("   42 tecnoter  20   0   12842   4242   2048 R   4.2   3.3   0:42.12 wasm-shell\n");
    out.push_str("   88 guest     20   0    2048    512    256 S   0.0   0.4   0:00.12 cat\n");
    out
}
