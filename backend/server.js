require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Import database and services
const database = require('./models/Database');
const notificationService = require('./services/NotificationService');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const exchangeRoutes = require('./routes/exchanges');
const skillRoutes = require('./routes/skills');
const notificationRoutes = require('./routes/notifications');

const app = express();
const server = http.createServer(app);

// Socket.io configuration - Allow all origins on local network
const io = socketIo(server, {
  cors: {
    origin: function(origin, callback) {
      // Allow requests with no origin
      if (!origin) return callback(null, true);
      
      // Allow all localhost
      if (origin.includes('localhost')) return callback(null, true);
      
      // Allow all private network IPs
      const privateIPPatterns = [
        /^http:\/\/192\.168\.\d+\.\d+/,
        /^http:\/\/10\.\d+\.\d+\.\d+/,
        /^http:\/\/172\.(1[6-9]|2\d|3[01])\.\d+\.\d+/
      ];
      
      if (privateIPPatterns.some(pattern => pattern.test(origin))) {
        return callback(null, true);
      }
      
      callback(null, true); // Allow all in development
    },
    methods: ["GET", "POST"],
    credentials: true
  }
});

const PORT = process.env.PORT || 5002;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "ws:", "wss:"]
    }
  }
}));

// Rate limiting - More lenient for local network deployment
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs (increased for local network)
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration - Allow all origins on local network
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    
    // Allow all localhost
    if (origin.includes('localhost')) return callback(null, true);
    
    // Allow all private network IPs (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
    const privateIPPatterns = [
      /^http:\/\/192\.168\.\d+\.\d+/,
      /^http:\/\/10\.\d+\.\d+\.\d+/,
      /^http:\/\/172\.(1[6-9]|2\d|3[01])\.\d+\.\d+/
    ];
    
    if (privateIPPatterns.some(pattern => pattern.test(origin))) {
      return callback(null, true);
    }
    
    // For production, use environment variable
    if (process.env.CORS_ORIGIN && process.env.CORS_ORIGIN.split(',').includes(origin)) {
      return callback(null, true);
    }
    
    callback(null, true); // Allow all in development
  },
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/exchanges', exchangeRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/notifications', notificationRoutes);

// Serve static files from React app
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Catch-all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`🔌 User connected: ${socket.id}`);
  
  // Join user-specific room for notifications
  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`👤 User ${userId} joined their room`);
  });
  
  // Join exchange-specific room for messaging
  socket.on('join_exchange', (exchangeId) => {
    socket.join(`exchange_${exchangeId}`);
    console.log(`💬 User joined exchange room: ${exchangeId}`);
  });
  
  // Handle real-time messaging
  socket.on('send_message', async (data) => {
    try {
      const { exchangeId, senderId, content, messageType, senderName, senderPicture } = data;
      
      // Save message to database
      const message = await database.addMessage({
        exchangeID: exchangeId,
        senderID: senderId,
        content,
        messageType: messageType || 'text'
      });
      
      // Create message object with sender info
      const messageWithSender = {
        ...message,
        senderName: senderName || 'Unknown',
        senderPicture: senderPicture || null
      };
      
      // Broadcast to all users in the exchange room (including sender)
      io.to(`exchange_${exchangeId}`).emit('receive_message', messageWithSender);
      
      console.log(`💬 Message sent in exchange ${exchangeId}: ${content}`);
      
    } catch (error) {
      console.error('Error handling message:', error);
      socket.emit('message_error', { error: 'Failed to send message' });
    }
  });
  
  // Handle exchange status updates
  socket.on('status_update', (data) => {
    socket.to(`exchange_${data.exchangeId}`).emit('status_changed', data);
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`🔌 User disconnected: ${socket.id}`);
  });
});

// Set socket.io instance in notification service
notificationService.setSocketIO(io);

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Global error handler:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: err.errors
    });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized access'
    });
  }
  
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Database initialization and server startup
(async () => {
  try {
    await database.initialize();
    console.log('📊 Database initialized and ready');
    
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📱 Frontend: http://localhost:3000`);
      console.log(`🔧 API: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    process.exit(1);
  }
})();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Process terminated');
    process.exit(0);
  });
});

module.exports = app;

