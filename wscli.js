#!/usr/bin/env node

const Server = require('./server')
const Connect = require('./connect')

const {parse} = require('./program')()
const mode = parse()

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
