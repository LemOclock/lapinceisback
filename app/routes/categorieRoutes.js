import { Router } from 'express';
import {
    getAllCategories,
    createCategorie,
    getCategorieById,
    updateCategorie,
    deleteCategorie
} from '../controllers/categorieController.js';
import isLogged from '../middlewares/isLogged.js';
import isAdmin from '../middlewares/isAdmin.js';
import validateId from '../middlewares/validateId.js';

const router = Router();
router.param('id', validateId);

router.use(isLogged);

router.get('/', getAllCategories);
router.get('/:id', getCategorieById);

// Gestion des catégories système : admin uniquement
router.post('/', isAdmin, createCategorie);
router.put('/:id', isAdmin, updateCategorie);
router.delete('/:id', isAdmin, deleteCategorie);

export default router;
