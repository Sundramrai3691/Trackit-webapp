// BoltPatch: Enhanced socket with JWT authentication
import { createServer } from "http";
import { Server } from "socket.io";
import { app } from "./app.js";
import jsonwebtoken from "jsonwebtoken";

const jwt = jsonwebtoken;
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN ,
    credentials: true,
  },
});

// BoltPatch: Add JWT authentication middleware for socket connections
io.use((socket, next) => {
  const token = socket.handshake.auth && socket.handshake.auth.token;
  if (!token) {
    console.log("Socket connection without token - allowing anonymous access");
    return next();
  }
  
  try {
    const cleanToken = token.replace(/^Bearer\s+/i, "");
    const decoded = jwt.verify(cleanToken, process.env.ACCESS_TOKEN_SECRET);
    socket.user = decoded;
    console.log("Socket authenticated for user:", decoded.id);
    return next();
  } catch (err) {
    console.warn("Socket auth failed:", err.message);
    // Allow connection but no user attached
    return next();
  }
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id, "user:", socket.user ? socket.user.id : "anonymous");

  socket.on("join", (room) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined room: ${room}`);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

export { server, io };