// backend/server.js

const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const collegeRoutes = require('./routes/collegeRoutes');
const { Server } = require('socket.io');
const connectDB = require('./config/db');


dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));
app.use('/api/comments', require('./routes/commentRoutes'));
app.use('/api/chats', require('./routes/chatRoutes'));
app.use('/api/questions', require('./routes/questionRoutes'));
app.use('/api/search', require('./routes/searchRoutes'));
app.use('/api/colleges', collegeRoutes);

app.use('/api/notifications', require('./routes/notificationRoutes'));

app.get('/', (req, res) => {
  res.json({ message: 'Campus Connect API is running 🚀' });
});

// Error handler
app.use((err, req, res, next) => {
  console.log('ERROR:', err.message);
  res.status(res.statusCode === 200 ? 500 : res.statusCode).json({
    success: false,
    message: err.message,
  });
});

// ─── Socket.IO ───────────────────────────────────
const onlineUsers = new Map(); // userId → socketId

io.on('connection', (socket) => {
  console.log('🔌 Socket connected:', socket.id);

  // User comes online
  socket.on('user:online', (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit('users:online', Array.from(onlineUsers.keys()));
    console.log('👤 Online:', userId);
  });

  // Join a chat room
  socket.on('chat:join', (chatId) => {
    socket.join(chatId);
    console.log(`💬 ${socket.id} joined chat: ${chatId}`);
  });

  // Leave a chat room
  socket.on('chat:leave', (chatId) => {
    socket.leave(chatId);
  });

  // New message
  socket.on('message:send', (data) => {
    // Broadcast to everyone in the chat room except sender
    socket.to(data.chatId).emit('message:receive', data.message);
  });

  // Typing indicator
  socket.on('typing:start', (data) => {
    socket.to(data.chatId).emit('typing:start', {
      userId: data.userId,
      name: data.name,
    });
  });

  socket.on('typing:stop', (data) => {
    socket.to(data.chatId).emit('typing:stop', { userId: data.userId });
  });


socket.on('message:edited', (data) => {
  socket.to(data.chatId).emit('message:edited', data);
});

socket.on('message:deleted', (data) => {
  socket.to(data.chatId).emit('message:deleted', data);
});

  // Disconnect
  socket.on('disconnect', () => {
    // Remove from online users
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    io.emit('users:online', Array.from(onlineUsers.keys()));
    console.log('❌ Socket disconnected:', socket.id);
  });
});

// ─────────────────────────────────────────────────

server.listen(5000, () => console.log('Server running on port 5000'));