// Install required packages:
// npm install express socket.io

const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const PORT = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware to handle CORS and JSON parsing
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// Store connected clients
const connectedClients = new Set();

// Socket.io event listeners
io.on("connection", (socket) => {
  console.log("A client connected");

  // Add the client to the set of connected clients
  connectedClients.add(socket);

  // Listen for 'disconnect' event
  socket.on("disconnect", () => {
    console.log("A client disconnected");
    // Remove the client from the set of connected clients
    connectedClients.delete(socket);
  });
});

// Endpoint to send notifications
app.post("/send-notification", (req, res) => {
  const { title, message, datetime, type } = req.body;

  // Emit notification event to all connected clients
  connectedClients.forEach((socket) => {
    socket.emit("notification", { title, message, datetime, type });
  });

  res
    .status(200)
    .json({ success: true, message: "Notification sent successfully" });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
