import { Router } from 'express';
import {
    getAllComptes,
    createCompte,
    getCompteById,
    updateCompte,
    deleteCompte
} from '../controllers/compteController.js';
import isLogged from '../middlewares/isLogged.js';
import isAdmin from '../middlewares/isAdmin.js';
import isOwner from '../middlewares/isOwner.js';

const router = Router();

router.get('/', isLogged, isAdmin, getAllComptes);
router.post('/', isLogged, isAdmin, isOwner, createCompte);
router.get('/:id', isLogged, isAdmin, isOwner, getCompteById);
router.put('/:id', isLogged, isAdmin, isOwner, updateCompte);
router.delete('/:id', isLogged, isAdmin, isOwner, deleteCompte);

export default router;