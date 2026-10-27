import { Router } from 'express';
import {
  getMe,
  updateMe,
  updateMyPassword,
  deleteMe,
  getAllUtilisateurs,
  getUtilisateurById,
  updateUtilisateur,
  deleteUtilisateur
} from '../controllers/utilisateurController.js';
import isLogged from '../middlewares/isLogged.js';
import isAdmin from '../middlewares/isAdmin.js';
import validateId from '../middlewares/validateId.js';

const router = Router();
router.param('id', validateId);

router.use(isLogged);

// -------------------------- Utilisateur connecté
router.get('/me', getMe);
router.put('/me', updateMe);
router.put('/me/password', updateMyPassword);
router.delete('/me', deleteMe);

// -------------------------- Administration
router.get('/', isAdmin, getAllUtilisateurs);
router.get('/:id', isAdmin, getUtilisateurById);
router.put('/:id', isAdmin, updateUtilisateur);
router.delete('/:id', isAdmin, deleteUtilisateur);

export default router;
