import { rateLimit } from 'express-rate-limit';

// Limite les tentatives de connexion / inscription (anti brute-force)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, error: 'Trop de tentatives, réessayez dans 15 minutes.' }
});
