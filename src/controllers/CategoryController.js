// src/controllers/CategoryController.js
import Category from '../models/Category.js';
import User from '../models/User.js';

class CategoryController {
  // 📌 Listar todas as categorias
  async index(req, res) {
    try {
      const categories = await Category.findAll({
        include: [
          { 
            association: 'user',
            attributes: ['id', 'name', 'email']
          }
        ],
        order: [['name', 'ASC']]
      });

      return res.json(categories);
    } catch (error) {
      console.error('Erro ao listar categorias:', error);
      return res.status(500).json({
        error: 'Erro ao listar categorias',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  // 📌 Listar categorias de um usuário
  async indexByUser(req, res) {
    try {
      const { user_id } = req.params;
      
      // VALIDAÇÃO
      if (!user_id || user_id.trim() === '') {
        return res.status(400).json({
          error: 'ID do usuário é obrigatório',
          example: '/api/categories/user/1'
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

      const categories = await Category.findAll({
        where: { user_id: userId },
        include: [
          { 
            association: 'user',
            attributes: ['id', 'name', 'email']
          }
        ],
        order: [['name', 'ASC']]
      });

      return res.json(categories);
    } catch (error) {
      console.error('Erro ao listar categorias do usuário:', error);
      return res.status(500).json({
        error: 'Erro ao listar categorias do usuário',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  // 📌 Buscar categoria por ID
  async show(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || id.trim() === '') {
        return res.status(400).json({
          error: 'ID da categoria é obrigatório'
        });
      }
      
      const categoryId = parseInt(id);
      if (isNaN(categoryId)) {
        return res.status(400).json({
          error: 'ID da categoria deve ser um número válido'
        });
      }

      const category = await Category.findByPk(categoryId, {
        include: [
          { 
            association: 'user',
            attributes: ['id', 'name', 'email']
          }
        ]
      });

      if (!category) {
        return res.status(404).json({ error: 'Categoria não encontrada' });
      }

      return res.json(category);
    } catch (error) {
      console.error('Erro ao buscar categoria:', error);
      return res.status(500).json({
        error: 'Erro ao buscar categoria',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  // 📌 Criar categoria
  async store(req, res) {
    try {
      const { name, type, user_id } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({
          error: 'Nome da categoria é obrigatório',
        });
      }
      
      if (!type || !type.trim()) {
        return res.status(400).json({
          error: 'Tipo da categoria é obrigatório',
        });
      }
      
      if (!user_id) {
        return res.status(400).json({
          error: 'ID do usuário é obrigatório',
        });
      }

      const userExists = await User.findByPk(user_id);
      if (!userExists) {
        return res.status(404).json({
          error: 'Usuário não encontrado',
        });
      }

      const validTypes = ['income', 'expense'];
      if (!validTypes.includes(type.trim())) {
        return res.status(400).json({
          error: 'Tipo de categoria inválido',
          validTypes
        });
      }

      const category = await Category.create({
        name: name.trim(),
        type: type.trim(),
        user_id
      });

      const categoryWithUser = await Category.findByPk(category.id, {
        include: [
          { 
            association: 'user',
            attributes: ['id', 'name', 'email']
          }
        ]
      });

      return res.status(201).json(categoryWithUser);
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      return res.status(500).json({
        error: 'Erro ao criar categoria',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  // 📌 Atualizar categoria
  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, type } = req.body;
      
      if (!id || id.trim() === '') {
        return res.status(400).json({
          error: 'ID da categoria é obrigatório'
        });
      }
      
      const categoryId = parseInt(id);
      if (isNaN(categoryId)) {
        return res.status(400).json({
          error: 'ID da categoria deve ser um número válido'
        });
      }

      const category = await Category.findByPk(categoryId);
      if (!category) {
        return res.status(404).json({ error: 'Categoria não encontrada' });
      }

      if (type && type.trim()) {
        const validTypes = ['income', 'expense'];
        if (!validTypes.includes(type.trim())) {
          return res.status(400).json({
            error: 'Tipo de categoria inválido',
            validTypes
          });
        }
      }

      await category.update({
        name: name && name.trim() ? name.trim() : category.name,
        type: type && type.trim() ? type.trim() : category.type
      });

      const updatedCategory = await Category.findByPk(categoryId, {
        include: [
          { 
            association: 'user',
            attributes: ['id', 'name', 'email']
          }
        ]
      });

      return res.json(updatedCategory);
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      return res.status(500).json({
        error: 'Erro ao atualizar categoria',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  // 📌 Deletar categoria
  async delete(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || id.trim() === '') {
        return res.status(400).json({
          error: 'ID da categoria é obrigatório'
        });
      }
      
      const categoryId = parseInt(id);
      if (isNaN(categoryId)) {
        return res.status(400).json({
          error: 'ID da categoria deve ser um número válido'
        });
      }

      const category = await Category.findByPk(categoryId);
      if (!category) {
        return res.status(404).json({ error: 'Categoria não encontrada' });
      }

      await category.destroy();
      return res.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar categoria:', error);
      return res.status(500).json({
        error: 'Erro ao deletar categoria',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
}

export default new CategoryController();