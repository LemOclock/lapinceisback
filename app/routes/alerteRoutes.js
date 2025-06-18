import { Router } from 'express';
import {
    getAllAlertes,
    createAlerte,
    getAlerteById,
    updateAlerte,
    deleteAlerte
} from '../controllers/alerteController.js';
import isLogged from '../middlewares/isLogged.js';
import isAdmin from '../middlewares/isAdmin.js';
import isOwner from '../middlewares/isOwner.js'; 

const router = Router();

// Récupérer toutes les alertes (admin uniquement)
router.get('/', isLogged, isAdmin, getAllAlertes);

// Créer une alerte (admin uniquement)
router.post('/', isLogged, isAdmin, createAlerte);

// Récupérer une alerte par id (admin uniquement)
router.get('/:id', isLogged, isAdmin, getAlerteById);

// Mettre à jour une alerte (admin uniquement)
router.put('/:id', isLogged, isAdmin, updateAlerte);

// Supprimer une alerte (admin uniquement)
router.delete('/:id', isLogged, isAdmin, deleteAlerte);

export default router;