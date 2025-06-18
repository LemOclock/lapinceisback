import { Router } from 'express';
import {
  getAllUtilisateurs,
  createUtilisateur,
  getUtilisateurById,
  updateUtilisateur,
  deleteUtilisateur
} from '../controllers/utilisateurController.js';
import isLogged from '../middlewares/isLogged.js';
import isAdmin from '../middlewares/isAdmin.js';
import isOwner from '../middlewares/isOwner.js';

const router = Router();

router.get('/', getAllUtilisateurs);
router.post('/', createUtilisateur);
router.get('/:id', getUtilisateurById);
router.put('/:id', updateUtilisateur);
router.delete('/:id', deleteUtilisateur);

export default router;