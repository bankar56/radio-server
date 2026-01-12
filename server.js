const WebSocket = require("ws");

const PORT = process.env.PORT || 3000;
const wss = new WebSocket.Server({ port: PORT });

wss.on("connection", ws => {
  ws.on("message", msg => {
    // просто рассылаем всем кроме отправителя
    wss.clients.forEach(client => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(msg);
      }
    });
  });
});

console.log("WebRTC signaling server on", PORT);
