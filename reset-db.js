// reset-db.js (na raiz do projeto)
import sequelize from './src/config/database.js';
import User from './src/models/User.js';
import Account from './src/models/Account.js';
import Category from './src/models/Category.js';
import Transaction from './src/models/Transaction.js';

async function resetDatabase() {
  try {
    console.log('🔄 Conectando ao banco...');
    
    // Testa conexão primeiro
    await sequelize.authenticate();
    console.log('✅ Conexão com PostgreSQL OK!');
    
    // Recria todas as tabelas
    console.log('🛠️ Recriando tabelas...');
    await sequelize.sync({ force: true });
    console.log('✅ Tabelas recriadas!');
    
    // Cria dados de teste
    console.log('🌱 Criando dados de teste...');
    
    // 1. Usuário
    const user = await User.create({
      name: 'Emerson Teste',
      email: 'teste@email.com'
    });
    console.log(`✅ Usuário criado: ${user.id}`);
    
    // 2. Contas
    const accounts = await Account.bulkCreate([
      { name: 'Carteira', type: 'wallet', initial_balance: 100, user_id: user.id },
      { name: 'Banco', type: 'bank', initial_balance: 1500, user_id: user.id },
      { name: 'Cartão', type: 'credit', initial_balance: 0, user_id: user.id }
    ]);
    console.log(`✅ ${accounts.length} contas criadas`);
    
    // 3. Categorias
    const categories = await Category.bulkCreate([
      { name: 'Alimentação', type: 'expense', user_id: user.id },
      { name: 'Transporte', type: 'expense', user_id: user.id },
      { name: 'Moradia', type: 'expense', user_id: user.id },
      { name: 'Salário', type: 'income', user_id: user.id },
      { name: 'Freelance', type: 'income', user_id: user.id }
    ]);
    console.log(`✅ ${categories.length} categorias criadas`);
    
    // 4. Transações (se tiver contas e categorias)
    if (accounts.length > 0 && categories.length > 0) {
      const transactions = await Transaction.bulkCreate([
        {
          type: 'expense',
          amount: 45.90,
          description: 'Supermercado',
          date: '2024-01-15',
          user_id: user.id,
          account_id: accounts[0].id,
          category_id: categories[0].id
        },
        {
          type: 'income',
          amount: 2500.00,
          description: 'Salário',
          date: '2024-01-05',
          user_id: user.id,
          account_id: accounts[1].id,
          category_id: categories[3].id
        }
      ]);
      console.log(`✅ ${transactions.length} transações criadas`);
    }
    
    console.log('\n🎉 BANCO RECRIADO COM SUCESSO!');
    console.log('📊 Dados disponíveis:');
    console.log(`   👤 Usuário ID: ${user.id}`);
    console.log(`   💰 Contas: ${accounts.length}`);
    console.log(`   📁 Categorias: ${categories.length}`);
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ ERRO:', error.message);
    
    if (error.name === 'SequelizeConnectionRefusedError') {
      console.log('\n🔴 POSTGRESQL NÃO ESTÁ CONECTADO!');
      console.log('👉 Verifique:');
      console.log('   1. PostgreSQL está rodando?');
      console.log('   2. IP no .env: 192.168.15.6');
      console.log('   3. Usuário/senha corretos?');
      console.log('\n💡 No Windows, abra Services (services.msc) e inicie "postgresql"');
    }
    
    process.exit(1);
  }
}

resetDatabase();