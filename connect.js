const WebSocket = require('ws');
const Keyboard = require('./keyboard')

module.exports = (program, address) => {
  const ws = new WebSocket(address)
  ws.on('close', () => process.exit(1))
  
  if (program.pipeStdin) {
    // Pipe
    var duplex = WebSocket.createWebSocketStream(ws)
    process.stdin.pipe(duplex)
    duplex.pipe(process.stdout)
  }
  else {
    // Interactive
    ws.on('open', () => console.log('!!! Connected'))
    let keyboard = new Keyboard(program.tabSize)
    
    ws.on('message', msg => {
      keyboard.printWS(msg)
      keyboard.fix_prompt()
    })

    keyboard.on('s', () => {
      keyboard.prompt('send').then(raw => {
        try {
          ws.send(raw)
        }
        catch (e) {
          console.error(e)
        }
      })
    })

    keyboard.on('h', () => {
      console.log(`
      [s] send a message to server
      `)
    })
  }
}