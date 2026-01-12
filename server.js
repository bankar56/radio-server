const WebSocket = require("ws");
const PORT = process.env.PORT || 3000;

const wss = new WebSocket.Server({ port: PORT });
const rooms = {};

wss.on("connection", ws => {
  let room = null;

  ws.on("message", raw => {
    let data;
    try {
      data = JSON.parse(raw.toString()); // ✅ ВОТ ЭТО КЛЮЧ
    } catch (e) {
      console.error("JSON error", e);
      return;
    }

    // join комнаты
    if (data.join) {
      room = data.join;
      rooms[room] = rooms[room] || [];
      rooms[room].push(ws);

      console.log("JOIN room:", room, "clients:", rooms[room].length);
      return;
    }

    // ретрансляция сообщений ТОЛЬКО внутри комнаты
    if (room && rooms[room]) {
      rooms[room].forEach(client => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(data));
        }
      });
    }
  });

  ws.on("close", () => {
    if (room && rooms[room]) {
      rooms[room] = rooms[room].filter(c => c !== ws);
      if (rooms[room].length === 0) delete rooms[room];
    }
  });
});

console.log("✅ Signaling server READY on", PORT);
