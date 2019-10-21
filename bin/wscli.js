#!/usr/bin/env node

const Server = require('./cli/server')
const Connect = require('./cli/connect')


var {program, parse} = require('../components/program')()
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
