import { print } from './ui.js';

const ANSI_SOURCES = [
  "https://raw.githubusercontent.com/lwlsn/ascii-art/master/ansi-art/a-team.ans",
  "https://raw.githubusercontent.com/tehmaze/ansimple/master/examples/logo.ans",
  "https://raw.githubusercontent.com/atdt/ansilove/master/examples/example.ans",
  "https://raw.githubusercontent.com/mnsantos/asciiart/master/test.ans",
  "https://raw.githubusercontent.com/JohnW-CS/ANSI-Art/master/ANSI/JW-LOGO.ANS",
  "https://raw.githubusercontent.com/textfiles/artwork/master/ansi/UNIX.ANS"
];

export function ansi() {
  const url = ANSI_SOURCES[Math.floor(Math.random() * ANSI_SOURCES.length)];
  print(`Fetching ANSI art from: ${url}...`, "bbs-title");
  
  fetch(url)
    .then(r => r.text())
    .then(text => {
      const formatted = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\x1b\[[0-9;]*m/g, ""); 
      
      print(`<pre class="ansi-art-container">${formatted}</pre>`);
    })
    .catch(err => {
      print(`Error fetching ANSI art: ${err.message}`, "bbs-footer");
    });
}
