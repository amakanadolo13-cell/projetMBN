import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth.routes';
import orderRoutes from './routes/order.routes';
import webhookRoutes from './routes/webhook.routes';
import prisma from './config/database';
import redis from './config/redis';
import logger from './config/logger';

const app = express();
const httpServer = createServer(app);

// Socket.IO pour livraison instantanée des codes
const io = new SocketServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST'],
  },
});

// ============================================================
// Middleware
// ============================================================
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(
  cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
  })
);

// Webhooks reçoivent du raw JSON (avant express.json)
app.use('/api/webhooks', express.raw({ type: 'application/json' }), (req, _res, next) => {
  if (req.body instanceof Buffer) {
    req.body = JSON.parse(req.body.toString());
  }
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting global
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Trop de requêtes. Réessayez dans 15 minutes.' },
});
app.use('/api/', limiter);

// Rate limiting strict pour auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Trop de tentatives de connexion.' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ============================================================
// Routes
// ============================================================
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/webhooks', webhookRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'SubPay Africa API',
    version: '1.0.0',
  });
});

// Countries & Providers
app.get('/api/config/countries', (_req, res) => {
  const { COUNTRIES } = require('./config/countries');
  res.json({ success: true, data: COUNTRIES });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route non trouvée' });
});

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('Unhandled error', { message: err.message, stack: err.stack });
  res.status(500).json({ success: false, message: 'Erreur serveur interne' });
});

// ============================================================
// Socket.IO — Livraison de codes en temps réel
// ============================================================
io.on('connection', (socket) => {
  const userId = socket.handshake.auth.userId;
  if (userId) {
    socket.join(`user:${userId}`);
    logger.info('Socket connected', { userId });
  }

  socket.on('disconnect', () => {
    if (userId) logger.info('Socket disconnected', { userId });
  });
});

// Export io pour l'utiliser depuis les controllers
export { io };

// ============================================================
// Démarrage
// ============================================================
async function start() {
  await redis.connect().catch(() => logger.warn('Redis unavailable, running without cache'));

  const PORT = parseInt(process.env.PORT || '3000');
  httpServer.listen(PORT, () => {
    logger.info('SubPay Africa API started', {
      port: PORT,
      env: process.env.NODE_ENV || 'development',
      url: `http://localhost:${PORT}`,
    });
  });
}

start().catch(console.error);
