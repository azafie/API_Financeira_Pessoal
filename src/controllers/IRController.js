// src/controllers/IRController.js
import { Sequelize, Op } from 'sequelize';
import Transaction from '../models/Transaction.js';
import Category from '../models/Category.js';
import TaxConfig from '../models/TaxConfig.js';
import User from '../models/User.js';

class IRController {
  // 📊 Cálculo SIMPLES do IR - VERSÃO 1.0
  async calculateAnnual(req, res) {
    try {
      const { user_id } = req.params;
      const { year = 2024 } = req.query; // Default 2024
      
      console.log(`🧮 Calculando IR para usuário ${user_id}, ano ${year}`);
      
      // Validação
      if (!user_id) {
        return res.status(400).json({ error: 'ID do usuário é obrigatório' });
      }
      
      const userId = parseInt(user_id);
      const targetYear = parseInt(year);
      
      // 1. Verifica usuário
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
      
      // 2. Configuração de impostos (busca ou usa padrão)
      let taxConfig = await TaxConfig.findOne({
        where: { year: targetYear }
      });
      
      if (!taxConfig) {
        console.log(`⚠️ Config do ano ${targetYear} não encontrada, usando padrão`);
        taxConfig = {
          year: targetYear,
          tax_brackets: [
            { min: 0, max: 2259.20, rate: 0, deduction: 0 },
            { min: 2259.21, max: 2826.65, rate: 0.075, deduction: 169.44 },
            { min: 2826.66, max: 3751.05, rate: 0.15, deduction: 381.44 },
            { min: 3751.06, max: 4664.68, rate: 0.225, deduction: 662.77 },
            { min: 4664.69, max: null, rate: 0.275, deduction: 896.00 }
          ],
          deduction_limits: {
            health: 6000.00,
            education: 3561.50,
            dependents: 2275.08
          },
          exempt_amount: 28559.70
        };
      }
      
      // 3. Calcula receita anual (SIMPLES)
      const startDate = `${targetYear}-01-01`;
      const endDate = `${targetYear}-12-31`;
      
      const incomeTransactions = await Transaction.findAll({
        where: {
          user_id: userId,
          type: 'income',
          date: { [Op.between]: [startDate, endDate] }
        },
        raw: true
      });
      
      const totalIncome = incomeTransactions.reduce((sum, t) => {
        return sum + parseFloat(t.amount || 0);
      }, 0);
      
      console.log(`💰 Receita anual: R$ ${totalIncome.toFixed(2)}`);
      
      // 4. Calcula despesas dedutíveis (SIMPLES - só saúde e educação por enquanto)
      const expenseTransactions = await Transaction.findAll({
        where: {
          user_id: userId,
          type: 'expense',
          date: { [Op.between]: [startDate, endDate] }
        },
        include: [{
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }],
        raw: true,
        nest: true
      });
      
      // Categorias consideradas "Saúde" e "Educação" (IDs 1 e 2 no seu seed)
      const healthExpenses = expenseTransactions
        .filter(t => t.category_id === 1) // Alimentação? Vamos considerar como exemplo
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
      
      const educationExpenses = expenseTransactions
        .filter(t => t.category_id === 2) // Transporte? Vamos considerar como exemplo
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
      
      // Aplica limites
      const healthDeduction = Math.min(healthExpenses, taxConfig.deduction_limits?.health || 6000);
      const educationDeduction = Math.min(educationExpenses, taxConfig.deduction_limits?.education || 3561.50);
      
      const totalDeductions = healthDeduction + educationDeduction;
      
      console.log(`🏥 Deduções: Saúde R$ ${healthDeduction.toFixed(2)}, Educação R$ ${educationDeduction.toFixed(2)}`);
      
      // 5. Calcula imposto
      const taxableIncome = Math.max(0, totalIncome - totalDeductions);
      let taxDue = 0;
      let appliedBracket = null;
      
      // Verifica isenção
      if (taxableIncome <= (taxConfig.exempt_amount || 28559.70)) {
        taxDue = 0;
      } else {
        // Encontra faixa
        const bracket = taxConfig.tax_brackets.find(b => 
          taxableIncome >= b.min && 
          (b.max === null || taxableIncome <= b.max)
        );
        
        if (bracket) {
          appliedBracket = bracket;
          taxDue = (taxableIncome * bracket.rate) - bracket.deduction;
          taxDue = Math.max(0, taxDue); // Não pode ser negativo
        }
      }
      
      // 6. Monta resposta
      const report = {
        status: 'success',
        ano: targetYear,
        usuario: {
          id: user.id,
          nome: user.name
        },
        receita_anual: {
          total: totalIncome,
          transacoes: incomeTransactions.length
        },
        deducoes: {
          total: totalDeductions,
          detalhes: {
            saude: {
              gasto: healthExpenses,
              deduzido: healthDeduction,
              limite: taxConfig.deduction_limits?.health || 6000,
              utilizado: `${((healthDeduction / (taxConfig.deduction_limits?.health || 6000)) * 100).toFixed(1)}%`
            },
            educacao: {
              gasto: educationExpenses,
              deduzido: educationDeduction,
              limite: taxConfig.deduction_limits?.education || 3561.50,
              utilizado: `${((educationDeduction / (taxConfig.deduction_limits?.education || 3561.50)) * 100).toFixed(1)}%`
            }
          }
        },
        calculo_imposto: {
          base_calculo: taxableIncome,
          faixa_aplicada: appliedBracket,
          imposto_devido: taxDue,
          aliquota_efetiva: totalIncome > 0 ? ((taxDue / totalIncome) * 100).toFixed(2) + '%' : '0%',
          situacao: taxDue > 0 ? 'IMPOSTO A PAGAR' : 'ISENTO'
        },
        resumo: {
          mensagem: taxDue > 0 
            ? `Você deve declarar e pagar aproximadamente R$ ${taxDue.toFixed(2)}`
            : 'Você está isento da declaração deste ano! 🎉',
          prazo: `Declaração: Até 30/04/${targetYear + 1}`,
          recomendacao: healthDeduction < 1000 ? 'Considere aumentar gastos com saúde para deduzir mais' : 'Deduções otimizadas'
        }
      };

      return res.json(report);
      
    } catch (error) {
      console.error('❌ Erro no cálculo do IR:', error);
      return res.status(500).json({
        error: 'Erro ao calcular imposto de renda',
        message: error.message
      });
    }
  }
  
  // 🔧 ROTA: Ver configuração atual
  async getConfig(req, res) {
    try {
      const config = await TaxConfig.findOne({
        where: { is_active: true },
        order: [['year', 'DESC']]
      });
      
      if (!config) {
        // Retorna configuração padrão
        return res.json({
          year: 2024,
          tax_brackets: [
            { min: 0, max: 2259.20, rate: 0, deduction: 0 },
            { min: 2259.21, max: 2826.65, rate: 0.075, deduction: 169.44 },
            { min: 2826.66, max: 3751.05, rate: 0.15, deduction: 381.44 },
            { min: 3751.06, max: 4664.68, rate: 0.225, deduction: 662.77 },
            { min: 4664.69, max: null, rate: 0.275, deduction: 896.00 }
          ],
          deduction_limits: {
            health: 6000.00,
            education: 3561.50,
            dependents: 2275.08
          },
          exempt_amount: 28559.70,
          is_default: true
        });
      }
      
      return res.json(config);
    } catch (error) {
      console.error('Erro ao buscar configuração:', error);
      return res.status(500).json({ error: 'Erro ao buscar configuração' });
    }
  }
}

export default new IRController();