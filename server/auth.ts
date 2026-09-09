import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'nsk-sport-54-super-secret-key-2026';
const ADMIN_USER = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'nsk54sport';

// Hash the default password at startup for fast comparison
let adminPasswordHash = bcrypt.hashSync(ADMIN_PASS, 10);

export interface AuthenticatedRequest extends Request {
  user?: {
    username: string;
    role: 'admin';
  };
}

export function verifyAdminCredentials(username: string, passwordPlain: string): boolean {
  if (username !== ADMIN_USER) return false;
  return bcrypt.compareSync(passwordPlain, adminPasswordHash);
}

export function updateAdminPassword(newPasswordPlain: string): void {
  adminPasswordHash = bcrypt.hashSync(newPasswordPlain, 10);
}

export function generateToken(username: string): string {
  return jwt.sign(
    { username, role: 'admin' },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  // Check authorization header or cookie or query
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.headers['x-admin-token']) {
    token = req.headers['x-admin-token'] as string;
  }

  if (!token) {
    return res.status(401).json({ error: 'Требуется авторизация администратора' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { username: string; role: 'admin' };
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Недействительный или истекший сессионный токен' });
  }
}
