import { Router, Request, Response, NextFunction } from 'express';
import { UserService } from '../services/UserService';
import { AuthService } from '../services/AuthService';
import { asyncHandler } from '../middleware/error';
import { authenticate, authorize, canManageUser, canAssignRole, selfAccessOnly } from '../middleware/auth';
import { CreateUserDto, UpdateUserDto, UpdateSelfDto, UserRole } from '../models/User';

export const createUserRouter = (userService: UserService, authService: AuthService): Router => {
  const router = Router();

  // GET /api/v1/users - Get all users with pagination (Superadmin/Admin only)
  router.get('/', 
    authenticate(authService),
    authorize(UserRole.SUPERADMIN, UserRole.ADMIN),
    asyncHandler(async (req: Request, res: Response) => {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      const result = await userService.getUsersPaginated(page, limit, req.user.role);
      
      res.json({
        success: true,
        data: result.users,
        pagination: {
          total: result.total,
          page: result.page,
          totalPages: result.totalPages,
          limit
        }
      });
    })
  );

  // GET /api/v1/users/:id - Get user by ID (with role-based access)
  router.get('/:id', 
    authenticate(authService),
    canManageUser(authService),
    asyncHandler(async (req: Request, res: Response) => {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid user ID'
        });
      }

      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      const user = await userService.getUserById(id, req.user.role, req.user.userId);
      
      res.json({
        success: true,
        data: user
      });
    })
  );

  // POST /api/v1/users - Create new user (Superadmin/Admin only)
  router.post('/', 
    authenticate(authService),
    authorize(UserRole.SUPERADMIN, UserRole.ADMIN),
    canAssignRole(authService),
    asyncHandler(async (req: Request, res: Response) => {
      const createUserDto: CreateUserDto = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        role: req.body.role
      };

      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      const user = await userService.createUser(createUserDto, req.user.role);
      
      res.status(201).json({
        success: true,
        data: user,
        message: 'User created successfully'
      });
    })
  );

  // PUT /api/v1/users/:id - Update user (with role-based permissions)
  router.put('/:id', 
    authenticate(authService),
    canManageUser(authService),
    canAssignRole(authService),
    asyncHandler(async (req: Request, res: Response) => {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid user ID'
        });
      }

      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      const updateUserDto: UpdateUserDto = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        role: req.body.role
      };

      const user = await userService.updateUser(id, updateUserDto, req.user.role, req.user.userId);
      
      res.json({
        success: true,
        data: user,
        message: 'User updated successfully'
      });
    })
  );

  // DELETE /api/v1/users/:id - Delete user (with role-based permissions)
  router.delete('/:id', 
    authenticate(authService),
    canManageUser(authService),
    asyncHandler(async (req: Request, res: Response) => {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid user ID'
        });
      }

      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      await userService.deleteUser(id, req.user.role, req.user.userId);
      
      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    })
  );

  return router;
};