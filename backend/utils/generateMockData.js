/**
 * Gerador de dados simulados para o dashboard do sistema de pós-vendas
 * 
 * Este script gera dados simulados para testar o dashboard do sistema de pós-vendas
 * sem necessidade de integração com dados reais do e-commerce.
 * 
 * @author Sistema de Pós-Vendas
 * @version 1.0.0
 */

// Importações necessárias
const fs = require('fs');
const path = require('path');
const { format, subDays, addDays } = require('date-fns');

/**
 * Configurações para geração de dados
 */
const config = {
  // Período para geração de dados
  startDate: subDays(new Date(), 30), // 30 dias atrás
  endDate: new Date(), // Hoje
  
  // Configurações de produtos
  products: [
    { id: 'prod001', name: 'Tênis SportMax 3D', price: 299.90, category: 'Calçados' },
    { id: 'prod002', name: 'Camiseta Tech-Fit', price: 89.90, category: 'Vestuário' },
    { id: 'prod003', name: 'Smartwatch FitPro', price: 499.90, category: 'Eletrônicos' },
    { id: 'prod004', name: 'Mochila Adventure Pro', price: 159.90, category: 'Acessórios' },
    { id: 'prod005', name: 'Óculos VR Immersive', price: 1299.90, category: 'Eletrônicos' }
  ],
  
  // Configurações de usuários
  userCount: 100,
  
  // Configurações de eventos
  eventTypes: [
    'page_view',
    'product_view',
    'add_to_cart',
    'checkout',
    'purchase',
    'product_customize',
    'view_3d_model'
  ],
  
  // Configurações de dispositivos
  devices: [
    { name: 'Desktop', weight: 45 },
    { name: 'Mobile', weight: 40 },
    { name: 'Tablet', weight: 15 }
  ],
  
  // Opções de personalização
  customizationOptions: [
    { type: 'Cor', values: ['Vermelho', 'Azul', 'Preto', 'Branco', 'Verde'] },
    { type: 'Tamanho', values: ['P', 'M', 'G', 'GG'] },
    { type: 'Material', values: ['Algodão', 'Poliéster', 'Couro', 'Sintético'] },
    { type: 'Estampa', values: ['Lisa', 'Estampada', 'Listrada', 'Xadrez'] }
  ]
};

/**
 * Gera um número aleatório entre min e max (inclusive)
 * 
 * @param {Number} min - Valor mínimo
 * @param {Number} max - Valor máximo
 * @returns {Number} Número aleatório
 */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Seleciona um item aleatório de um array
 * 
 * @param {Array} array - Array de itens
 * @returns {*} Item aleatório
 */
function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Gera uma data aleatória entre startDate e endDate
 * 
 * @returns {Date} Data aleatória
 */
function randomDate() {
  const startTime = config.startDate.getTime();
  const endTime = config.endDate.getTime();
  const randomTime = startTime + Math.random() * (endTime - startTime);
  return new Date(randomTime);
}

/**
 * Gera um ID aleatório
 * 
 * @param {String} prefix - Prefixo para o ID
 * @returns {String} ID aleatório
 */
function generateId(prefix = '') {
  return `${prefix}${Math.random().toString(36).substring(2, 10)}`;
}

/**
 * Gera dados de vendas diárias
 * 
 * @returns {Array} Array de objetos com dados de vendas diárias
 */
function generateDailySales() {
  const dailySales = [];
  let currentDate = new Date(config.startDate);
  
  while (currentDate <= config.endDate) {
    // Gera um valor de vendas com alguma variação para simular padrões realistas
    // Mais vendas nos fins de semana, menos nas segundas-feiras
    const dayOfWeek = currentDate.getDay(); // 0 = Domingo, 6 = Sábado
    let baseAmount = randomInt(5000, 15000);
    
    // Ajusta baseAmount com base no dia da semana
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      // Fins de semana têm mais vendas
      baseAmount *= 1.3;
    } else if (dayOfWeek === 1) {
      // Segundas-feiras têm menos vendas
      baseAmount *= 0.7;
    }
    
    dailySales.push({
      date: format(currentDate, 'yyyy-MM-dd'),
      amount: parseFloat(baseAmount.toFixed(2))
    });
    
    // Avança para o próximo dia
    currentDate = addDays(currentDate, 1);
  }
  
  return dailySales;
}

/**
 * Gera dados de vendas por categoria
 * 
 * @returns {Array} Array de objetos com dados de vendas por categoria
 */
function generateSalesByCategory() {
  const categories = [...new Set(config.products.map(product => product.category))];
  
  return categories.map(category => {
    // Produtos desta categoria
    const categoryProducts = config.products.filter(product => product.category === category);
    
    // Calcula vendas totais para esta categoria
    const sales = categoryProducts.reduce((total, product) => {
      // Gera um número aleatório de vendas para este produto
      const productSales = randomInt(50, 200) * product.price;
      return total + productSales;
    }, 0);
    
    return {
      category,
      sales: parseFloat(sales.toFixed(2))
    };
  });
}

/**
 * Gera dados de uso por dispositivo
 * 
 * @returns {Array} Array de objetos com dados de uso por dispositivo
 */
function generateDeviceUsage() {
  // Calcula o total de pesos
  const totalWeight = config.devices.reduce((sum, device) => sum + device.weight, 0);
  
  // Gera percentuais com base nos pesos, com pequenas variações aleatórias
  return config.devices.map(device => {
    // Calcula o percentual base com base no peso
    let percentage = (device.weight / totalWeight) * 100;
    
    // Adiciona uma pequena variação aleatória (-3% a +3%)
    percentage += (Math.random() * 6) - 3;
    
    // Garante que o percentual está entre 0 e 100
    percentage = Math.max(0, Math.min(100, percentage));
    
    return {
      device: device.name,
      percentage: parseFloat(percentage.toFixed(1))
    };
  });
}

/**
 * Gera dados de personalizações populares
 * 
 * @returns {Array} Array de objetos com dados de personalizações populares
 */
function generatePopularCustomizations() {
  const customizations = [];
  
  // Para cada tipo de personalização
  config.customizationOptions.forEach(option => {
    // Para cada valor possível
    option.values.forEach(value => {
      // Gera uma contagem aleatória
      const count = randomInt(10, 500);
      
      customizations.push({
        type: option.type,
        value,
        count
      });
    });
  });
  
  // Ordena por contagem (decrescente) e pega os 10 primeiros
  return customizations
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

/**
 * Gera métricas gerais
 * 
 * @returns {Object} Objeto com métricas gerais
 */
function generateMetrics() {
  // Calcula a receita total com base nas vendas diárias
  const dailySales = generateDailySales();
  const totalRevenue = dailySales.reduce((sum, day) => sum + day.amount, 0);
  
  // Gera outras métricas
  const orderCount = randomInt(500, 1000);
  const averageOrderValue = totalRevenue / orderCount;
  const returnRate = parseFloat((Math.random() * 5).toFixed(1)); // 0% a 5%
  const customerSatisfaction = parseFloat((3.5 + Math.random() * 1.5).toFixed(1)); // 3.5 a 5.0
  
  return {
    totalRevenue: parseFloat(totalRevenue.toFixed(2)),
    orderCount,
    averageOrderValue: parseFloat(averageOrderValue.toFixed(2)),
    returnRate,
    customerSatisfaction
  };
}

/**
 * Gera dados completos para o dashboard
 * 
 * @returns {Object} Objeto com todos os dados para o dashboard
 */
function generateDashboardData() {
  return {
    dailySales: generateDailySales(),
    salesByCategory: generateSalesByCategory(),
    deviceUsage: generateDeviceUsage(),
    popularCustomizations: generatePopularCustomizations(),
    metrics: generateMetrics()
  };
}

/**
 * Gera eventos de log
 * 
 * @param {Number} count - Número de eventos a gerar
 * @returns {Array} Array de objetos com eventos de log
 */
function generateLogEvents(count = 1000) {
  const events = [];
  
  for (let i = 0; i < count; i++) {
    const eventType = randomItem(config.eventTypes);
    const date = randomDate();
    const userId = `user${randomInt(1, config.userCount)}`;
    const product = randomItem(config.products);
    
    // Define a severidade com base no tipo de evento
    let severity = 'info';
    if (eventType === 'error') {
      severity = 'error';
    } else if (eventType === 'checkout' || eventType === 'purchase') {
      // Alguns checkouts e compras podem ter avisos
      severity = Math.random() < 0.1 ? 'warning' : 'info';
    }
    
    // Gera a mensagem com base no tipo de evento
    let message = '';
    switch (eventType) {
      case 'page_view':
        message = `Usuário ${userId} visualizou a página ${randomItem(['home', 'produtos', 'categorias', 'sobre', 'contato'])}`;
        break;
      case 'product_view':
        message = `Usuário ${userId} visualizou o produto ${product.name}`;
        break;
      case 'add_to_cart':
        message = `Usuário ${userId} adicionou ${product.name} ao carrinho`;
        break;
      case 'checkout':
        message = `Usuário ${userId} iniciou checkout com ${randomInt(1, 5)} produtos`;
        break;
      case 'purchase':
        message = `Usuário ${userId} realizou compra no valor de R$ ${(product.price * randomInt(1, 3)).toFixed(2)}`;
        break;
      case 'product_customize':
        const option = randomItem(config.customizationOptions);
        const value = randomItem(option.values);
        message = `Usuário ${userId} personalizou ${product.name} com ${option.type}: ${value}`;
        break;
      case 'view_3d_model':
        message = `Usuário ${userId} visualizou modelo 3D de ${product.name} por ${randomInt(10, 120)} segundos`;
        break;
      default:
        message = `Evento ${eventType} registrado para usuário ${userId}`;
    }
    
    events.push({
      _id: generateId('evt'),
      eventType,
      userId,
      productId: product.id,
      severity,
      message,
      createdAt: date.toISOString(),
      metadata: {
        browser: randomItem(['Chrome', 'Firefox', 'Safari', 'Edge']),
        os: randomItem(['Windows', 'MacOS', 'iOS', 'Android']),
        device: randomItem(config.devices).name
      }
    });
  }
  
  // Ordena por data (mais recente primeiro)
  return events.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

/**
 * Salva os dados gerados em arquivos JSON
 */
function saveGeneratedData() {
  const outputDir = path.join(__dirname, 'data');
  
  // Cria o diretório de saída se não existir
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Gera e salva os dados do dashboard
  const dashboardData = generateDashboardData();
  fs.writeFileSync(
    path.join(outputDir, 'dashboard.json'),
    JSON.stringify(dashboardData, null, 2)
  );
  console.log('✅ Dados do dashboard gerados com sucesso!');
  
  // Gera e salva os eventos de log
  const logEvents = generateLogEvents(1000);
  fs.writeFileSync(
    path.join(outputDir, 'logs.json'),
    JSON.stringify(logEvents, null, 2)
  );
  console.log('✅ Eventos de log gerados com sucesso!');
  
  console.log(`\nArquivos salvos em: ${outputDir}`);
  console.log('\nPara usar estes dados:');
  console.log('1. Copie os arquivos para o diretório do backend');
  console.log('2. Modifique os controladores para carregar estes arquivos em vez de acessar o banco de dados');
  console.log('3. Reinicie o servidor backend');
}

// Executa a geração de dados
saveGeneratedData();
