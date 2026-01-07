// src/routes/categories.routes.js
import { Router } from 'express';
import CategoryController from '../controllers/CategoryController.js';

const router = Router();

// Rotas principais
router.get('/', CategoryController.index);
router.get('/:id', CategoryController.show);
router.post('/', CategoryController.store);
router.put('/:id', CategoryController.update);
router.delete('/:id', CategoryController.delete);

// Rota específica para listar categorias de um usuário
router.get('/user/:user_id', CategoryController.indexByUser);

export default router;