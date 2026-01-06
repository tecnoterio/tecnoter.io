use crate::state::SystemState;

pub fn handle(_state: &SystemState) -> String {
    let mut out = String::new();
    out.push_str("NAME     LINE         TIME             COMMENT\n");
    out.push_str("guest    tty1         2026-01-04 10:00 (127.0.0.1)\n");
    out.push_str("admin    pts/0        2026-01-04 09:42 (remote.uplink)\n");
    out
}
