const WebSocket = require("ws");

// Create a WebSocket server
const wss = new WebSocket.Server({ port: 8181 });

console.log("WebSocket server started on ws://localhost:8181");

wss.on("connection", (ws) => {
  console.log("New client connected.");

  // Broadcast incoming messages to all connected clients
  ws.on("message", (data) => {
    console.log("Broadcasting data to clients.");
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(data.toString());
      }
    });
  });

  ws.on("close", () => {
    console.log("Client disconnected.");
  });
});
