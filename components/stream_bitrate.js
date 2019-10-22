const EventEmitter = require('events')
const { Stream } = require('stream')

function humanFileSize(bytes, si) {
  var thresh = si ? 1000 : 1024;
  if(Math.abs(bytes) < thresh) {
      return bytes + ' B';
  }
  var units = si
      ? ['kB','MB','GB','TB','PB','EB','ZB','YB']
      : ['KiB','MiB','GiB','TiB','PiB','EiB','ZiB','YiB'];
  var u = -1;
  do {
      bytes /= thresh;
      ++u;
  } while(Math.abs(bytes) >= thresh && u < units.length - 1);
  return bytes.toFixed(1)+' '+units[u];
}

module.exports = class BitRate extends EventEmitter {
  constructor() {
    super()

    let last = -1, size = 0
    
    this.on('in', chunk => {
      size += chunk.length
    })

    setInterval(() => {
      let now = Date.now()
      
      if (last > 0) {
        this.emit('bitrate', humanFileSize(size / (now - last)))
        size = 0
        last = now
      }

      last = now
    }, 500)
  }
}