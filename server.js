const WebSocket = require("ws");
const PORT = process.env.PORT || 3000;

const wss = new WebSocket.Server({ port: PORT });
const rooms = {}; // { roomId: [ws, ws] }

wss.on("connection", ws => {
  let roomId = null;

  ws.on("message", msg => {
    const data = JSON.parse(msg);

    // вход в комнату
    if (data.join) {
      roomId = data.join;
      rooms[roomId] = rooms[roomId] || [];
      rooms[roomId].push(ws);

      if (rooms[roomId].length === 1) {
        ws.send(JSON.stringify({ role: "caller" }));
      } else {
        ws.send(JSON.stringify({ role: "listener" }));
      }
      return;
    }

    // пересылка signaling ТОЛЬКО В СВОЕЙ КОМНАТЕ
    if (roomId && rooms[roomId]) {
      rooms[roomId].forEach(c => {
        if (c !== ws && c.readyState === WebSocket.OPEN) {
          c.send(msg);
        }
      });
    }
  });

  ws.on("close", () => {
    if (roomId && rooms[roomId]) {
      rooms[roomId] = rooms[roomId].filter(c => c !== ws);
      if (rooms[roomId].length === 0) delete rooms[roomId];
    }
  });
});

console.log("Signaling server with rooms on", PORT);
