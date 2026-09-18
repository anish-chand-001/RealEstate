import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import app from './app.js';

// 1. Connect to Database
connectDB();

// 2. Wrap Express with HTTP Server (Required for Socket.io)
const server = http.createServer(app);

// 3. Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods:["GET","POST"],
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log(`⚡ Socket connected: ${socket.id}`);
  socket.on('joinChat',(chatId) =>{
    socket.join(chatId);
  })

  socket.on('sendMessage',(data) =>{
    io.to(data.chatId).emit("receiveMessage",data);
  })

  socket.on('disconnect', () => {
    console.log(`❌ Socket disconnected: ${socket.id}`);
  });
});

// 4. Start Server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

process.on('unhandledRejection', (err, promise) => {
  console.log(`⚠️ Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});