// src/routes/ir.routes.js
import { Router } from 'express';
import IRController from '../controllers/IRController.js';

const router = Router();

// Cálculo do IR para um usuário
router.get('/calculate/:user_id', IRController.calculateAnnual);

// Ver configuração atual
router.get('/config', IRController.getConfig);

export default router;