const program = require("commander");
const fs = require('fs')
const CombinedStream = require('combined-stream');


module.exports = () => {
  program.version(require("../package.json").version);


  program.on('--help', () => {
    console.log(`
Notes: 
  * Pipe (-p) must be enabled when using file inputs (--in)
  * Specifying multiple --in(s) will chain together each the files and feed them through one at a time
  * Enabling ugly print (--ugly) will ignore --tab-size
  * Adress will be completed (ex. echo.websocket.org => ws://echo.websocket.org, 9000 => ws://localhost:9000)
  * --server-config and --client-config expect a JSON string conforming to https://github.com/websockets/ws/blob/HEAD/doc/ws.md#new-websocketaddress-protocols-options
  * --time-format strings are based off of https://momentjs.com/
    `)
  })

  function collect(value, previous) {
    return previous.concat([value]);
  }

  program
    .option("-p, --pipe", "Pipe stdin to server and server to stdout")
    .option("-t, --tab-size <t>", "Set the tab size", 2)
    .option("-i, --in <files>", "Use files as input", collect, [])
    .option("-o, --out <file>", "Output to file")
    .option("-u, --ugly", "No pretty print")
    .option("-d, --time-format <format>", "Set the timestamp format", "YYYY/MM/DD HH:mm:ss(SSS[ms])")
    .option("--server-config <file or JSON string>", "Use a JSON object for any websocket server options")
    .option("--client-config <file or JSON string>", "Use a JSON object for any websocket client options")


  return {
    program: program,
    help: () => {
      program.help();
      process.exit(1);
    },
    parse: () => {
      program.parse(process.argv);

      if (program.in.length == 0) {
        program.in = process.stdin
      }
      else {
        var combinedStream = CombinedStream.create();
        for (let index = 0; index < program.in.length; index++) {
          const element = program.in[index];
          combinedStream.append(fs.createReadStream(element))
        }
        program.in = combinedStream
      }

      if (program.out === undefined) {
        program.out = process.stdout
      }
      else {
        program.out = fs.createWriteStream(program.out)
      }

      if (program.serverConfig) {
        try {
          program.serverConfig = JSON.parse(program.serverConfig)
        }
        catch (e) {
          try {
            program.serverConfig = JSON.parse(fs.readFileSync(program.serverConfig))
          }
          catch (e) {
            console.warn('Unable to understand --server-config, ignoring')
          }
        }
      }

      if (program.clientConfig) {
        try {
          program.clientConfig = JSON.parse(program.clientConfig)
        }
        catch (e) {
          try {
            program.clientConfig = JSON.parse(fs.readFileSync(program.clientConfig))
          }
          catch (e) {
            console.warn('Unable to understand --client-config, ignoring')
          }
        }
      }

      return program
    }
  };
};
