const readline = require('readline');
var EventEmitter = require('events').EventEmitter
readline.emitKeypressEvents(process.stdin);

process.stdin.on('keypress', (str, key) => {
  if (key.sequence === '\u0003') {
    process.exit();
  }
})

module.exports = class Keyboard extends EventEmitter {
  constructor(program) {
    super()
    this.prompting = false
    this.buffer = ""
    this.tab = program.tabSize
    this.outward = true
    this.ugly = program.ugly

    process.stdin.on('keypress', (str, key) => {
      if (!this.prompting) {
        this.emit(str)
      }
      else {
        if (key && key.sequence === '\r') {
          process.stderr.write('\n')
          return
        }
        else if (key.name === 'backspace') {
          if (this.buffer.length > 0) {
            this.buffer = this.buffer.slice(0, -1)
            process.stderr.write('\b \b')
          }
        }
        else {
          this.buffer += key.sequence
          process.stderr.write(str)
        }
      }
    })
  }

  fix_prompt() {
    if (this.prompting) {
      process.stderr.write(`\r${this.header} <<< ${this.buffer}`)
    }
  }

  printWS(dat, i=null) {
    try {
      dat = JSON.parse(dat)
    }
    catch (e) {
      
    }
    finally {
      let body = this.ugly ? JSON.stringify(dat) : JSON.stringify(dat, null, this.tab)
      let id = i != null ? `#${i} ` : ""
      let arrow = this.outward ? '<<<' : '>>>'
      let extraspace = typeof(dat) == 'object' && !this.ugly || typeof(dat) == 'array'? '\n' : ' '
      process.stderr.write(`\r${Date.now()} ${id}${arrow}${extraspace}${body}\n`)
    }
  }

  flip(dir=-1) {
    if (dir == -1) {
      this.outward = !this.outward
    }
    else {
      this.outward = dir
    }
  }

  prompt(header) {
    this.emit('prompting')
    this.prompting = true
    this.buffer = ""
    this.header = header
    process.stderr.write(header + (this.outward ? ' <<< ' : ' >>> '))
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