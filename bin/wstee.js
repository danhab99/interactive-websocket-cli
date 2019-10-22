#!/usr/bin/env node

const WebSocket = require('ws')
const EventEmitter = require('events')

var {program, parse, help} = require('../components/program')()
const Keyboard = new (require('../components/keyboard'))(program)

function collect(value, previous) {
  return previous.concat([value]);
}

program.option('-r, --rebroadcast', "Rebroadcasts every client's message to every other client")
program.option('--connect-incoming <port or address>', "Open a port to allow one client to connect", collect, [])
program.option('--connect-outgoing <port or address>', "Connect to server ", collect, [])

program = parse()

if (program.connectIncoming.length > 1 && program.connectOutgoing.length > 1) {
  console.error('Requires atleast 1 --connect-incoming and 1 --connect-outgoing')
  help()
}

const link = arr => {
  var emit = new EventEmitter()

  const hookup = ws => {
    ws.on('message', msg => {
      emit.emit('message', msg)
    })
    emit.on('send', msg => {
      ws.send(msg)
    })
  }

  for (let index = 0; index < arr.length; index++) {
    const element = arr[index];
    if (/\w+:(\/?\/?)[^\s]+/.exec(element)) {
      var ws = new WebSocket(element)
      hookup(ws)
    }
    if (/\d+/.exec(element)) {
      var port = parseInt(element)
      var wss = new WebSocket.Server({port: port})
      console.log(`Listening on port ${port}`)
      wss.on('connection', ws => {
        console.log(`Port ${port} received a connection`)
        hookup(ws)
      })
    }
  }
  return emit
}

var incoming = link(program.connectIncoming)
var outgoing = link(program.connectOutgoing)

incoming.on('message', msg => {
  Keyboard.flip(true)
  Keyboard.printWS(msg)
})

outgoing.on('message', msg => {
  Keyboard.flip(false)
  Keyboard.printWS(msg)
})

incoming.on('message', msg => outgoing.emit('send', msg))
outgoing.on('message', msg => incoming.emit('send', msg))
