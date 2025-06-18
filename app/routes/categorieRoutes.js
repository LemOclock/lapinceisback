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

const router = Router();

router.get('/', isAdmin, getAllCategories);
router.post('/', isLogged, isAdmin, createCategorie);
router.get('/:id', isLogged, isAdmin, getCategorieById);
router.put('/:id', isLogged, isAdmin, updateCategorie);
router.delete('/:id', isLogged, isAdmin, deleteCategorie);

export default router;