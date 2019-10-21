#!/usr/bin/env node

const Server = require('./server')
const Connect = require('./connect')

var {program, parse} = require('./program')()
program = parse()

if (process.stdin.setRawMode){
  process.stdin.setRawMode(true);
}

process.stdin.resume();

if (mode.mode == 'listen') {
  Server(program)
}

if (mode.mode == 'connect') {
  Connect(program)
}
