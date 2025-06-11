
// Importação de dependências
require('dotenv').config(); // Carrega variáveis de ambiente do arquivo .env
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan'); // Logger HTTP simples
const winston = require('winston'); // Sistema de logs mais avançado
require('winston-mongodb'); // Plugin do Winston para armazenar logs no MongoDB
const expressWinston = require('express-winston'); // Middleware Winston para Express

// Importação de rotas
const logRoutes = require('./api/routes/logRoutes');
const statsRoutes = require('./api/routes/statsRoutes');
const adminRoutes = require('./admin/routes/adminRoutes');

// Inicialização do app Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares básicos
app.use(cors()); // Permite requisições cross-origin (do frontend para o backend)
app.use(express.json()); // Parse de JSON no corpo das requisições
app.use(express.urlencoded({ extended: true })); // Parse de dados de formulário

/**
 * Configuração do Morgan para logs básicos de HTTP
 * 
 * O formato 'dev' exibe logs coloridos com método HTTP, status e tempo de resposta
 * Exemplo de saída: GET /api/stats 200 43.352 ms
 */
app.use(morgan('dev'));

/**
 * Configuração do Winston para logs avançados
 * 
 * Este middleware captura informações detalhadas sobre cada requisição
 * e as armazena tanto no console quanto no MongoDB para análise posterior.
 */
app.use(expressWinston.logger({
  // Transportes definem onde os logs serão armazenados
  transports: [
    // Log no console para desenvolvimento
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    // Log no MongoDB para persistência e análise
    new winston.transports.MongoDB({
      db: process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce-logs',
      collection: 'http_logs',
      options: { useUnifiedTopology: true }
    })
  ],
  // Formato dos logs
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  // Metadados a serem incluídos nos logs
  meta: true, // Inclui metadados da requisição
  msg: "HTTP {{req.method}} {{req.url}}", // Formato da mensagem
  expressFormat: true, // Inclui informações padrão do Express
  colorize: false, // Não coloriza logs que vão para o MongoDB
}));

// Conexão com o MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce-logs', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('📊 Conectado ao MongoDB'))
.catch(err => {
  console.error('❌ Erro ao conectar ao MongoDB:', err);
  process.exit(1); // Encerra o processo em caso de falha na conexão
});

// Rotas da API
app.use('/api/logs', logRoutes); // Endpoints para registro de eventos
app.use('/api/stats', statsRoutes); // Endpoints para estatísticas
app.use('/api/admin', adminRoutes); // Endpoints para o painel administrativo

// Rota raiz para verificar se o servidor está funcionando
app.get('/', (req, res) => {
  res.json({ 
    message: 'API do Sistema de Pós-Vendas',
    version: '1.0.0',
    status: 'online'
  });
});

// Middleware para tratamento de erros
app.use((err, req, res, next) => {
  console.error('❌ Erro no servidor:', err);
  res.status(500).json({ 
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo deu errado'
  });
});

// Middleware para rotas não encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Inicialização do servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📈 Dashboard disponível em http://localhost:${PORT}/api/stats`);
  console.log(`🔐 Painel Admin disponível em http://localhost:${PORT}/api/admin`);
});

module.exports = app; // Exporta o app para testes
