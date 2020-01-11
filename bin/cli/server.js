const WebSocket = require("ws");
const Keyboard = require("../../components/keyboard");
const wsid = require('../../components/wsid')
const _ = require('lodash')
const write = (...msg) => process.stdout.write(...msg)

module.exports = (program) => {
  const wss = new WebSocket.Server(Object.assign({ port: program.port }, process.serverConfig));

  wss.on('error', e => {
    console.error(e)
    process.exit(1)
  })

  if (program.pipe) {
    wss.on('connection', ws => {
      var cws = WebSocket.createWebSocketStream(ws)
      program.in.pipe(cws)
      cws.pipe(program.out)
    })
  } else {
    const announce = (msg, ...args) => console.log('!!! ' + msg, ...args)
    announce('Listening')
    var keyboard = new Keyboard(program);
    var clients = [];

    wss.on("connection", (ws, req) => {
      clients.push(ws);
      ws.enabled = !program.quiet;
      ws.id = wsid(req)

      announce(`Client @ ${ws.id} connected`);

      ws.on("message", msg => {
        if (ws.enabled) {
          keyboard.printWS(msg, ws.id)
          keyboard.fix_prompt();
        }
      });

      ws.on("close", () => {
        announce(`${ws.id} closed`)
        _.remove(clients, x => x.id == ws.id)
      })
    });

    keyboard.on("s", () => {
      keyboard.prompt("select").then(raw => {
        var selected = _.split(raw, /,\s\|/)
        var ids = _.map(clients, x => x.id)
        selected = _.intersection(selected, ids)
        if (selected.length <= 0) {
          return
        }
        
        var enable = _.filter(clients, n => _.includes(selected, n.id))
        var disabled = _.without(clients, ...enable)

        _.each(enable, n => n.enabled = true)
        _.each(disabled, n => n.enabled = false)
      });
    });

    keyboard.on("l", () => {
      // console.log(`CLIENTS: ${JSON.stringify(clients)}`);
      write('CLIENTS ')
      _.each(clients, x => {
        write(`| ${x.id}`)
      });
      write('\n')
    });

    keyboard.on("S", () => {
      write("SELECTED: ");

      var enabled = _.filter(clients, n => n.enabled)
      _.each(enabled, n => write(`| ${n.id}`))

      write("\n");
    });

    keyboard.on("t", () => {
      keyboard.prompt("transmit").then(raw => {
        try {
          for (let cli in clients) {
            const client = clients[cli];
            if (client.enabled && client.readyState === client.OPEN) {
              client.send(raw);
            }
          }
        } catch (e) {
          console.error(e);
        }
      });
    });

    keyboard.on("b", () => {
      keyboard.prompt("broadcast").then(raw => {
        for (let cli in clients) {
          clients[cli].send(raw);
        }
      });
    });

    keyboard.on("k", () => {
      keyboard
        .prompt(
          `are you sure you want to close ${clients.length} connections [yn]`
        )
        .then(raw => {
          if (raw == "y") {
            for (let cli in clients) {
              if (cli.enabled) {
                cli.close();
                delete clients[cli]
              }
            }
          }
        });
    });

    keyboard.on("h", () => {
      console.log(`
    [s] open select prompt, used to select which connections are being displayed and will receive transmit messages. comma seperated numbers
    [S] print selected clients
    [t] transmits message to selected clients
    [b] broadcasts message to all clients
    [k] close selected clients
    `);
    });
  }
};
