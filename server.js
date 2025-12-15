const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: true, // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fruit_mstore';

// Connection options for serverless environments (Vercel)
const mongooseOptions = {
  serverSelectionTimeoutMS: 10000, // Increased to 10s
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
  maxPoolSize: 10, // Maintain up to 10 socket connections
  // Note: minPoolSize removed for serverless compatibility
  bufferMaxEntries: 0, // Disable mongoose buffering; throw immediately
  bufferCommands: false, // Disable mongoose buffering
  connectTimeoutMS: 10000, // How long to wait for initial connection
};

// Cache the connection to avoid creating multiple connections in serverless
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  // Check if mongoose connection exists and is ready
  if (mongoose.connection.readyState === 1) {
    if (!cached.conn) {
      cached.conn = mongoose;
    }
    return cached.conn;
  }

  // If connection dropped or not ready, reset cache
  if (mongoose.connection.readyState !== 1 && mongoose.connection.readyState !== 2) {
    cached.conn = null;
    cached.promise = null;
  }

  // If connection is in progress, wait for it
  if (!cached.promise) {
    const opts = {
      ...mongooseOptions,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('✅ MongoDB Connected Successfully');
      
      // Set up connection event handlers
      mongoose.connection.on('error', (err) => {
        console.error('❌ MongoDB Connection Error:', err.message);
        cached.conn = null;
        cached.promise = null;
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️  MongoDB Disconnected');
        cached.conn = null;
        cached.promise = null;
      });

      mongoose.connection.on('reconnected', () => {
        console.log('✅ MongoDB Reconnected');
      });

      return mongoose;
    }).catch((err) => {
      cached.promise = null; // Reset promise on error
      console.error('❌ MongoDB Connection Error:', err.message);
      console.error('💡 Make sure MONGODB_URI is set correctly in environment variables');
      throw err;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// Middleware to ensure DB connection before handling requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    res.status(500).json({ 
      message: 'Database connection failed', 
      error: error.message 
    });
  }
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Fruit mStore Backend API is running' });
});

const PORT = process.env.PORT || 5000;

// Attempt to connect on server start (non-blocking)
connectDB().catch((err) => {
  console.error('⚠️  Initial connection attempt failed, will retry on first request');
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

