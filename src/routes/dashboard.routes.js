// src/routes/dashboard.routes.js
import { Router } from 'express';
import DashboardController from '../controllers/DashboardController.js';

const router = Router();

// Dashboard principal
router.get('/:user_id', DashboardController.index);

export default router;