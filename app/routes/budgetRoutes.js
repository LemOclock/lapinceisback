import { Router } from 'express';
import {
    getAllBudgets,
    createBudget,
    getBudgetById,
    updateBudget,
    deleteBudget
} from '../controllers/budgetController.js';
import isLogged from '../middlewares/isLogged.js';
import isAdmin from '../middlewares/isAdmin.js';
import isOwner from '../middlewares/isOwner.js';

const router = Router();

// Récupérer tous les budgets
router.get('/', isLogged, isAdmin, getAllBudgets);

// Créer un budget
router.post('/', isLogged, isAdmin, isOwner, createBudget);

// Récupérer un budget par id
router.get('/:id', isLogged, isAdmin, getBudgetById);

// Mettre à jour un budget
router.put('/:id', isLogged, isAdmin, isOwner, updateBudget);

// Supprimer un budget
router.delete('/:id', isLogged, isAdmin, isOwner, deleteBudget);

export default router;