#!/usr/bin/env node

const WebSocket = require('ws')
const EventEmitter = require('events')

var {program, parse, help} = require('../components/program')()
const Keyboard = new (require('../components/keyboard'))(program)
const StreamBitRate = require('../components/stream_bitrate')
const wsid = require('../components/wsid')

function collect(value, previous) {
  return previous.concat([value]);
}

program.option('--connect-incoming <port or address>', "Open a port to allow one client to connect", collect, [])
program.option('--connect-outgoing <port or address>', "Connect to server ", collect, [])

program = parse()

if (program.connectIncoming.length > 1 && program.connectOutgoing.length > 1) {
  console.error('Requires atleast 1 --connect-incoming and 1 --connect-outgoing')
  help()
}

var SBR = new StreamBitRate()

if (program.pipeStdin) {
  SBR.on('bitrate', br => {
    process.stdout.write(`\r${br}                `)
  })
}

const link = arr => {
  var emit = new EventEmitter()

  const hookup = ws => {
    var s = WebSocket.createWebSocketStream(ws, { encoding: 'binary' })
    s.on('data', c => SBR.emit('in', c))
    ws.on('message', msg => {
      emit.emit('message', msg, ws.id)
    })
    emit.on('send', msg => {
      ws.send(msg)
    })
  }

  for (let index = 0; index < arr.length; index++) {
    const element = arr[index];
    if (/\w+:(\/?\/?)[^\s]+/.exec(element)) {
      var ws = new WebSocket(urlfix(element), program.clientConfig)
      hookup(ws)
    }
    if (/\d+/.exec(element)) {
      var port = parseInt(element)
      var wss = new WebSocket.Server(Object.assign({ port }, program.serverConfig))
      console.log(`Listening on port ${port}`)
      wss.on('connection', (ws, req) => {
        ws.id = wsid(req)
        console.log(`${ws.id} => Port ${port}`)
        hookup(ws)
      })
    }
  }
  return emit
}

var incoming = link(program.connectIncoming)
var outgoing = link(program.connectOutgoing)

if (!program.pipe) {
  incoming.on("message", (msg, id) => {
    Keyboard.flip(true);
    Keyboard.printWS(msg, id);
  });

  outgoing.on("message", (msg, id) => {
    Keyboard.flip(false);
    Keyboard.printWS(msg, id);
  });
}

incoming.on('message', msg => outgoing.emit('send', msg))
outgoing.on('message', msg => incoming.emit('send', msg))
