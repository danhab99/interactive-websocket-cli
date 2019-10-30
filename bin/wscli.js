#!/usr/bin/env node

const Server = require('./cli/server')
const Connect = require('./cli/connect')
const urlfix = require('../components/urlfix')

var {program, parse} = require('../components/program')()
program
  .command("listen <port>")
  .description("Listen for websocket connections on a port")
  .action(port => {
    program.mode = "listen"
    program.port = parseInt(port)
  });

program
  .command("connect <address>")
  .description("Connect to a websocket at an address")
  .action(address => {
    program.mode = "connect"
    program.address = urlfix(address)
  });

program = parse()

if (program.mode == undefined) {
  console.error("You need to select a mode (connect, listen)")
  program.help()
}

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
