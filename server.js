const WebSocket = require("ws");

const PORT = process.env.PORT || 3000;
const wss = new WebSocket.Server({ port: PORT });

let clients = [];

wss.on("connection", ws => {
  clients.push(ws);

  // первый — initiator
  if (clients.length === 1) {
    ws.send(JSON.stringify({ role: "initiator" }));
  }

  ws.on("message", msg => {
    clients.forEach(c => {
      if (c !== ws && c.readyState === WebSocket.OPEN) {
        c.send(msg);
      }
    });
  });

  ws.on("close", () => {
    clients = clients.filter(c => c !== ws);
  });
});

console.log("WebRTC signaling server on", PORT);
