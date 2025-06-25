const { Server } = require("socket.io");

function socketConnection(server) {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5100", // Frontend URL
      methods: ["GET", "POST"]
    }
  });

  const roomUsers = {};

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join-room", ({ roomId, user }) => {
      socket.join(roomId);
      socket.roomId = roomId;
      socket.username = user;

      if (!roomUsers[roomId]) roomUsers[roomId] = [];

      roomUsers[roomId].push({ id: socket.id, name: user, role: "editor" });

      io.to(roomId).emit("room-users", roomUsers[roomId]);
      console.log(`${socket.id} (${user}) joined room ${roomId}`);
    });

    // 🔧 FIX: Forward draw events properly
    socket.on("draw", ({ roomId, ...drawData }) => {
      socket.to(roomId).emit("draw", drawData);
    });

    socket.on("clear-canvas", (roomId) => {
      socket.to(roomId).emit("clear-canvas");
    });

    socket.on("chat-message", ({ roomId, message }) => {
      const user = socket.username || "Guest";
      io.to(roomId).emit("chat-message", `${user}: ${message}`);
    });

    socket.on("get-users", (roomId) => {
      io.to(socket.id).emit("room-users", roomUsers[roomId] || []);
    });

    socket.on("change-role", ({ roomId, role }) => {
      const users = roomUsers[roomId];
      if (users) {
        const user = users.find((u) => u.id === socket.id);
        if (user) user.role = role;
        io.to(roomId).emit("room-users", users);
      }
    });

    socket.on("disconnect", () => {
      const { roomId } = socket;
      if (roomId && roomUsers[roomId]) {
        roomUsers[roomId] = roomUsers[roomId].filter(u => u.id !== socket.id);
        io.to(roomId).emit("room-users", roomUsers[roomId]);
      }
      console.log("User disconnected:", socket.id);
    });
  });
}

module.exports = socketConnection;
