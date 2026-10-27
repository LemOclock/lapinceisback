import { Router } from 'express';
import {
    getAllComptes,
    createCompte,
    getCompteById,
    updateCompte,
    deleteCompte,
    getCompteByUserId
} from '../controllers/compteController.js';
import isLogged from '../middlewares/isLogged.js';
import isAdmin from '../middlewares/isAdmin.js';
import validateId from '../middlewares/validateId.js';

const router = Router();
router.param('id', validateId);

router.use(isLogged);

router.get('/', isAdmin, getAllComptes);
router.post('/', createCompte);
router.get('/getcomptebyuserid', getCompteByUserId);
router.get('/:id', getCompteById);
router.put('/:id', updateCompte);
router.delete('/:id', deleteCompte);

export default router;
