import { Router } from 'express';
import { createUserRouter } from './users';
import { createAuthRouter } from './auth';
import { container } from '../infrastructure/Container';

const router = Router();

// Main API route
router.get('/', (req, res) => {
  res.json({
    message: 'Campus Event Hub API v1',
    description: 'RESTful API for campus event management with user authentication and role-based access control',
    version: '1.0.0',
    endpoints: {
      authentication: [
        'POST /api/v1/auth/register',
        'POST /api/v1/auth/login',
        'GET /api/v1/auth/profile',
        'PUT /api/v1/auth/profile'
      ],
      users: [
        'GET /api/v1/users',
        'GET /api/v1/users/:id',
        'POST /api/v1/users',
        'PUT /api/v1/users/:id',
        'DELETE /api/v1/users/:id'
      ]
    },
    setup: {
      script: 'pnpm run init-superadmin',
      credentials: {
        email: 'superadmin@campus-event-hub.local',
        password: 'SuperAdmin123! (CHANGE IMMEDIATELY)',
        note: 'Run initialization script to create first SUPERADMIN user'
      }
    },
    documentation: {
      readme: 'See README.md for detailed API usage and examples',
      rbac: 'See RBAC_SETUP.md for complete role-based access control guide',
      security: 'Change default SUPERADMIN password immediately after first login'
    }
  });
});

// Get services from container
const userService = container.getUserService();
const authService = container.getAuthService();

// Mount authentication routes
router.use('/auth', createAuthRouter(authService, userService));

// Mount user routes
router.use('/users', createUserRouter(userService, authService));

// Add more routes here as needed
// router.use('/events', eventRoutes);

export default router;