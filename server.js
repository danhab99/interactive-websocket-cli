const WebSocket = require("ws");
const Keyboard = require("./keyboard");

module.exports = (program, port) => {
  const wss = new WebSocket.Server({ port: port });
  if (program.pipeStdin) {
    wss.on('connection', ws => {
      var cws = WebSocket.createWebSocketStream(ws)
      process.stdin.pipe(cws)
      cws.pipe(process.stdout)
    })
  } else {
    var keyboard = new Keyboard();
    var counter = 0;
    var clients = [];

    wss.on("connection", ws => {
      clients.push(ws);
      ws.enabled = true; // TODO setting
      ws.number = counter++;
      console.log(`!!! Client #${ws.number} connected`);
      ws.on("message", msg => {
        if (ws.enabled) {
          process.stdout.write(
            `\r${Date.now()} #${ws.number} >>> ${JSON.stringify(msg)}\n`
          );
          keyboard.fix_prompt();
        }
      });
    });

    keyboard.on("s", () => {
      keyboard.prompt("select").then(raw => {
        if (raw != "") {
          let s = raw.split(",");
          for (let index = 0; index < clients.length; index++) {
            clients[index].enabled = false;
          }
          for (let index = 0; index < s.length; index++) {
            i = parseInt(s[index]);
            clients[i].enabled = true;
          }
        }
      });
    });

    keyboard.on("l", () => {
      console.log(`CLIENTS: ${JSON.stringify(clients)}`);
    });

    keyboard.on("S", () => {
      process.stdout.write("SELECTED: ");
      for (let index = 0; index < clients.length; index++) {
        const element = clients[index];
        if (element.enabled) {
          process.stdout.write(index.toString() + ", ");
        }
      }
      process.stdout.write("\n");
    });

    keyboard.on("t", () => {
      keyboard.prompt("transmit").then(raw => {
        try {
          for (let cli in clients) {
            if (clients[cli].enabled) {
              clients[cli].send(raw);
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
              }
            }
          }
        });
    });

    keyboard.on("h", () => {
      console.log(`
    [s] open select prompt
    [S] print selected clients
    [t] transmits message to selected clients
    [b] broadcasts message to all clients
    [k] close selected clients
    `);
    });
  }
};
