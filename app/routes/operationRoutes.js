import { Router } from 'express';
import {
    getAllOperations,
    createOperation,
    getOperationById,
    updateOperation,
    deleteOperation
} from '../controllers/operationController.js';
import isLogged from '../middlewares/isLogged.js';

const router = Router();

router.use(isLogged);

router.get('/', getAllOperations);
router.post('/', createOperation);
router.get('/:id', getOperationById);
router.put('/:id', updateOperation);
router.delete('/:id', deleteOperation);

export default router;