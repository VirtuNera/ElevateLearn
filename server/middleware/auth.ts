import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

// JWT utility functions
export const createJWTToken = (userId: string): string => {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET!, { expiresIn: "1h" });
};

export const verifyJWTToken = (token: string): { sub: string } => {
  return jwt.verify(token, process.env.JWT_SECRET!) as { sub: string };
};

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    organizationId?: string;
  };
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const token = authHeader.substring(7);
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    
    const decoded = jwt.verify(token, secret) as any;
    
    if (!decoded.id) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Fetch user from database to get current role and organization
    const user = await db.select().from(users).where(eq(users.id, decoded.id)).limit(1);
    
    if (!user.length) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = {
      id: user[0].id,
      email: user[0].email || '',
      role: user[0].role,
      organizationId: user[0].organizationId || undefined,
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const roleMiddleware = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Access denied. Required roles: ${allowedRoles.join(', ')}` 
      });
    }

    next();
  };
};

export const organizationMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  // Allow admins to access any organization
  if (req.user.role === 'admin') {
    return next();
  }

  // Check if user is accessing their own organization's resources
  const resourceOrgId = req.params.organizationId || req.body.organizationId;
  
  if (resourceOrgId && resourceOrgId !== req.user.organizationId) {
    return res.status(403).json({ message: 'Access denied to this organization' });
  }

  next();
};
