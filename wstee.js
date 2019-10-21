#!/usr/bin/env node

const WebSocket = require('ws')
const EventEmitter = require('events')

const {program, parse} = require('./program')()
const Keyboard = require('./keyboard')

program.option('-r, --rebroadcast', "Rebroadcasts every client's message to every other client")
const mode = parse()
const kb = new Keyboard(program.tabSize)

const hookup = ws => {
  const duplex = WebSocket.createWebSocketStream(ws, {encoding: 'binary'});

  process.stdin.pipe(duplex)
  process.stderr.pipe(duplex)
  duplex.pipe(process.stdout)

  ws.on('message', msg => {
    kb.flip(false)
    kb.printWS("" + msg)
  })

  process.stdin.on('data', msg => {
    kb.flip(true)
    kb.printWS("" + msg)
  })
}

if (mode.mode == 'connect') {
  var ws = new WebSocket(mode.address)
  hookup(ws)
}

if (mode.mode == 'listen') {
  const wss = WebSocket.Server({port: mode.port})
  const rebroadcast = new EventEmitter()

  wss.on('connect', ws => {
    hookup(ws)

    if (program.rebroadcast) {
      rebroadcast.on('message', msg => ws.send(msg))
      ws.on('message', msg => rebroadcast.emit('message', msg))
    }
  })
}