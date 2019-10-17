#!/usr/bin/env node

const program = require('commander');
const WebSocket = require('ws');
const Keyboard = require('./keyboard')
const Server = require('./server')
const Connect = require('./connect')

program.version(require('./package.json').version)
var mode;

program
  .option('-p, --pipe-stdin', 'Pipe stdin to server and server to stdout')

program.command('listen <port>')
  .description('Listen for websocket connections on a port')
  .action(port => {
    mode = {
      mode: 0,
      port: port
    }
  })
  
program.command('connect <address>')
  .description('Connect to a websocket at an address')
  .action( address => {
    mode = {
      mode: 1,
      address: address
    }
  })

program.parse(process.argv)
debugger
if (process.stdin.setRawMode){
  process.stdin.setRawMode(true);
}

process.stdin.resume();

if (mode.mode == 0) {
  Server(program, mode.port)
}

if (mode.mode == 1) {
  Connect(program, mode.address)
}
