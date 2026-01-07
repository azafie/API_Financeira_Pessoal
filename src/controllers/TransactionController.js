// src/controllers/TransactionController.js
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import Account from '../models/Account.js';
import Category from '../models/Category.js';

class TransactionController {
  // 📌 Listar todas as transações
  async index(req, res) {
    try {
      const transactions = await Transaction.findAll({
        include: [
          { 
            association: 'user',
            attributes: ['id', 'name', 'email']
          },
          { 
            association: 'account',
            attributes: ['id', 'name', 'type']
          },
          { 
            association: 'category',
            attributes: ['id', 'name', 'type']
          }
        ],
        order: [['date', 'DESC'], ['createdAt', 'DESC']]
      });

      return res.json(transactions);
    } catch (error) {
      console.error('Erro ao listar transações:', error);
      return res.status(500).json({
        error: 'Erro ao listar transações',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  // 📌 Listar transações de um usuário
  async indexByUser(req, res) {
    try {
      const { user_id } = req.params;
      
      if (!user_id || user_id.trim() === '') {
        return res.status(400).json({
          error: 'ID do usuário é obrigatório',
          example: '/api/transactions/user/1'
        });
      }
      
      const userId = parseInt(user_id);
      if (isNaN(userId)) {
        return res.status(400).json({
          error: 'ID do usuário deve ser um número válido'
        });
      }

      const userExists = await User.findByPk(userId);
      if (!userExists) {
        return res.status(404).json({
          error: 'Usuário não encontrado'
        });
      }

      const transactions = await Transaction.findAll({
        where: { user_id: userId },
        include: [
          { 
            association: 'user',
            attributes: ['id', 'name', 'email']
          },
          { 
            association: 'account',
            attributes: ['id', 'name', 'type']
          },
          { 
            association: 'category',
            attributes: ['id', 'name', 'type']
          }
        ],
        order: [['date', 'DESC'], ['createdAt', 'DESC']]
      });

      return res.json(transactions);
    } catch (error) {
      console.error('Erro ao listar transações do usuário:', error);
      return res.status(500).json({
        error: 'Erro ao listar transações do usuário',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  // 📌 Buscar transação por ID
  async show(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || id.trim() === '') {
        return res.status(400).json({
          error: 'ID da transação é obrigatório'
        });
      }
      
      const transactionId = parseInt(id);
      if (isNaN(transactionId)) {
        return res.status(400).json({
          error: 'ID da transação deve ser um número válido'
        });
      }

      const transaction = await Transaction.findByPk(transactionId, {
        include: [
          { 
            association: 'user',
            attributes: ['id', 'name', 'email']
          },
          { 
            association: 'account',
            attributes: ['id', 'name', 'type', 'initial_balance']
          },
          { 
            association: 'category',
            attributes: ['id', 'name', 'type']
          }
        ]
      });

      if (!transaction) {
        return res.status(404).json({ error: 'Transação não encontrada' });
      }

      return res.json(transaction);
    } catch (error) {
      console.error('Erro ao buscar transação:', error);
      return res.status(500).json({
        error: 'Erro ao buscar transação',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  // 📌 Criar transação
  async store(req, res) {
    try {
      const { type, amount, description, date, user_id, account_id, category_id } = req.body;

      // Validações básicas
      const errors = [];
      
      if (!type || !type.trim()) errors.push('Tipo é obrigatório');
      if (!amount || amount <= 0) errors.push('Valor deve ser maior que zero');
      if (!date || !date.trim()) errors.push('Data é obrigatória');
      if (!user_id) errors.push('ID do usuário é obrigatório');
      if (!account_id) errors.push('ID da conta é obrigatório');
      if (!category_id) errors.push('ID da categoria é obrigatório');
      
      if (errors.length > 0) {
        return res.status(400).json({
          error: 'Campos obrigatórios faltando',
          details: errors
        });
      }

      // Verifica se o usuário existe
      const userExists = await User.findByPk(user_id);
      if (!userExists) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      // Verifica se a conta existe
      const accountExists = await Account.findByPk(account_id);
      if (!accountExists) {
        return res.status(404).json({ error: 'Conta não encontrada' });
      }

      // Verifica se a categoria existe
      const categoryExists = await Category.findByPk(category_id);
      if (!categoryExists) {
        return res.status(404).json({ error: 'Categoria não encontrada' });
      }

      // Valida o tipo
      const validTypes = ['income', 'expense'];
      if (!validTypes.includes(type.trim())) {
        return res.status(400).json({
          error: 'Tipo de transação inválido',
          validTypes
        });
      }

      // Cria a transação
      const transaction = await Transaction.create({
        type: type.trim(),
        amount,
        description: description ? description.trim() : null,
        date: date.trim(),
        user_id,
        account_id,
        category_id
      });

      // Busca a transação com relacionamentos
      const transactionWithRelations = await Transaction.findByPk(transaction.id, {
        include: [
          { 
            association: 'user',
            attributes: ['id', 'name', 'email']
          },
          { 
            association: 'account',
            attributes: ['id', 'name', 'type']
          },
          { 
            association: 'category',
            attributes: ['id', 'name', 'type']
          }
        ]
      });

      return res.status(201).json(transactionWithRelations);
    } catch (error) {
      console.error('Erro ao criar transação:', error);
      return res.status(500).json({
        error: 'Erro ao criar transação',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  // 📌 Atualizar transação
  async update(req, res) {
    try {
      const { id } = req.params;
      const { type, amount, description, date, account_id, category_id } = req.body;
      
      if (!id || id.trim() === '') {
        return res.status(400).json({
          error: 'ID da transação é obrigatório'
        });
      }
      
      const transactionId = parseInt(id);
      if (isNaN(transactionId)) {
        return res.status(400).json({
          error: 'ID da transação deve ser um número válido'
        });
      }

      const transaction = await Transaction.findByPk(transactionId);
      if (!transaction) {
        return res.status(404).json({ error: 'Transação não encontrada' });
      }

      // Validações para atualização
      if (type && type.trim()) {
        const validTypes = ['income', 'expense'];
        if (!validTypes.includes(type.trim())) {
          return res.status(400).json({
            error: 'Tipo de transação inválido',
            validTypes
          });
        }
      }

      if (amount !== undefined && amount <= 0) {
        return res.status(400).json({
          error: 'O valor deve ser maior que zero',
        });
      }

      if (account_id) {
        const accountExists = await Account.findByPk(account_id);
        if (!accountExists) {
          return res.status(404).json({ error: 'Conta não encontrada' });
        }
      }

      if (category_id) {
        const categoryExists = await Category.findByPk(category_id);
        if (!categoryExists) {
          return res.status(404).json({ error: 'Categoria não encontrada' });
        }
      }

      await transaction.update({
        type: type && type.trim() ? type.trim() : transaction.type,
        amount: amount !== undefined ? amount : transaction.amount,
        description: description !== undefined ? (description ? description.trim() : null) : transaction.description,
        date: date && date.trim() ? date.trim() : transaction.date,
        account_id: account_id || transaction.account_id,
        category_id: category_id || transaction.category_id
      });

      const updatedTransaction = await Transaction.findByPk(transactionId, {
        include: [
          { 
            association: 'user',
            attributes: ['id', 'name', 'email']
          },
          { 
            association: 'account',
            attributes: ['id', 'name', 'type']
          },
          { 
            association: 'category',
            attributes: ['id', 'name', 'type']
          }
        ]
      });

      return res.json(updatedTransaction);
    } catch (error) {
      console.error('Erro ao atualizar transação:', error);
      return res.status(500).json({
        error: 'Erro ao atualizar transação',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  // 📌 Deletar transação
  async delete(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || id.trim() === '') {
        return res.status(400).json({
          error: 'ID da transação é obrigatório'
        });
      }
      
      const transactionId = parseInt(id);
      if (isNaN(transactionId)) {
        return res.status(400).json({
          error: 'ID da transação deve ser um número válido'
        });
      }

      const transaction = await Transaction.findByPk(transactionId);
      if (!transaction) {
        return res.status(404).json({ error: 'Transação não encontrada' });
      }

      await transaction.destroy();
      return res.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar transação:', error);
      return res.status(500).json({
        error: 'Erro ao deletar transação',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
}

export default new TransactionController();