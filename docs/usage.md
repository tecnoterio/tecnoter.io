# User Guide & Compatibility

This document explains how to access tecnoter.io across different devices and what to do if your system does not support the high-tech terminal.

## System Requirements

To experience the **Active Terminal Mode**, you need:
- **A Modern Browser**: Chrome 70+, Firefox 65+, Safari 12+, or Edge 79+.
- **WebAssembly (WASM) Support**: Enabled by default in all modern browsers.
- **JavaScript Enabled**: Required for the emulator and interaction.
- **Minimum Screen Width**: 600px (Optimized for Desktop).

---

## Fallback Mode: The Low-Tech Hub

If your device does not meet the requirements above (e.g., you are on an older phone, a corporate machine with strict JS blocking, or a low-resolution screen), the system automatically switches to **Low-Tech Hub Mode**.

### Why am I seeing the Hub?
The Hub is a "Progressive Enhancement" fallback. You will see it if:
1.  **Mobile Device**: The system detects a touch-screen or small width and hides the complex CRT visuals to save battery and data.
2.  **No WASM**: If your browser is outdated and cannot run the Rust Kernel.
3.  **No JS**: Critical content is still pre-rendered by Hugo so search engines and text-browsers can read it.

### Hub Features
- **Clean Interface**: Simple, high-contrast text optimized for reading.
- **Full Content Access**: Every post and page available in the terminal is also here.
- **Fast Navigation**: Standard links instead of command-line inputs.

---

## Technical Support / Troubleshooting

| Issue | Solution |
|:---|:---|
| **Terminal is Stuck on "READY"** | Click anywhere on the screen. Browsers require a user gesture to enable audio and WASM networking. |
| **Fonts look wrong** | Ensure you have an active internet connection to load the 'VT323' font from Google Fonts. |
| **Site is slow** | The terminal uses CRT shader effects. If your GPU is struggling, click the **MODE** knob to switch to the Hub. |

**Tecnoter internal users**: If you are accessing this from a restricted environment and cannot see the terminal, the Hub provides the exact same information in a standard format.
