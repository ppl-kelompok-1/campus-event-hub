import { Router } from 'express';
import { createUserRouter } from './users';
import { container } from '../infrastructure/Container';

const router = Router();

// Main API route
router.get('/', (req, res) => {
  res.json({
    message: 'API v1',
    endpoints: [
      'GET /api/v1',
      'GET /api/v1/users',
      'GET /api/v1/users/:id',
      'POST /api/v1/users',
      'PUT /api/v1/users/:id',
      'DELETE /api/v1/users/:id'
    ]
  });
});

// Mount user routes
const userService = container.getUserService();
router.use('/users', createUserRouter(userService));

// Add more routes here as needed
// router.use('/events', eventRoutes);

export default router;