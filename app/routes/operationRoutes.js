import { Router } from 'express';
import {
    getAllOperations,
    createOperation,
    getOperationById,
    updateOperation,
    deleteOperation
} from '../controllers/operationController.js';
import isLogged from '../middlewares/isLogged.js';
import isAdmin from '../middlewares/isAdmin.js';
import isOwner from '../middlewares/isOwner.js';

const router = Router();

router.get('/', getAllOperations);
router.post('/', createOperation);
router.get('/:id', getOperationById);
router.put('/:id', updateOperation);
router.delete('/:id', deleteOperation);

export default router;