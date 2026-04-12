import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import customerAuthRoutes from './routes/customerAuth.routes.js';
import mobileAuthRoutes from './routes/mobileAuth.routes.js';
import autoRoutes from './routes/auto.routes.js';
import driverRoutes from './routes/driver.routes.js';
import routeRoutes from './routes/route.routes.js';
import assignmentRoutes from './routes/assignment.routes.js';
import { initializeDatabase } from './config/database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth', customerAuthRoutes);
app.use('/api/auth', mobileAuthRoutes);
app.use('/api/admin/autos', autoRoutes);
app.use('/api/admin/drivers', driverRoutes);
app.use('/api/admin/routes', routeRoutes);
app.use('/api/admin/assignments', assignmentRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, async () => {
  console.log(`🚀 Admin Backend running on port ${PORT}`);
  console.log(`CORS enabled for: ${process.env.FRONTEND_URL}`);
  
  // Initialize database tables
  await initializeDatabase();
});
