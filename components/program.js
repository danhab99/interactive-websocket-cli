const program = require("commander");
const fs = require('fs')
const CombinedStream = require('combined-stream');



module.exports = () => {
  program.version(require("../package.json").version);

  function collect(value, previous) {
    return previous.concat([value]);
  }

  program
    .option("-p, --pipe", "Pipe stdin to server and server to stdout")
    .option("-t, --tab-size <t>", "Set the tab size", 2)
    .option("-i, --in <files>", "Use files as input", collect, [])
    .option("-o, --out <file>", "Output to file")
    .option("-u, --ugly", "No pretty print")
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

      return program
    }
  };
};
