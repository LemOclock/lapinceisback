import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env.js';

function isLogged(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, error: 'Authentification requise' });
  }

  jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] }, (err, user) => {
    if (err) {
      return res.status(401).json({ success: false, error: 'Session expirée ou invalide' });
    }
    req.user = user;
    next();
  });
}

export default isLogged;
