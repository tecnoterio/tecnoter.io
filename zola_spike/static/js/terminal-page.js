// Standalone terminal page: mirrors the Hugo layouts/terminal.html behaviour
// but as a module so the WASM dispatcher and print() shim initialise in order.

import { state, initWasm, processWithWasm } from '/js/system.js';

const output = document.getElementById('terminal-output');
const input = document.getElementById('cmd-input');

function write(text, lineType) {
  if (!output) return;
  output.textContent += text + (lineType ? '\n' : '');
  output.scrollTop = output.scrollHeight;
}

// system.js writes through window.terminalUI.print, not window.print, so the
// shim has to be installed there. Keep both so either path lands in the <pre>.
function write(text, lineType) {
  if (!output) return;
  output.textContent += text + (lineType ? '\n' : '');
  output.scrollTop = output.scrollHeight;
}

window.print = write;
window.terminalUI = {
  print: write,
  updatePrompt() {},
  updateUplinkStatus() {},
  get output() { return output; },
  get input() { return input; },
};

window.runCommand = async function (cmd) {
  if (output) output.textContent = '';
  if (!processWithWasm(cmd)) {
    write(`${cmd}: no handler`);
  }
};

async function init() {
  try {
    await initWasm();
  } catch (error) {
    write('WASM CORE OFFLINE');
    console.error('initWasm failed', error);
  }

  if (input) {
    input.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter') return;
      const cmd = input.value.trim();
      input.value = '';
      write(`${cmd}\n`, true);
      if (cmd) window.runCommand(cmd);
    });
    input.focus();
  }
}

init();
