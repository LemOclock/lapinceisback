import { Router } from 'express';
import { getOperationsByBudget } from '../controllers/operationController.js';
import {
    getAllOperationsAccount,
    createOperationAccount,
    getOperationByIdAccount,
    updateOperationAccount,
    deleteOperationAccount,
    getOperationByDateAccount,
    getOperationsByMonthAccount
} from '../controllers/accountOperationController.js'
import isLogged from '../middlewares/isLogged.js';
import upload from '../middlewares/upload.js';
import validateId from '../middlewares/validateId.js';

const router = Router();
router.param('id', validateId);

router.use(isLogged);

// -------------------------- ACCOUNT (opérations de l'utilisateur connecté)

router.get('/account', getAllOperationsAccount);
router.post('/account', upload.single('image_operation'), createOperationAccount);
router.get('/account/month', getOperationsByMonthAccount);
router.get('/account/getoperationbydate', getOperationByDateAccount);
router.get('/account/:id', getOperationByIdAccount);
router.put('/account/:id', upload.single('image_operation'), updateOperationAccount);
router.delete('/account/:id', deleteOperationAccount);

// -------------------------- BUDGET (opérations liées à un budget)

router.get('/budget', getOperationsByBudget);

export default router;
