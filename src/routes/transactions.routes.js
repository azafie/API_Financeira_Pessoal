// src/routes/transactions.routes.js
import { Router } from 'express';
import TransactionController from '../controllers/TransactionController.js';

const router = Router();

// Rotas principais
router.get('/', TransactionController.index);
router.get('/:id', TransactionController.show);
router.post('/', TransactionController.store);
router.put('/:id', TransactionController.update);
router.delete('/:id', TransactionController.delete);

// Rota específica para listar transações de um usuário
router.get('/user/:user_id', TransactionController.indexByUser);

export default router;