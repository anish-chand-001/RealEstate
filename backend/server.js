import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from './models/user.model.js';
import { Chat } from './models/chat.model.js';
import { readAuthCookie } from './utils/authCookie.js';
import connectDB from './config/db.js';
import app from './app.js';

// Wrap Express with HTTP Server (Required for Socket.io)
const server = http.createServer(app);

// 3. Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.set('io', io);

io.use(async (socket, next) => {
  try {
    const token = readAuthCookie(socket.handshake.headers.cookie);
    if (!token) return next(new Error('Authentication required'));
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('_id isBlocked');
    if (!user || user.isBlocked) return next(new Error('Unauthorized'));
    socket.data.userId = user._id.toString();
    next();
  } catch {
    next(new Error('Unauthorized'));
  }
});

io.on('connection', (socket) => {
  socket.on('joinChat', async (chatId) => {
    if (!mongoose.isValidObjectId(chatId)) return;
    const chat = await Chat.findById(chatId).select('buyer seller');
    if (!chat) return;
    const userId = socket.data.userId;
    if (chat.buyer.toString() === userId || chat.seller.toString() === userId) {
      socket.join(chatId);
    }
  });
});

// Start accepting requests only after MongoDB is ready.
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error(`❌ Unable to start server: ${error.message}`);
    process.exit(1);
  });

process.on('unhandledRejection', (err, promise) => {
  console.log(`⚠️ Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});
