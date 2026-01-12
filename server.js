const WebSocket = require("ws");
const PORT = process.env.PORT || 3000;

const wss = new WebSocket.Server({ port: PORT });
let peers = [];

wss.on("connection", ws => {
  peers.push(ws);

  ws.on("message", msg => {
    peers.forEach(p => {
      if (p !== ws && p.readyState === WebSocket.OPEN) {
        p.send(msg);
      }
    });
  });

  ws.on("close", () => {
    peers = peers.filter(p => p !== ws);
  });
});

console.log("Signaling server ready on", PORT);
