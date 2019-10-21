#!/usr/bin/env node

const WebSocket = require('ws')
const EventEmitter = require('events')

var {program, parse} = require('../components/program')()
const Keyboard = require('../components/keyboard')

program.option('-r, --rebroadcast', "Rebroadcasts every client's message to every other client")
program = parse()

const kb = new Keyboard(program)

const hookup = ws => {
  const duplex = WebSocket.createWebSocketStream(ws, {encoding: 'binary'});

  program.in.pipe(duplex)
  duplex.pipe(program.out)

  ws.on('message', msg => {
    kb.flip(false)
    kb.printWS("" + msg)
  })

  program.in.on('data', msg => {
    kb.flip(true)
    kb.printWS("" + msg)
  })
}

if (program.mode == 'connect') {
  var ws = new WebSocket(program.address)
  hookup(ws)
}

if (program.mode == 'listen') {
  const wss = WebSocket.Server({port: program.port})
  const rebroadcast = new EventEmitter()

  wss.on('connect', ws => {
    hookup(ws)

    if (program.rebroadcast) {
      rebroadcast.on('message', msg => ws.send(msg))
      ws.on('message', msg => rebroadcast.emit('message', msg))
    }
  })
}