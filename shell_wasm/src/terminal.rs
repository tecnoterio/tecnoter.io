pub struct TerminalState {
    pub width: u32,
    pub height: u32,
    pub cursor_pos: (u32, u32),
}

impl TerminalState {
    pub fn _new() -> Self {
        Self {
            width: 80,
            height: 24,
            cursor_pos: (0, 0),
        }
    }

    pub fn _resize(&mut self, w: u32, h: u32) {
        self.width = w;
        self.height = h;
    }
}
