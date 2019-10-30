const WebSocket = require('ws');
const Keyboard = require('../../components/keyboard')

module.exports = (program) => {
  const ws = new WebSocket(program.address, program.clientConfig)
  ws.on('close', () => process.exit(1))
  
  ws.on('open', () => {
    if (program.pipe) {
      // Pipe
      var duplex = WebSocket.createWebSocketStream(ws)
      program.in.pipe(duplex)
      duplex.pipe(program.out)
    }
    else {
      // Interactive
      console.log('!!! Connected')
      var keyboard = new Keyboard(program);
      
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
  })
}