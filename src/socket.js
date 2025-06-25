import { io } from 'socket.io-client';

// ✅ Use deployed backend URL here:
const socket = io("https://whiteboard-app-jhv7.onrender.com", {
  transports: ["websocket"],
  upgrade: false
});

export default socket;
