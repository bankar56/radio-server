const http = require("http");
const WebSocket = require("ws");

const PORT = process.env.PORT || 3000;

// HTTP сервер (Render требует именно это)
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end("WebRTC signaling server");
});

// WebSocket поверх HTTP
const wss = new WebSocket.Server({ server });

const rooms = {};

wss.on("connection", ws => {
  let room = null;

  ws.on("message", raw => {
    let data;
    try {
      data = JSON.parse(raw.toString());
    } catch {
      return;
    }

    if (data.join) {
      room = data.join;
      rooms[room] = rooms[room] || [];
      rooms[room].push(ws);
      console.log("JOIN", room, rooms[room].length);
      return;
    }

    if (room && rooms[room]) {
      rooms[room].forEach(c => {
        if (c !== ws && c.readyState === WebSocket.OPEN) {
          c.send(JSON.stringify(data));
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

server.listen(PORT, () => {
  console.log("✅ HTTP + WSS signaling server on", PORT);
});
