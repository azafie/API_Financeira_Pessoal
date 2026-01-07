# 📊 API Financeira Pessoal

API Financeira Pessoal é um backend completo para controle financeiro, com suporte a usuários, contas, categorias, transações, dashboard analítico e cálculo dinâmico de Imposto de Renda.

Este README **explica apenas como instalar, configurar e rodar a aplicação**.
➡️ **O uso detalhado das APIs está documentado no arquivo Word anexo ao projeto.**

---

## 🚀 Pré-requisitos

Antes de iniciar, você precisa ter instalado:

* **Node.js** (v18 ou superior recomendado)
* **npm** (vem junto com o Node)
* **PostgreSQL** (v13 ou superior)
* **Git**

Verifique com:

```bash
node -v
npm -v
psql --version
```

---

## 📁 1️⃣ Criação do Projeto (caso do zero)

```bash
mkdir api-financeira
cd api-financeira
npm init -y
```

---

## 📦 2️⃣ Instalação das Dependências

### Dependências principais

```bash
npm install express sequelize pg pg-hstore dotenv cors
```

### Dependências de desenvolvimento

```bash
npm install --save-dev nodemon sequelize-cli
```

---

## ⚙️ 3️⃣ Configuração do Ambiente (.env)

O projeto **não sobe o arquivo `.env` no Git por segurança**.

### 3.1 Criar o arquivo `.env`

Copie o arquivo de exemplo:

```bash
cp .env.example .env
```

### 3.2 Configurar variáveis

Edite o `.env` com seus dados reais:

```env
DB_NAME=finance_db
DB_USER=finance_user
DB_PASS=sua_senha_aqui
DB_HOST=localhost
DB_PORT=5432
DB_DIALECT=postgres
DB_LOGGING=false

NODE_ENV=development
PORT=3000

JWT_SECRET=sua_chave_secreta
```

---

## 🗄️ 4️⃣ Configuração do Banco de Dados

### 4.1 Criar banco e usuário no PostgreSQL (exemplo)

```sql
CREATE DATABASE finance_db;
CREATE USER finance_user WITH ENCRYPTED PASSWORD 'sua_senha_aqui';
GRANT ALL PRIVILEGES ON DATABASE finance_db TO finance_user;
```

---

## 🧬 5️⃣ Migrations (Estrutura do Banco)

O projeto utiliza **Sequelize + migrations**.

### 5.1 Rodar as migrations

```bash
npx sequelize-cli db:migrate
```

✔ Isso irá criar todas as tabelas necessárias:

* users
* accounts
* categories
* transactions
* tax_configs
* tax_categories

### 5.2 Reverter migrations (opcional)

```bash
npx sequelize-cli db:migrate:undo
```

---

## 🌱 6️⃣ Popular o Banco com Dados de Teste (Seed)

O projeto possui um script de reset e seed do banco.

### 6.1 Executar reset completo

⚠️ **ATENÇÃO:** Isso apaga e recria todas as tabelas.

```bash
node reset-db.js
```

Esse comando:

* recria as tabelas
* cria usuário padrão
* cria contas
* cria categorias
* cria transações de exemplo

---

## ▶️ 7️⃣ Iniciar a Aplicação

### Modo desenvolvimento

```bash
npm run dev
```

ou

```bash
nodemon src/server.js
```

### Modo produção

```bash
npm start
```

---

## 🌐 8️⃣ Testar se a API está rodando

Abra no navegador ou Postman:

```text
http://localhost:3000/api
```

Resposta esperada:

```json
{
  "message": "API Financeira funcionando!",
  "version": "1.0.0"
}
```

---

## 📄 Documentação de Uso das APIs

📌 **IMPORTANTE**
O uso detalhado de cada endpoint (requests, responses e exemplos) está documentado no:

➡️ **Arquivo Word: `Documentacao_API_Financeira.docx`**

Este README cobre apenas **instalação e execução**.

---

## 🛠️ Scripts Úteis

```bash
npm run dev        # Inicia em desenvolvimento
npm start          # Inicia em produção
npx sequelize-cli db:migrate
node reset-db.js   # Reseta e popula o banco
```

---

## 🔐 Boas Práticas

* Nunca suba o arquivo `.env`
* Use `.env.example` como modelo
* Altere `JWT_SECRET` em produção
* Faça backup do banco antes de rodar o reset

---

## ✅ Status do Projeto

✔ API funcional
✔ Banco relacional configurado
✔ Migrations e seed automatizados
✔ Pronto para desenvolvimento e produção

---

📅 Documentação gerada em: **07/01/2026**
🚀 Status: **PRODUCTION READY**
