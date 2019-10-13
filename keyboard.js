var keypress = require('keypress');
var EventEmitter = require('events').EventEmitter
keypress(process.stdin);

module.exports = class Keyboard extends EventEmitter {
  constructor() {
    super()
    this.prompting = false

    process.stdin.on('keypress', (ch, key) => {
      if (!this.prompting) {
        this.emit(ch)
      }
    })
  }

  prompt(header) {
    this.emit('prompting')
    this.prompting = true
    process.stdout.write(header + ' <<< ')
    return new Promise((resolve, reject) => {
      var buffer = ""
      var listn = process.stdin.on('keypress', (ch, key) => {
        if (key) {
          if (key.ctrl && key.name == 'd') {
            process.stdout.write('\r')
            this.emit('done-prompting')
            reject()
            return
          }
        
          if (key.name == 'return') {
            process.stdout.write('\n')
            this.emit('done-prompting')
            process.stdin.resume()
            listn.end()
            resolve(buffer)
            return
          }
        
          if (key.name == 'backspace') {
            if (buffer.length > 0) {
              buffer = buffer.slice(0, -1)
              process.stdout.write('\b \b')
            }
            return
          }
        }
        
        buffer += ch
        process.stdout.write(ch)
      })
    })
  }
}