import { Router, Request, Response, NextFunction } from 'express';
import { UserService } from '../services/UserService';
import { asyncHandler } from '../middleware/error';
import { CreateUserDto, UpdateUserDto } from '../models/User';

export const createUserRouter = (userService: UserService): Router => {
  const router = Router();

  // GET /api/v1/users - Get all users with pagination
  router.get('/', asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await userService.getUsersPaginated(page, limit);
    
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
  }));

  // GET /api/v1/users/:id - Get user by ID
  router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      });
    }

    const user = await userService.getUserById(id);
    
    res.json({
      success: true,
      data: user
    });
  }));

  // POST /api/v1/users - Create new user
  router.post('/', asyncHandler(async (req: Request, res: Response) => {
    const createUserDto: CreateUserDto = {
      name: req.body.name,
      email: req.body.email
    };

    const user = await userService.createUser(createUserDto);
    
    res.status(201).json({
      success: true,
      data: user,
      message: 'User created successfully'
    });
  }));

  // PUT /api/v1/users/:id - Update user
  router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      });
    }

    const updateUserDto: UpdateUserDto = {
      name: req.body.name,
      email: req.body.email
    };

    const user = await userService.updateUser(id, updateUserDto);
    
    res.json({
      success: true,
      data: user,
      message: 'User updated successfully'
    });
  }));

  // DELETE /api/v1/users/:id - Delete user
  router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      });
    }

    await userService.deleteUser(id);
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  }));

  return router;
};