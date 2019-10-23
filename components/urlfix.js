const url = require('url');

module.exports = u => {
  if (/\w+:(\/?\/?)[^\s]+/.exec(u)) {
    return u
  }
  else {
    if (/\d+/.exec(u)) {
      return `ws://localhost:${u}/`
    }
    else {
      return 'ws://' + u 
    }
  }
}