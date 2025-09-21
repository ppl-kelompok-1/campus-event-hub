import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { UserRole } from '../models/User';
import { AppError } from './error';

// Extend Request interface to include user info
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        email: string;
        role: UserRole;
      };
    }
  }
}

// Authentication middleware
export const authenticate = (authService: AuthService) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.header('Authorization');
      
      if (!authHeader) {
        throw new AppError('Access denied. No token provided', 401);
      }

      const token = authHeader.replace('Bearer ', '');
      
      if (!token) {
        throw new AppError('Access denied. Invalid token format', 401);
      }

      const decoded = await authService.verifyToken(token);
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role
      };

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Role-based authorization middleware
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Access denied. User not authenticated', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError('Access denied. Insufficient permissions', 403));
    }

    next();
  };
};

// Middleware to check if user can manage another user
export const canManageUser = (authService: AuthService) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new AppError('Access denied. User not authenticated', 401));
      }

      const targetUserId = parseInt(req.params.id);
      const currentUserRole = req.user.role;

      // Users can always manage themselves
      if (req.user.userId === targetUserId) {
        return next();
      }

      // Only superadmin and admin can manage other users (approvers cannot manage other users)
      if (currentUserRole === UserRole.USER || currentUserRole === UserRole.APPROVER) {
        return next(new AppError('Access denied. Cannot manage other users', 403));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Middleware to check if user can assign specific role
export const canAssignRole = (authService: AuthService) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new AppError('Access denied. User not authenticated', 401));
      }

      const roleToAssign = req.body.role as UserRole;
      
      if (!roleToAssign) {
        return next(); // No role being assigned, continue
      }

      const currentUserRole = req.user.role;

      if (!authService.canAssignRole(currentUserRole, roleToAssign)) {
        return next(new AppError('Access denied. Cannot assign this role', 403));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Middleware for self-access only (users can only access their own data)
export const selfAccessOnly = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Access denied. User not authenticated', 401));
    }

    const targetUserId = parseInt(req.params.id);
    
    if (req.user.userId !== targetUserId) {
      return next(new AppError('Access denied. Can only access your own data', 403));
    }

    next();
  };
};