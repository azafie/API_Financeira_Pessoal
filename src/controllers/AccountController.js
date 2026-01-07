// src/controllers/AccountController.js
import Account from '../models/Account.js';
import User from '../models/User.js';

class AccountController {
  // 📌 Listar todas as contas
  async index(req, res) {
    try {
      const accounts = await Account.findAll({
        include: [
          { 
            association: 'user',
            attributes: ['id', 'name', 'email']
          }
        ],
        order: [['name', 'ASC']]
      });

      return res.json(accounts);
    } catch (error) {
      console.error('Erro ao listar contas:', error);
      return res.status(500).json({
        error: 'Erro ao listar contas',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  // 📌 Listar contas de um usuário específico
  async indexByUser(req, res) {
    try {
      const { user_id } = req.params;
      
      // 🔴 VALIDAÇÃO: Verifica se user_id foi fornecido e é um número
      if (!user_id || user_id.trim() === '') {
        return res.status(400).json({
          error: 'ID do usuário é obrigatório',
          example: '/api/accounts/user/1'
        });
      }
      
      // Converte para número
      const userId = parseInt(user_id);
      if (isNaN(userId)) {
        return res.status(400).json({
          error: 'ID do usuário deve ser um número válido'
        });
      }

      // Verifica se o usuário existe
      const userExists = await User.findByPk(userId);
      if (!userExists) {
        return res.status(404).json({
          error: 'Usuário não encontrado'
        });
      }

      const accounts = await Account.findAll({
        where: { user_id: userId },
        include: [
          { 
            association: 'user',
            attributes: ['id', 'name', 'email']
          }
        ],
        order: [['name', 'ASC']]
      });

      return res.json(accounts);
    } catch (error) {
      console.error('Erro ao listar contas do usuário:', error);
      return res.status(500).json({
        error: 'Erro ao listar contas do usuário',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  // 📌 Buscar conta por ID
  async show(req, res) {
    try {
      const { id } = req.params;
      
      // Validação
      if (!id || id.trim() === '') {
        return res.status(400).json({
          error: 'ID da conta é obrigatório'
        });
      }
      
      const accountId = parseInt(id);
      if (isNaN(accountId)) {
        return res.status(400).json({
          error: 'ID da conta deve ser um número válido'
        });
      }

      const account = await Account.findByPk(accountId, {
        include: [
          { 
            association: 'user',
            attributes: ['id', 'name', 'email']
          }
        ]
      });

      if (!account) {
        return res.status(404).json({ error: 'Conta não encontrada' });
      }

      return res.json(account);
    } catch (error) {
      console.error('Erro ao buscar conta:', error);
      return res.status(500).json({
        error: 'Erro ao buscar conta',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  // 📌 Criar conta
  async store(req, res) {
    try {
      const { name, type, initial_balance, user_id } = req.body;

      // Validações básicas
      if (!name || !name.trim()) {
        return res.status(400).json({
          error: 'Nome da conta é obrigatório',
        });
      }
      
      if (!type || !type.trim()) {
        return res.status(400).json({
          error: 'Tipo da conta é obrigatório',
        });
      }
      
      if (!user_id) {
        return res.status(400).json({
          error: 'ID do usuário é obrigatório',
        });
      }

      // Verifica se o usuário existe
      const userExists = await User.findByPk(user_id);
      if (!userExists) {
        return res.status(404).json({
          error: 'Usuário não encontrado',
        });
      }

      // Valida o tipo da conta
      const validTypes = ['wallet', 'bank', 'savings', 'credit', 'investment'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({
          error: 'Tipo de conta inválido',
          validTypes
        });
      }

      // Cria a conta
      const account = await Account.create({
        name: name.trim(),
        type: type.trim(),
        initial_balance: initial_balance || 0,
        user_id
      });

      // Busca a conta com relacionamento para retornar
      const accountWithUser = await Account.findByPk(account.id, {
        include: [
          { 
            association: 'user',
            attributes: ['id', 'name', 'email']
          }
        ]
      });

      return res.status(201).json(accountWithUser);
    } catch (error) {
      console.error('Erro ao criar conta:', error);
      return res.status(500).json({
        error: 'Erro ao criar conta',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  // 📌 Atualizar conta
  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, type, initial_balance } = req.body;
      
      // Validação do ID
      if (!id || id.trim() === '') {
        return res.status(400).json({
          error: 'ID da conta é obrigatório'
        });
      }
      
      const accountId = parseInt(id);
      if (isNaN(accountId)) {
        return res.status(400).json({
          error: 'ID da conta deve ser um número válido'
        });
      }

      const account = await Account.findByPk(accountId);
      if (!account) {
        return res.status(404).json({ error: 'Conta não encontrada' });
      }

      // Se for atualizar o tipo, valida
      if (type && type.trim()) {
        const validTypes = ['wallet', 'bank', 'savings', 'credit', 'investment'];
        if (!validTypes.includes(type.trim())) {
          return res.status(400).json({
            error: 'Tipo de conta inválido',
            validTypes
          });
        }
      }

      await account.update({
        name: name && name.trim() ? name.trim() : account.name,
        type: type && type.trim() ? type.trim() : account.type,
        initial_balance: initial_balance !== undefined ? initial_balance : account.initial_balance
      });

      // Busca atualizada com relacionamento
      const updatedAccount = await Account.findByPk(accountId, {
        include: [
          { 
            association: 'user',
            attributes: ['id', 'name', 'email']
          }
        ]
      });

      return res.json(updatedAccount);
    } catch (error) {
      console.error('Erro ao atualizar conta:', error);
      return res.status(500).json({
        error: 'Erro ao atualizar conta',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  // 📌 Deletar conta
  async delete(req, res) {
    try {
      const { id } = req.params;
      
      // Validação do ID
      if (!id || id.trim() === '') {
        return res.status(400).json({
          error: 'ID da conta é obrigatório'
        });
      }
      
      const accountId = parseInt(id);
      if (isNaN(accountId)) {
        return res.status(400).json({
          error: 'ID da conta deve ser um número válido'
        });
      }

      const account = await Account.findByPk(accountId);
      if (!account) {
        return res.status(404).json({ error: 'Conta não encontrada' });
      }

      await account.destroy();
      return res.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar conta:', error);
      return res.status(500).json({
        error: 'Erro ao deletar conta',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
}

export default new AccountController();