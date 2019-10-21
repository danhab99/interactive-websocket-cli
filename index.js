#!/usr/bin/env node

const program = require('commander');
const Server = require('./server')
const Connect = require('./connect')

program.version(require('./package.json').version)
var mode;

program
  .option('-p, --pipe-stdin', 'Pipe stdin to server and server to stdout')
  .option('-t, --tab-size <t>', 'Set the tab size', 2)

program.command('listen <port>')
  .description('Listen for websocket connections on a port')
  .action(port => {
    mode = {
      mode: 'listen',
      port: port
    }
  })
  
program.command('connect <address>')
  .description('Connect to a websocket at an address')
  .action(address => {
    mode = {
      mode: 'connect',
      address: address
    }
  })

program.parse(process.argv)

if (mode === undefined || typeof(program.tabSize = parseInt(program.tabSize)) != "number") {
  program.help()
  process.exit(1)
}

if (process.stdin.setRawMode){
  process.stdin.setRawMode(true);
}

process.stdin.resume();

if (mode.mode == 'listen') {
  Server(program, mode.port)
}

if (mode.mode == 'connect') {
  Connect(program, mode.address)
}
