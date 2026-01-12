const WebSocket = require("ws");
const PORT = process.env.PORT || 3000;

const wss = new WebSocket.Server({ port: PORT });
const rooms = {};

wss.on("connection", ws => {
  ws.on("message", msg => {
    const data = JSON.parse(msg);

    if (data.join) {
      ws.room = data.join;
      rooms[ws.room] = rooms[ws.room] || [];
      rooms[ws.room].push(ws);
      return;
    }

    if (ws.room && rooms[ws.room]) {
      rooms[ws.room].forEach(c => {
        if (c !== ws && c.readyState === WebSocket.OPEN) {
          c.send(JSON.stringify(data));
        }
      });
    }
  });

  ws.on("close", () => {
    if (ws.room && rooms[ws.room]) {
      rooms[ws.room] = rooms[ws.room].filter(c => c !== ws);
    }
  });
});

console.log("Signaling server ready");
