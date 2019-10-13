const readline = require('readline');
var EventEmitter = require('events').EventEmitter
readline.emitKeypressEvents(process.stdin);

process.stdin.on('keypress', (str, key) => {
  if (key.sequence === '\u0003') {
    process.exit();
  }
})

module.exports = class Keyboard extends EventEmitter {
  constructor() {
    super()
    this.prompting = false
    this.buffer = ""

    process.stdin.on('keypress', (str, key) => {
      if (!this.prompting) {
        this.emit(str)
      }
      else {
        if (key && key.sequence === '\r') {
          process.stdout.write('\n')
          return
        }
        else if (key.name === 'backspace') {
          if (this.buffer.length > 0) {
            this.buffer = this.buffer.slice(0, -1)
            process.stdout.write('\b \b')
          }
        }
        else {
          this.buffer += key.sequence
          process.stdout.write(str)
        }
      }
    })
  }

  prompt(header) {
    this.emit('prompting')
    this.prompting = true
    this.buffer = ""
    process.stdout.write(header + ' <<< ')
    return new Promise((resolve, reject) => {
      process.stdin.on('keypress', (str, key) => {
        if (key && key.sequence === '\r') {
          resolve(this.buffer)
          this.prompting = false
          this.emit('done-prompting')
        }
      })
    })
  }
}