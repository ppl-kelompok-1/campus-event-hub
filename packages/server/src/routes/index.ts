import { Router } from 'express';

const router = Router();

// Example route
router.get('/', (req, res) => {
  res.json({
    message: 'API v1',
    endpoints: [
      'GET /api/v1',
      '// Add your endpoints here'
    ]
  });
});

// Add more routes here as needed
// Example:
// router.use('/users', userRoutes);
// router.use('/events', eventRoutes);

export default router;