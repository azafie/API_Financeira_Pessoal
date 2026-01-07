// src/controllers/UserController.js
import User from '../models/User.js';

class UserController {
  // 📌 Listar todos os usuários
  async index(req, res) {
    try {
      const users = await User.findAll({
        include: [
          { association: 'accounts' },
          { association: 'categories' },
        ],
      });

      return res.json(users);
    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      return res.status(500).json({
        error: 'Erro ao listar usuários',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  // 📌 Buscar usuário por ID
  async show(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || id.trim() === '') {
        return res.status(400).json({
          error: 'ID do usuário é obrigatório'
        });
      }
      
      const userId = parseInt(id);
      if (isNaN(userId)) {
        return res.status(400).json({
          error: 'ID do usuário deve ser um número válido'
        });
      }

      const user = await User.findByPk(userId, {
        include: [
          { association: 'accounts' },
          { association: 'categories' },
        ],
      });

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      return res.json(user);
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      return res.status(500).json({
        error: 'Erro ao buscar usuário',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  // 📌 Criar usuário
  async store(req, res) {
    try {
      const { name, email } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({
          error: 'Nome é obrigatório',
        });
      }
      
      if (!email || !email.trim()) {
        return res.status(400).json({
          error: 'Email é obrigatório',
        });
      }

      const userExists = await User.findOne({ where: { email: email.trim() } });

      if (userExists) {
        return res.status(400).json({
          error: 'Email já cadastrado',
        });
      }

      const user = await User.create({
        name: name.trim(),
        email: email.trim(),
      });

      return res.status(201).json(user);
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      return res.status(500).json({
        error: 'Erro ao criar usuário',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  // 📌 Atualizar usuário
  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, email } = req.body;
      
      if (!id || id.trim() === '') {
        return res.status(400).json({
          error: 'ID do usuário é obrigatório'
        });
      }
      
      const userId = parseInt(id);
      if (isNaN(userId)) {
        return res.status(400).json({
          error: 'ID do usuário deve ser um número válido'
        });
      }

      const user = await User.findByPk(userId);

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      await user.update({
        name: name && name.trim() ? name.trim() : user.name,
        email: email && email.trim() ? email.trim() : user.email,
      });

      return res.json(user);
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      return res.status(500).json({
        error: 'Erro ao atualizar usuário',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  // 📌 Deletar usuário
  async delete(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || id.trim() === '') {
        return res.status(400).json({
          error: 'ID do usuário é obrigatório'
        });
      }
      
      const userId = parseInt(id);
      if (isNaN(userId)) {
        return res.status(400).json({
          error: 'ID do usuário deve ser um número válido'
        });
      }

      const user = await User.findByPk(userId);

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      await user.destroy();

      return res.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      return res.status(500).json({
        error: 'Erro ao deletar usuário',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
}

export default new UserController();