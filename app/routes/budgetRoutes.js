import { Router } from 'express';
import {
    getAllBudgets,
    createBudget,
    getBudgetById,
    updateBudget,
    deleteBudget,
    getUserBudgets
} from '../controllers/budgetController.js';
import isLogged from '../middlewares/isLogged.js';
import isAdmin from '../middlewares/isAdmin.js';
import validateId from '../middlewares/validateId.js';

const router = Router();
router.param('id', validateId);

router.use(isLogged);

// Récupérer les budgets de l'utilisateur
router.get('/user', getUserBudgets);

// Récupérer tous les budgets (admin)
router.get('/', isAdmin, getAllBudgets);

// Créer un budget
router.post('/', createBudget);

// Récupérer un budget par id
router.get('/:id', getBudgetById);

// Mettre à jour un budget
router.put('/:id', updateBudget);

// Supprimer un budget
router.delete('/:id', deleteBudget);

export default router;
