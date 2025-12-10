import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import apiRoutes from './routes';
import { errorHandler } from './middleware/error';
import { Container } from './infrastructure/Container';
import { ReminderScheduler } from './infrastructure/scheduler/ReminderScheduler';

// Load environment variables
dotenv.config();

// Create Express app
const app: Express = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Basic route
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Welcome to Campus Event Hub API',
    version: '1.0.0'
  });
});

// API routes
app.use('/api/v1', apiRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.url}`
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
const server = app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
  console.log(`⚡️[server]: Environment: ${process.env.NODE_ENV || 'development'}`);

  // Initialize reminder scheduler
  const container = Container.getInstance();
  const reminderService = container.getReminderService();
  const reminderScheduler = new ReminderScheduler(reminderService);
  reminderScheduler.start();
  console.log('⚡️[server]: Reminder scheduler initialized');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    // Close database connection
    import('./infrastructure/Container').then(({ container }) => {
      container.close();
    });
  });
});

export default app;