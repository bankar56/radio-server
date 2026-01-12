const WebSocket = require("ws");

const PORT = process.env.PORT || 3000;
const wss = new WebSocket.Server({ port: PORT });

let speaker = null;

wss.on("connection", ws => {
  ws.on("message", msg => {
    const data = JSON.parse(msg);

    if (data.type === "start" && !speaker) {
      speaker = ws;
    }

    if (data.type === "stop" && ws === speaker) {
      speaker = null;
    }

    if (data.type === "audio" && ws === speaker) {
      wss.clients.forEach(client => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(msg);
        }
      });
    }
  });

  ws.on("close", () => {
    if (ws === speaker) speaker = null;
  });
});

console.log("Radio server running on port", PORT);