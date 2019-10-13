# ws-cli

A websocket client/server for cli

## Installation

```bash
npm i -g @danhab99/ws-cli
```

## Usage

### As a client

Run `ws-cli connect [host]`. Once you see the `!!! Connected` message, press `h` for help

```

      [s] send a message to server

```

### As a server

Run `ws-cli listen [port]`, press `h` for help

```

      [s] open select prompt
      [S] print selected clients
      [t] transmits message to selected clients
      [b] broadcasts message to all clients
      [k] close selected clients
   
```