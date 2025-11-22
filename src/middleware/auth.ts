//backend/src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import { clerkClient } from '@clerk/clerk-sdk-node';

export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const { userId } = await clerkClient.verifyToken(token);

    // FIX: Clerk returns unknown → safely cast to string
    req.userId = userId as string;

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
  }
};

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Implement later
  next();
};
