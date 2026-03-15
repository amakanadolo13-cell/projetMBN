import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
  userCountry?: string;
}

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Token d\'authentification requis' });
    return;
  }

  const token = authHeader.substring(7);

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      role: string;
      country: string;
    };

    req.userId = payload.userId;
    req.userRole = payload.role;
    req.userCountry = payload.country;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Token invalide ou expiré' });
  }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  if (req.userRole !== 'ADMIN') {
    res.status(403).json({ success: false, message: 'Accès refusé' });
    return;
  }
  next();
}
