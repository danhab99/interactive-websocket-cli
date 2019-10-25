var assert = require('assert');
const { spawn } = require('child_process');
const fs = require('fs')

function connectTo (host, ...flags) {
  var wscli = spawn('node', ['./bin/wscli.js', '-p', ...flags, 'connect', host])
  wscli.on('error', c => {
    assert.throws(c)
  })
  wscli.stderr.pipe(process.stderr)
  return wscli
}

function listenTo(port, ...flags) {
  var wscli = spawn('node', ['./bin/wscli.js', '-p', ...flags, 'listen', port])
  wscli.on('error', c => {
    assert.throws(c)
  })
  wscli.stderr.pipe(process.stderr)
  return wscli
}

function randData(reps=10) {
  var data = ''
  for (let i = 0; i < reps; i++) {
    data += Math.random().toString(36).substring(2, 15)   
  }
  return data
}

var porthist = []
var getport = () => {
  let p = Math.floor(Math.random() * ((2 ** 16) - 3000) + 3000)
  if (p in porthist) {
    return getport()
  }
  else {
    porthist.push(p)
    return p
  }
}

describe('wscli', function() {
  var data = randData()

  describe('connect', function() {
    it('can transmit a message', function(done) {
      var wscli = connectTo('ws://echo.websocket.org')
  
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
  
        var wscli = connectTo('ws://echo.websocket.org', '--in', './.seed')
  
        wscli.stdout.once('data', blok => {
          assert.equal(blok, data)
          wscli.kill()
          done()
        })
      })
    })
  }) 

  describe('listen', function() {
    
    it('can open port', function(done) {
      var wscli = spawn('node', ['./bin/wscli.js', 'listen', getport()])
      wscli.stdout.on('data', blok => {
        blok = "" + blok
        if (blok == '!!! Listening\n') {
          assert.equal(blok, '!!! Listening\n')
          wscli.kill()
          done()
        }
      })
    })

    it('can receive a single message', function(done) {
      var port = getport()
      var server = listenTo(port)
      var transmit = connectTo(port)

      server.stdout.once('data', blok => {
        assert.equal(blok, data)
        server.kill()
        transmit.kill()
        done()
      })

      transmit.stdin.write(data)
    })

    it('can transmit a single message', function(done) {
      var port = getport()
      var server = listenTo(port)
      var transmit = connectTo(port)
          
      transmit.stdout.on('data', blok => {
        blok += ''
        assert.equal(blok, data)
        server.kill()
        transmit.kill()
        done()
      })

      setTimeout(() => {
        server.stdin.write(data)
      }, 500)
    })
      
    it('can transmit message to broken client', function(done) {
      var port = getport()
      var server = listenTo(port)
      var transmit = connectTo(port)

      transmit.kill()
    
      setTimeout(() => {
        assert.ok(true)
        server.kill()
        done()
      }, 600)

      setTimeout(() => {
        server.stdin.write(data)
      }, 500)
    })
  })
})

describe('wstee', function() {
  it('should work', function(done) {
    var data = randData()
    var iport = getport()
    var oport = getport()
    var tee = spawn('node', ['./bin/wstee.js', '--connect-incoming', iport, '--connect-outgoing', oport])
    var a = connectTo(iport)
    var b = connectTo(oport)
    
    b.stdout.once('data', d => {
      d += ""
      // console.log(d)
      assert.equal(data, d)
      tee.kill()
      a.kill()
      b.kill()
      done()
    })
    a.stdin.write(data)
  })
})
