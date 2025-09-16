import { Router, Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { UserService } from '../services/UserService';
import { asyncHandler } from '../middleware/error';
import { authenticate } from '../middleware/auth';
import { LoginDto, RegisterDto } from '../models/Auth';
import { UpdateSelfDto } from '../models/User';

export const createAuthRouter = (authService: AuthService, userService: UserService): Router => {
  const router = Router();

  // POST /api/v1/auth/register - Register new user
  router.post('/register', asyncHandler(async (req: Request, res: Response) => {
    const registerDto: RegisterDto = {
      name: req.body.name,
      email: req.body.email,
      password: req.body.password
    };

    const result = await authService.register(registerDto);
    
    res.status(201).json({
      success: true,
      data: result,
      message: 'User registered successfully'
    });
  }));

  // POST /api/v1/auth/login - Login user
  router.post('/login', asyncHandler(async (req: Request, res: Response) => {
    const loginDto: LoginDto = {
      email: req.body.email,
      password: req.body.password
    };

    const result = await authService.login(loginDto);
    
    res.json({
      success: true,
      data: result,
      message: 'Login successful'
    });
  }));

  // GET /api/v1/auth/profile - Get current user profile
  router.get('/profile', authenticate(authService), asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const user = await userService.getUserById(req.user.userId);
    
    res.json({
      success: true,
      data: user
    });
  }));

  // PUT /api/v1/auth/profile - Update current user profile
  router.put('/profile', authenticate(authService), asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const updateDto: UpdateSelfDto = {
      name: req.body.name,
      password: req.body.password
    };

    const user = await userService.updateSelf(req.user.userId, updateDto, req.user.userId);
    
    res.json({
      success: true,
      data: user,
      message: 'Profile updated successfully'
    });
  }));

  return router;
};