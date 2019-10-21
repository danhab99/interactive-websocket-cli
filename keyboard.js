const readline = require('readline');
var EventEmitter = require('events').EventEmitter
readline.emitKeypressEvents(process.stdin);

process.stdin.on('keypress', (str, key) => {
  if (key.sequence === '\u0003') {
    process.exit();
  }
})

module.exports = class Keyboard extends EventEmitter {
  constructor(tabsize) {
    super()
    this.prompting = false
    this.buffer = ""
    this.tab = tabsize

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

  fix_prompt() {
    if (this.prompting) {
      process.stdout.write(`\r${this.header} <<< ${this.buffer}`)
    }
  }

  printWS(dat, id=undefined) {
    try {
      dat = JSON.parse(dat)
    }
    catch (e) {
      
    }
    finally {
      process.stdout.write(`\r${Date.now()} ${id != undefined ? `#{id} ` : ""}>>>${typeof(dat) == 'object' || typeof(dat) == 'array'? '\n' : ' '}${JSON.stringify(dat, null, this.tab)}\n`)
    }
  }

  prompt(header) {
    this.emit('prompting')
    this.prompting = true
    this.buffer = ""
    this.header = header
    process.stdout.write(header + ' <<< ')
    return new Promise((resolve, reject) => {
      let listen = (str, key) => {
        if (key && key.sequence === '\r') {
          process.stdin.removeListener('keypress', listen)
          resolve(this.buffer)
          this.prompting = false
          this.emit('done-prompting')
        }
      }
      process.stdin.on('keypress', listen)
    })
  }
}