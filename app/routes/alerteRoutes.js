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
import validateId from '../middlewares/validateId.js';

const router = Router();
router.param('id', validateId);

// Gestion des modèles d'alertes : admin uniquement
router.use(isLogged, isAdmin);

router.get('/', getAllAlertes);
router.get('/:id', getAlerteById);
router.post('/', createAlerte);
router.put('/:id', updateAlerte);
router.delete('/:id', deleteAlerte);

export default router;
