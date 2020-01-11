# [I]nteractive [W]eb[s]ocket [C]ommand [L]ine [I]nterface

[![npm](https://img.shields.io/npm/v/interactive-websocket-cli)](https://www.npmjs.com/package/interactive-websocket-cli)
[![GitHub forks](https://img.shields.io/github/forks/danhab99/interactive-websocket-cli)](https://github.com/danhab99/interactive-websocket-cli)
[![GitHub Release Date](https://img.shields.io/github/release-date/danhab99/interactive-websocket-cli) ![github](https://img.shields.io/github/v/release/danhab99/interactive-websocket-cli)](https://github.com/danhab99/interactive-websocket-cli/releases)
[![npm](https://img.shields.io/npm/dw/interactive-websocket-cli)](https://www.npmjs.com/package/interactive-websocket-cli)
[![stars](https://img.shields.io/github/stars/danhab99/interactive-websocket-cli)](https://github.com/danhab99/interactive-websocket-cli)

An interactive websocket utility suite

- [[I]nteractive [W]eb[s]ocket [C]ommand [L]ine [I]nterface](#interactive-websocket-command-line-interface)
  - [Installation](#installation)
  - [Usage](#usage)
    - [wscli](#wscli)
      - [As a client](#as-a-client)
      - [As a server](#as-a-server)
    - [wstee](#wstee)
      - [Note](#note)

## Installation

```bash
npm i -g interactive-websocket-cli
```

## Usage

### wscli

wscli provides an interactive websocket client/server

```bash
Usage: wscli [options] [command]

Options:
  -V, --version                          output the version number
  -p, --pipe                             Pipe stdin to server and server to stdout
  -t, --tab-size <t>                     Set the tab size (default: 2)
  -i, --in <files>                       Use files as input (default: [])
  -o, --out <file>                       Output to file
  -u, --ugly                             No pretty print
  -d, --time-format <format>             Set the timestamp format (default: "YYYY/MM/DD HH:mm:ss(SSS[ms])")
  --server-config <file or JSON string>  Use a JSON object for any websocket server options
  --client-config <file or JSON string>  Use a JSON object for any websocket client options
  -h, --help                             output usage information

Commands:
  listen <port>                          Listen for websocket connections on a port
  connect <address>                      Connect to a websocket at an address

Notes: 
  * Pipe (-p) must be enabled when using file inputs (--in)
  * Specifying multiple --in(s) will chain together each the files and feed them through one at a time
  * Enabling ugly print (--ugly) will ignore --tab-size
  * Adress will be completed (ex. echo.websocket.org => ws://echo.websocket.org, 9000 => ws://localhost:9000)
  * --server-config and --client-config expect a JSON string conforming to https://github.com/websockets/ws/blob/HEAD/doc/ws.md#new-websocketaddress-protocols-options
  * --time-format strings are based off of https://momentjs.com/
```

#### As a client

Run `wscli connect [host]`. Once you see the `!!! Connected` message, press `h` for help, all further commands are triggered by the correct keypress.

```

      [s] send a message to server

```

#### As a server

Server has special arguments

```bash
Usage: wscli listen [options] <port>

Listen for websocket connections on a port

Options:
  -q, --quiet  Disable client outputs on connection (default: false)
  -h, --help   output usage information
```

Run `wscli listen [port]`, press `h` for help

```

      [s] open select prompt, used to select which connections are being displayed and will receive transmit messages. comma seperated numbers
      [S] print selected clients
      [t] transmits message to selected clients
      [b] broadcasts message to all clients
      [k] close selected clients
   
```

### wstee

`wstee` provides a proxy websocket for monitoring websocket connections. By default it will pipe stdio to the websocket although files can be provided as in/output

```
Usage: wstee [options]

Options:
  -V, --version                          output the version number
  -p, --pipe                             Pipe stdin to server and server to stdout
  -t, --tab-size <t>                     Set the tab size (default: 2)
  -i, --in <files>                       Use files as input (default: [])
  -o, --out <file>                       Output to file
  -u, --ugly                             No pretty print
  -d, --time-format <format>             Set the timestamp format (default: "YYYY/MM/DD HH:mm:ss(SSS[ms])")
  --server-config <file or JSON string>  Use a JSON object for any websocket server options
  --client-config <file or JSON string>  Use a JSON object for any websocket client options
  --connect-incoming <port or address>   Open a port to allow one client to connect (default: [])
  --connect-outgoing <port or address>   Connect to server  (default: [])
  -h, --help                             output usage information

Notes: 
  * Pipe (-p) must be enabled when using file inputs (--in)
  * Specifying multiple --in(s) will chain together each the files and feed them through one at a time
  * Enabling ugly print (--ugly) will ignore --tab-size
  * Adress will be completed (ex. echo.websocket.org => ws://echo.websocket.org, 9000 => ws://localhost:9000)
  * --server-config and --client-config expect a JSON string conforming to https://github.com/websockets/ws/blob/HEAD/doc/ws.md#new-websocketaddress-protocols-options
  * --time-format strings are based off of https://momentjs.com/
```

#### Note

When using `-p`, `wstee` will instead display the bitrate of data being transfered
