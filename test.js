var assert = require('assert');
const { spawn } = require('child_process');
const fs = require('fs')

describe('wscli', function() {
  describe('connect', function() {
    var data = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

    it('can transmit a message', function(done) {
      var wscli = spawn('node', ['./bin/wscli.js', '-p', 'connect', 'ws://echo.websocket.org'])
  
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
  
    it('can transmit the content of a file', function(done) {
      fs.writeFile('./.seed', data, err => {
        if (err) {
          assert.throws(err)
          return
        }
  
        var wscli = spawn('node', ['./bin/wscli.js', '-p', '--in', './.seed', 'connect', 'ws://echo.websocket.org'])
  
        wscli.stdout.once('data', blok => {
          assert.equal(blok, data)
          wscli.kill()
          done()
        })
      })
    })
  }) 

  describe('listen', function() {
    var port = Math.floor(Math.random() * ((2 ** 16) - 3000) + 3000)

    it('can open port', function(done) {
      var wscli = spawn('node', ['./bin/wscli.js', 'listen', port])
      setTimeout(() => {
        assert.ok(true)
        wscli.kill()
        done()
      }, 1000)
      wscli.on('error', () => assert.fail())
    }
  })
})