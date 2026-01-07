// src/routes/accounts.routes.js
import { Router } from 'express';
import AccountController from '../controllers/AccountController.js';

const router = Router();

// Rotas principais
router.get('/', AccountController.index);
router.get('/:id', AccountController.show);
router.post('/', AccountController.store);
router.put('/:id', AccountController.update);
router.delete('/:id', AccountController.delete);

// Rota específica para listar contas de um usuário
router.get('/user/:user_id', AccountController.indexByUser);

export default router;