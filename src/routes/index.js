import { Router } from 'express';

import userRoutes from './users.routes.js';
import accountRoutes from './accounts.routes.js';
import categoryRoutes from './categories.routes.js';
import transactionRoutes from './transactions.routes.js';
import dashboardRoutes from './dashboard.routes.js'; 
import irRoutes from './ir.routes.js'; 

const router = Router();

// Rota raiz / health check
router.get('/', (req, res) => {
  res.json({ 
    message: 'API Financeira funcionando!',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      accounts: '/api/accounts',
      categories: '/api/categories',
      transactions: '/api/transactions',
      dashboard: '/api/dashboard/:user_id',
      ir: {
        calculate: '/api/ir/calculate/:user_id',
        config: '/api/ir/config'
      }
      // reports: '/api/reports (em breve)'
    }
  });
});

// Rotas principais
router.use('/users', userRoutes);
router.use('/accounts', accountRoutes);
router.use('/categories', categoryRoutes);
router.use('/transactions', transactionRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/ir', irRoutes);

// Rota 404 (apenas para API)
router.use((req, res) => {
  res.status(404).json({ 
    error: 'Rota da API não encontrada',
    path: req.originalUrl,
    method: req.method
  });
});

export default router;
