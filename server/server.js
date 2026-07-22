/**
 * LogiTrack — Server Bootstrap
 *
 * MIDDLEWARE ORDER IS CRITICAL — must follow this sequence:
 * 1. CORS — must be FIRST so all responses (including errors) have CORS headers
 * 2. Helmet — security headers
 * 3. Rate limiters — now CORS headers already on every response
 * 4. Body parsers
 * 5. Logger
 * 6. Routes
 * 7. Error handlers (last)
 *
 * WHY CORS MUST COME FIRST:
 * If rate limiter fires (429) BEFORE cors() runs, the 429 response has NO
 * 'Access-Control-Allow-Origin' header. The browser sees a CORS error instead
 * of the actual 429, and blocks the request entirely — confusing to debug.
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const connectDB = require('./config/db');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const clientRoutes = require('./routes/clientRoutes');
const brokerRoutes = require('./routes/brokerRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const driverRoutes = require('./routes/driverRoutes');
const shipmentRoutes = require('./routes/shipmentRoutes');

const app = express();
const PORT = process.env.PORT || 5000;
app.set('trust proxy', 1);

// ─── 1. CORS — MUST BE FIRST ──────────────────────────────────────────────────
const allowedOrigins = (process.env.CLIENT_URL || process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    const isAllowedOrigin = allowedOrigins.includes(origin);
    const isLocalhostDev = process.env.NODE_ENV !== 'production' && origin.startsWith('http://localhost');

    if (isAllowedOrigin || isLocalhostDev) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,       // Required for httpOnly cookies (refresh token)
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight OPTIONS for ALL routes

// ─── 2. SECURITY HEADERS ─────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// ─── 3. RATE LIMITERS ────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Try again later.' },
});
app.use(globalLimiter);

// Auth-specific limiter: strict in production, relaxed in development
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 10 : 1000,
  message: { success: false, message: 'Too many login attempts. Try again after 15 minutes.' },
});

// ─── 4. BODY PARSERS ─────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static uploads
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// ─── 5. LOGGING ──────────────────────────────────────────────────────────────
app.use(logger);

// ─── 6. ROUTES ───────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  const mongoose = require('mongoose');
  const states = ['Disconnected', 'Connected', 'Connecting', 'Disconnecting'];
  res.json({
    success: true,
    status: 'LogiTrack AI Server is running',
    database: states[mongoose.connection.readyState] || 'Unknown',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/brokers', brokerRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/shipments', shipmentRoutes);

// ─── 7. ERROR HANDLERS (must be last) ────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── START SERVER ─────────────────────────────────────────────────────────────
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 LogiTrack AI Server running on http://localhost:${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Client URL:  ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
  });
});
