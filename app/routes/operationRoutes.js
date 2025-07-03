import { Router } from 'express';
import {
    getAllOperations,
    createOperation,
    getOperationById,
    updateOperation,
    deleteOperation,
    getOperationByDate
} from '../controllers/operationController.js';
import {
    getAllOperationsAccount,
    createOperationAccount,
    getOperationByIdAccount,
    updateOperationAccount,
    deleteOperationAccount,
    getOperationByDateAccount
} from '../controllers/accountOperationController.js'
import isLogged from '../middlewares/isLogged.js';
import upload from '../middlewares/upload.js';

const router = Router();

router.use(isLogged);

// -------------------------- ACCOUNT 

router.get('/account', getAllOperationsAccount);
router.post('/account', createOperationAccount);
router.get('/account/getoperationbydate', getOperationByDateAccount);
router.get('/account/:id', getOperationByIdAccount);
router.put('/account/:id', upload.single('image_operation'), updateOperationAccount);
router.delete('/account/:id', deleteOperationAccount);


// -------------------------- BUDGET


router.get('/budget', getAllOperations);
router.post('/budget', createOperation);
router.get('/budget/getoperationbydate', getOperationByDate);
router.get('/budget/:id', getOperationById);
router.put('/budget/:id', upload.single('image_operation'), updateOperation);
router.delete('/budget/:id', deleteOperation);

export default router;