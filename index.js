const program = require('commander');
const WebSocket = require('ws');
var keypress = require('keypress');

keypress(process.stdin);

program.version(require('./package.json').version)
program.command('listen <port>')
  .description('Listen for websocket connections on a port')
  .action(port => {
    const wss = new WebSocket.Server({ port: port })
    var counter = 0
 
    wss.on('connection', function connection(ws) {
      ws.number = counter++
      ws.on('message', function incoming(data) {
        
      });
    });
  })
program.command('connect <address>')
  .description('Connect to a websocket at an address')
  .action(address => {
    const ws = new WebSocket(address)
    var outOn = true
    var buffer = ""
    ws.on('open', () => console.log('!!! Connected'))
    
    ws.on('message', msg => {
      // TODO: Make tabsize a setting
      if (outOn) {
        console.log(`${Date.now()} >>> ${JSON.stringify(msg, null, 4)}`)
      }
    })

    process.stdin.on('keypress', (ch, key) => {
      if (key) {
        if (key.ctrl && key.name == 'c') {
          ws.close()
          process.stdin.pause();
          process.exit(0)
          return
        }
        
        if (outOn && key.name == 'r') {
          process.stdin.pause()
          outOn = false;
          process.stdout.write('<<< ')
  
          process.stdin.resume()
          return
        }

        if (!outOn) {
          if (key.ctrl && key.name == 'd') {
            process.stdout.write('\r')
            outOn = true;
            return
          }
  
          // TODO: Factor out the boolean expressions
          if (key.name == 'return') {
            process.stdout.write('\n')
            outOn = true; // TODO: Make auto-outon a setting
            ws.send(JSON.stringify(buffer))
            buffer = ""
            keypress(process.stdin)
            return
          }
  
          if (key.name == 'backspace') {
            buffer = buffer.slice(0, -1)
            process.stdout.write('\b \b')
            return
          }
        }
        buffer += ch
        process.stdout.write(ch)
      }
    })
  })

program.parse(process.argv)

if (process.stdin.setRawMode){
  process.stdin.setRawMode(true);
}
process.stdin.resume();