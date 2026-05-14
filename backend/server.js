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

// CORS CONFIGURATION

// Explicitly allowed origins
const allowedOrigins = [
  'http://localhost:5173', // Local development
  process.env.FRONTEND_URL, // Production frontend URL from Render environment variables
].filter(Boolean);

// Function to check if an origin is allowed
const isAllowedOrigin = (origin) => {
  // Allow requests with no origin (e.g. Postman, server-to-server requests)
  if (!origin) return true;

  // Allow explicitly configured origins
  if (allowedOrigins.includes(origin)) return true;

  // Allow all Vercel deployment URLs:

  if (origin.endsWith('.vercel.app')) return true;

  return false;
};

// Express CORS middleware
app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// Parse JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// SOCKET.IO CONFIGURATION


const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// API ROUTES


app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));
app.use('/api/comments', require('./routes/commentRoutes'));
app.use('/api/chats', require('./routes/chatRoutes'));
app.use('/api/questions', require('./routes/questionRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/search', require('./routes/searchRoutes'));
app.use('/api/colleges', require('./routes/collegeRoutes'));

// Health check route
app.get('/', (req, res) => {
  res.json({ message: 'Campus Connect API is running 🚀' });
});


// ERROR HANDLER


app.use((err, req, res, next) => {
  console.error('ERROR:', err.message);

  res.status(res.statusCode === 200 ? 500 : res.statusCode).json({
    success: false,
    message: err.message,
  });
});

// SOCKET.IO EVENTS


const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('🔌 Socket connected:', socket.id);

  // Mark user as online
  socket.on('user:online', (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit('users:online', Array.from(onlineUsers.keys()));
  });

  // Join a chat room
  socket.on('chat:join', (chatId) => {
    socket.join(chatId);
  });

  // Leave a chat room
  socket.on('chat:leave', (chatId) => {
    socket.leave(chatId);
  });

  // Send message to room
  socket.on('message:send', (data) => {
    socket.to(data.chatId).emit('message:receive', data.message);
  });

  // Message edited
  socket.on('message:edited', (data) => {
    socket.to(data.chatId).emit('message:edited', data);
  });

  // Message deleted
  socket.on('message:deleted', (data) => {
    socket.to(data.chatId).emit('message:deleted', data);
  });

  // Typing started
  socket.on('typing:start', (data) => {
    socket.to(data.chatId).emit('typing:start', {
      userId: data.userId,
      name: data.name,
    });
  });

  // Typing stopped
  socket.on('typing:stop', (data) => {
    socket.to(data.chatId).emit('typing:stop', {
      userId: data.userId,
    });
  });

  // Handle disconnect
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


// START SERVER


const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});