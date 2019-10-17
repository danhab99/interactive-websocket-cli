const WebSocket = require('ws');
const Keyboard = require('./keyboard')

module.exports = (program, address) => {
  const ws = new WebSocket(address)
  
  if (program.pipeStdin) {
    // Pipe
    var duplex = WebSocket.createWebSocketStream(ws)
    process.stdin.pipe(duplex)
    duplex.pipe(process.stdout)
  }
  else {
    // Interactive
    ws.on('open', () => console.log('!!! Connected'))
    
    ws.on('message', msg => {
      // TODO: Make tabsize a setting
      process.stdout.write(`\r${Date.now()} >>> ${JSON.stringify(msg, null, 2)}\n`) // TODO: Pretty print
      keyboard.fix_prompt()
    })

    let keyboard = new Keyboard()

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