# ws-cli

A websocket client/server for cli

## Installation

```bash
npm i -g @danhab99/ws-cli
```

## Usage

```bash
Usage: ws-cli [options] [command]

Options:
  -V, --version       output the version number
  -p, --pipe-stdin    Pipe stdin to server and server to stdout
  -t, --tab-size <t>  Set the tab size (default: 2)
  -h, --help          output usage information

Commands:
  listen <port>       Listen for websocket connections on a port
  connect <address>   Connect to a websocket at an address
```

### As a client

Run `ws-cli connect [host]`. Once you see the `!!! Connected` message, press `h` for help, all further commands are triggered by the correct keypress.

```

      [s] send a message to server

```

### As a server

Run `ws-cli listen [port]`, press `h` for help

```

      [s] open select prompt, used to select which connections are being displayed and will receive transmit messages. comma seperated numbers
      [S] print selected clients
      [t] transmits message to selected clients
      [b] broadcasts message to all clients
      [k] close selected clients
   
```