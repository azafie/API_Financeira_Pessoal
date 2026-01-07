// seed.js (coloque na raiz do projeto)
import sequelize from './src/config/database.js';
import User from './src/models/User.js';
import Account from './src/models/Account.js';
import Category from './src/models/Category.js';
import Transaction from './src/models/Transaction.js';
import TaxConfig from './src/models/TaxConfig.js';
import TaxCategory from './src/models/TaxCategory.js';

async function seedDatabase() {
  try {
    console.log('🌱 Iniciando seed do banco de dados...');
    
    // PASSO 1: Sincroniza banco (apaga e recria tudo)
    await sequelize.sync({ force: true });
    console.log('✅ Banco sincronizado (tabelas recriadas)');
    
    // PASSO 2: Cria 10 usuários de teste
    console.log('👥 Criando 10 usuários...');
    const users = await User.bulkCreate([
      { name: 'Carlos Silva', email: 'carlos@email.com' },
      { name: 'Ana Santos', email: 'ana@email.com' },
      { name: 'Pedro Oliveira', email: 'pedro@email.com' },
      { name: 'Mariana Costa', email: 'mariana@email.com' },
      { name: 'Ricardo Lima', email: 'ricardo@email.com' },
      { name: 'Fernanda Souza', email: 'fernanda@email.com' },
      { name: 'Lucas Pereira', email: 'lucas@email.com' },
      { name: 'Juliana Alves', email: 'juliana@email.com' },
      { name: 'Roberto Santos', email: 'roberto@email.com' },
      { name: 'Camila Rodrigues', email: 'camila@email.com' }
    ]);
    console.log(`✅ ${users.length} usuários criados`);
    
    // PASSO 3: Para cada usuário, cria contas
    console.log('💰 Criando contas para cada usuário...');
    const allAccounts = [];
    
    for (const user of users) {
      const accounts = await Account.bulkCreate([
        { name: 'Carteira', type: 'wallet', initial_balance: 500, user_id: user.id },
        { name: 'Banco Itaú', type: 'bank', initial_balance: 2500, user_id: user.id },
        { name: 'Cartão Nubank', type: 'credit', initial_balance: 0, user_id: user.id },
        { name: 'Poupança', type: 'savings', initial_balance: 1000, user_id: user.id }
      ]);
      allAccounts.push(...accounts);
    }
    console.log(`✅ ${allAccounts.length} contas criadas`);
    
    // PASSO 4: Para cada usuário, cria categorias
    console.log('📁 Criando categorias para cada usuário...');
    const allCategories = [];
    
    for (const user of users) {
      const categories = await Category.bulkCreate([
        // Despesas
        { name: 'Alimentação', type: 'expense', user_id: user.id },
        { name: 'Transporte', type: 'expense', user_id: user.id },
        { name: 'Moradia', type: 'expense', user_id: user.id },
        { name: 'Saúde', type: 'expense', user_id: user.id },
        { name: 'Educação', type: 'expense', user_id: user.id },
        { name: 'Lazer', type: 'expense', user_id: user.id },
        // Receitas
        { name: 'Salário', type: 'income', user_id: user.id },
        { name: 'Freelance', type: 'income', user_id: user.id },
        { name: 'Investimentos', type: 'income', user_id: user.id },
        { name: 'Bônus', type: 'income', user_id: user.id }
      ]);
      allCategories.push(...categories);
    }
    console.log(`✅ ${allCategories.length} categorias criadas`);
    
    // PASSO 5: Cria configuração de impostos
    console.log('🧮 Criando configuração de impostos...');
    const taxConfig = await TaxConfig.create({
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
        dependents: 2275.08,
        pension: 0.12,
        donations: 0.08
      },
      minimum_wage: 1412.00,
      exempt_amount: 28559.70,
      is_active: true
    });
    console.log('✅ Configuração de impostos criada');
    
    // PASSO 6: Configura categorias dedutíveis
    console.log('🏷️ Configurando categorias dedutíveis...');
    // Saúde (categoria 4 de cada usuário)
    for (let i = 0; i < users.length; i++) {
      const healthCategory = allCategories.find(c => 
        c.user_id === users[i].id && c.name === 'Saúde'
      );
      
      if (healthCategory) {
        await TaxCategory.create({
          tax_config_id: taxConfig.id,
          category_id: healthCategory.id,
          deduction_type: 'health',
          deductible_percentage: 100.00
        });
      }
    }
    
    // Educação (categoria 5 de cada usuário)
    for (let i = 0; i < users.length; i++) {
      const educationCategory = allCategories.find(c => 
        c.user_id === users[i].id && c.name === 'Educação'
      );
      
      if (educationCategory) {
        await TaxCategory.create({
          tax_config_id: taxConfig.id,
          category_id: educationCategory.id,
          deduction_type: 'education',
          deductible_percentage: 100.00
        });
      }
    }
    console.log('✅ Categorias dedutíveis configuradas');
    
    // PASSO 7: Cria transações de teste (muitas!)
    console.log('💸 Criando transações de teste...');
    const allTransactions = [];
    const transactionTypes = ['income', 'expense'];
    const descriptions = [
      'Supermercado', 'Posto de gasolina', 'Aluguel', 'Conta de luz',
      'Plano de saúde', 'Faculdade', 'Cinema', 'Restaurante',
      'Salário mensal', 'Freelance projeto', 'Dividendos', 'Bônus anual'
    ];
    
    // Para cada usuário, cria 20 transações aleatórias
    for (const user of users) {
      const userAccounts = allAccounts.filter(a => a.user_id === user.id);
      const userCategories = allCategories.filter(c => c.user_id === user.id);
      
      if (userAccounts.length === 0 || userCategories.length === 0) continue;
      
      const userTransactions = [];
      
      for (let i = 0; i < 20; i++) {
        const type = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
        const amount = type === 'income' 
          ? (Math.random() * 5000 + 1000).toFixed(2)  // R$ 1000-6000
          : (Math.random() * 500 + 10).toFixed(2);    // R$ 10-510
        
        const account = userAccounts[Math.floor(Math.random() * userAccounts.length)];
        const category = userCategories.filter(c => c.type === type)[0] || userCategories[0];
        
        // Gera data aleatória em 2024
        const month = Math.floor(Math.random() * 12) + 1;
        const day = Math.floor(Math.random() * 28) + 1;
        const date = `2024-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        
        userTransactions.push({
          type,
          amount: parseFloat(amount),
          description: descriptions[Math.floor(Math.random() * descriptions.length)],
          date,
          user_id: user.id,
          account_id: account.id,
          category_id: category.id
        });
      }
      
      const createdTransactions = await Transaction.bulkCreate(userTransactions);
      allTransactions.push(...createdTransactions);
    }
    console.log(`✅ ${allTransactions.length} transações criadas`);
    
    // PASSO 8: Resumo final
    console.log('\n🎉 SEED COMPLETADO COM SUCESSO!');
    console.log('📊 DADOS DISPONÍVEIS:');
    console.log(`   👥 Usuários: ${users.length}`);
    console.log(`   💰 Contas: ${allAccounts.length} (${allAccounts.length/users.length} por usuário)`);
    console.log(`   📁 Categorias: ${allCategories.length} (${allCategories.length/users.length} por usuário)`);
    console.log(`   💸 Transações: ${allTransactions.length} (${allTransactions.length/users.length} por usuário)`);
    console.log(`   🧮 Config IR: Ano ${taxConfig.year} ativo`);
    console.log('\n🔗 URLs PARA TESTAR:');
    console.log(`   👤 Usuário 1: http://localhost:3000/api/dashboard/1`);
    console.log(`   👤 Usuário 5: http://localhost:3000/api/dashboard/5`);
    console.log(`   👤 Usuário 10: http://localhost:3000/api/dashboard/10`);
    console.log(`   🧮 IR Usuário 1: http://localhost:3000/api/ir/calculate/1`);
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ ERRO NO SEED:', error);
    process.exit(1);
  }
}

// Executa o seed
seedDatabase();