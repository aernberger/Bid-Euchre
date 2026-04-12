import { Request, Response, NextFunction } from 'express';
import supabase from '../supabaseClient.js';

export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
  // Get the token from the Authorization header (Bearer <token>)
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication token is missing' });
  }

  // Ask Supabase to verify this token
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  // Attach the verified user to the request object for later use
  (req as any).user = user;
  next();
};