// Readline lets us tap into the process events
const readline = require('readline');

// Allows us to listen for events from stdin
readline.emitKeypressEvents(process.stdin);

// Raw mode gets rid of standard keypress events and other
// functionality Node.js adds by default
process.stdin.setRawMode(true);
var buffer = ""

process.stdin.on('keypress', (str, key) => {
  if (key.sequence === '\u0003') {
    process.exit();
  }
})


var read = new Promise(resolve => {
  process.stdin.on('keypress', (str, key) => {
    if (key.sequence === '\r') {
      resolve(buffer)
    } 
  });
})

read.then(d => console.log(`>>> ${d}`))