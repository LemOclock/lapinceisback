import express from 'express';
import authController from './controllers/authController.js';
import { authLimiter } from './middlewares/rateLimit.js';

const router = express.Router();

// Vérification de l'état de l'API (utile pour le monitoring / healthcheck)
router.get('/', (req, res) => {
  res.json({ success: true, message: 'API La Pince opérationnelle' });
});

router.post('/login', authLimiter, authController.loginAction);
router.post('/register', authLimiter, authController.signupAction);
router.post('/logout', authController.logout);

export default router;
