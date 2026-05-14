// backend/server.js

const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

// ✅ Define allowedOrigins FIRST before using it anywhere
const allowedOrigins = [
  'http://localhost:5173',
  'https://campus-connect.vercel.app',
  process.env.FRONTEND_URL,
].filter(Boolean);

// ✅ CORS middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Socket.IO — uses allowedOrigins defined above
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
  },
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));
app.use('/api/comments', require('./routes/commentRoutes'));
app.use('/api/chats', require('./routes/chatRoutes'));
app.use('/api/questions', require('./routes/questionRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/search', require('./routes/searchRoutes'));
app.use('/api/colleges', require('./routes/collegeRoutes'));

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

// ── Socket.IO ──────────────────────────────────────
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('🔌 Socket connected:', socket.id);

  socket.on('user:online', (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit('users:online', Array.from(onlineUsers.keys()));
  });

  socket.on('chat:join', (chatId) => {
    socket.join(chatId);
  });

  socket.on('chat:leave', (chatId) => {
    socket.leave(chatId);
  });

  socket.on('message:send', (data) => {
    socket.to(data.chatId).emit('message:receive', data.message);
  });

  socket.on('message:edited', (data) => {
    socket.to(data.chatId).emit('message:edited', data);
  });

  socket.on('message:deleted', (data) => {
    socket.to(data.chatId).emit('message:deleted', data);
  });

  socket.on('typing:start', (data) => {
    socket.to(data.chatId).emit('typing:start', {
      userId: data.userId,
      name: data.name,
    });
  });

  socket.on('typing:stop', (data) => {
    socket.to(data.chatId).emit('typing:stop', { userId: data.userId });
  });

  socket.on('disconnect', () => {
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

// ───────────────────────────────────────────────────

server.listen(process.env.PORT || 5000, () =>
  console.log(`Server running on port ${process.env.PORT || 5000}`)
);