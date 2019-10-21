const program = require("commander");
const fs = require('fs')
const CombinedStream = require('combined-stream');



module.exports = () => {
  program.version(require("./package.json").version);

  function collect(value, previous) {
    return previous.concat([value]);
  }

  program
    .option("-p, --pipe-stdin", "Pipe stdin to server and server to stdout")
    .option("-t, --tab-size <t>", "Set the tab size", 2)
    .option("-i, --in <files>", "Use files as input", collect, [])
    .option("-o, --out <file>", "Output to file")

  program
    .command("listen <port>")
    .description("Listen for websocket connections on a port")
    .action(port => {
      program.mode = "listen"
      program.port = port
    });

  program
    .command("connect <address>")
    .description("Connect to a websocket at an address")
    .action(address => {
      program.mode = "connect"
      program.address = address
    });

  return {
    program: program,
    parse: () => {
      program.parse(process.argv);

      if (
        program.mode === undefined ||
        typeof (program.tabSize = parseInt(program.tabSize)) != "number"
      ) {
        program.help();
        process.exit(1);
      } else {

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

        return program
      }
    }
  };
};
