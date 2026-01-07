// src/controllers/DashboardController.js
import Transaction from '../models/Transaction.js';
import Account from '../models/Account.js';
import Category from '../models/Category.js';
import User from '../models/User.js';

class DashboardController {
  // 📊 Dashboard ULTRA SIMPLES
  async index(req, res) {
    try {
      const { user_id } = req.params;
      
      console.log('📊 Dashboard chamado para user:', user_id);
      
      // 1. Validação básica
      if (!user_id) {
        return res.status(400).json({ error: 'ID do usuário é obrigatório' });
      }
      
      const userId = parseInt(user_id);
      
      // 2. Verifica usuário
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
      
      console.log('✅ Usuário encontrado:', user.name);
      
      // 3. Busca TODAS as transações do usuário (SIMPLES)
      const allTransactions = await Transaction.findAll({
        where: { user_id: userId },
        raw: true // ← Retorna objetos simples, não instâncias do Sequelize
      });
      
      console.log(`📈 Encontradas ${allTransactions.length} transações`);
      
      // 4. Calcula totais MANUALMENTE (sem SQL complexo)
      let totalIncome = 0;
      let totalExpense = 0;
      let transactionsThisMonth = 0;
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      
      allTransactions.forEach(trans => {
        const transDate = new Date(trans.date);
        const transMonth = transDate.getMonth() + 1;
        const transYear = transDate.getFullYear();
        
        // Soma por tipo
        if (trans.type === 'income') {
          totalIncome += parseFloat(trans.amount);
        } else if (trans.type === 'expense') {
          totalExpense += parseFloat(trans.amount);
        }
        
        // Conta transações deste mês
        if (transMonth === currentMonth && transYear === currentYear) {
          transactionsThisMonth++;
        }
      });
      
      // 5. Busca contas do usuário
      const accounts = await Account.findAll({
        where: { user_id: userId },
        raw: true
      });
      
      // 6. Busca categorias do usuário
      const categories = await Category.findAll({
        where: { user_id: userId },
        raw: true
      });
      
      // 7. Últimas 5 transações
      const latestTransactions = await Transaction.findAll({
        where: { user_id: userId },
        order: [['date', 'DESC']],
        limit: 5,
        raw: true
      });
      
      // 8. Monta resposta
      const dashboardData = {
        status: 'success',
        usuario: {
          id: user.id,
          nome: user.name,
          email: user.email
        },
        resumo: {
          saldo_total: totalIncome - totalExpense,
          receita_total: totalIncome,
          despesa_total: totalExpense,
          total_transacoes: allTransactions.length,
          transacoes_este_mes: transactionsThisMonth
        },
        contas: {
          total: accounts.length,
          tipos: accounts.map(acc => acc.type)
        },
        categorias: {
          total: categories.length,
          despesas: categories.filter(cat => cat.type === 'expense').length,
          receitas: categories.filter(cat => cat.type === 'income').length
        },
        ultimas_transacoes: latestTransactions.map(t => ({
          id: t.id,
          tipo: t.type,
          valor: t.amount,
          descricao: t.description || 'Sem descrição',
          data: t.date,
          categoria_id: t.category_id
        })),
        timestamp: new Date().toISOString()
      };

      console.log('✅ Dashboard gerado com sucesso!');
      return res.json(dashboardData);
      
    } catch (error) {
      console.error('❌ ERRO NO DASHBOARD:', error.message);
      console.error('Stack:', error.stack);
      
      return res.status(500).json({
        error: 'Erro ao carregar dashboard',
        message: error.message,
        hint: 'Verifique se as tabelas Transaction, Account e Category existem'
      });
    }
  }
}

export default new DashboardController();