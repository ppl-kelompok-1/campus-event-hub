import { Router, Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { UserService } from '../services/UserService';
import { asyncHandler } from '../middleware/error';
import { authenticate } from '../middleware/auth';
import { LoginDto, RegisterDto } from '../models/Auth';
import { UpdateSelfDto } from '../models/User';
import { container } from '../infrastructure/Container';

export const createAuthRouter = (authService: AuthService, userService: UserService): Router => {
  const router = Router();

  // Note: Self-registration removed - users are created by SUPERADMIN/ADMIN via /api/v1/users endpoint

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

  // POST /api/v1/auth/forgot-password - Request password reset
  router.post('/forgot-password', asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;

    // Validate email format
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        error: 'Valid email required'
      });
    }

    const userRepository = container.getUserRepository();
    const notificationService = container.getNotificationService();

    // Check if user exists
    const user = await userRepository.findByEmail(email);

    // Always return success (security: don't reveal if email exists)
    if (!user) {
      return res.json({
        success: true,
        message: 'If this email exists in our system, a reset link has been sent'
      });
    }

    // Generate token
    const token = await authService.generatePasswordResetToken(email);

    // Send email
    await notificationService.sendPasswordResetEmail(user.id, token);

    res.json({
      success: true,
      message: 'If this email exists in our system, a reset link has been sent'
    });
  }));

  // POST /api/v1/auth/reset-password - Reset password with token
  router.post('/reset-password', asyncHandler(async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;

    // Validate inputs
    if (!token || typeof token !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Token is required'
      });
    }

    if (!newPassword || typeof newPassword !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'New password is required'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters long'
      });
    }

    const userRepository = container.getUserRepository();

    // Reset password and get JWT
    const { userId, token: jwtToken } = await authService.resetPassword(
      token,
      newPassword
    );

    // Get user data
    const user = await userRepository.findById(userId);
    if (!user) {
      return res.status(500).json({
        success: false,
        error: 'User not found after password reset'
      });
    }

    // Return success with JWT for auto-login
    res.json({
      success: true,
      data: {
        message: 'Password reset successful',
        token: jwtToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          category: user.category
        }
      }
    });
  }));

  // GET /api/v1/auth/validate-reset-token - Validate password reset token
  router.get('/validate-reset-token', asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({
        success: false,
        data: { valid: false, message: 'Token is required' }
      });
    }

    // Validate token using existing AuthService method
    const userId = await authService.validateResetToken(token);

    if (userId === null) {
      return res.json({
        success: true,
        data: { valid: false, message: 'Token is invalid or expired' }
      });
    }

    return res.json({
      success: true,
      data: { valid: true }
    });
  }));

  return router;
};