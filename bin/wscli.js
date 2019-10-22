#!/usr/bin/env node

const Server = require('./cli/server')
const Connect = require('./cli/connect')


var {program, parse} = require('../components/program')()
program
  .command("listen <port>")
  .description("Listen for websocket connections on a port")
  .action(port => {
    program.mode = "listen"
    program.port = port
  });

program
  .command("connect <address>")
  .description("Connect to a websocket at an address")
  .action(address => {
    program.mode = "connect"
    program.address = address
  });

program = parse()

if (process.stdin.setRawMode){
  process.stdin.setRawMode(true);
}

process.stdin.resume();

if (program.mode == 'listen') {
  Server(program)
}

if (program.mode == 'connect') {
  Connect(program)
}
