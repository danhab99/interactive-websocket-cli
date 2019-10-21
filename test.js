var assert = require('assert');
const { spawn } = require('child_process');

describe('wscli', function() {
  it('can transmit a message', function(done) {
    var wscli = spawn('node', ['./bin/wscli.js', '-p', 'connect', 'ws://echo.websocket.org'])
    var data = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

    wscli.on('error', e => {
      assert.throws(e)
    })

    wscli.stdout.once('data', blok => {
      assert.equal(blok, data)
      wscli.kill()
      done()
    })
    
    wscli.stdin.write(data)
  })
})