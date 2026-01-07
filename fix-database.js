// fix-database.js
import sequelize from './src/config/database.js';

async function fixDatabase() {
  try {
    console.log('🛠️ Corrigindo banco de dados...');
    
    // 1. Recria TODAS as tabelas do zero
    await sequelize.sync({ force: true });
    
    console.log('✅ Banco recriado do zero!');
    console.log('🎉 Todas as colunas foram criadas corretamente!');
    
    // 2. Agora rode o seed
    console.log('🌱 Executando seed...');
    const { exec } = await import('child_process');
    exec('node seed.js', (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Erro no seed:', error);
        return;
      }
      console.log('✅ Seed executado com sucesso!');
      console.log('📊 Banco pronto para uso!');
    });
    
  } catch (error) {
    console.error('❌ Erro ao corrigir banco:', error);
  }
}

fixDatabase();