import { io } from 'socket.io-client';

// ✅ Use the deployed backend WebSocket server URL
const BACKEND_URL = "https://whiteboard-app-jhv7.onrender.com";

const socket = io(BACKEND_URL, {
  transports: ["websocket"],  // Force using WebSocket
  upgrade: false              // Disable long polling fallback
});

export default socket;
