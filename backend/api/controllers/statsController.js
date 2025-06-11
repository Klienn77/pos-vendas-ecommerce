/**
 * Controlador para geração de estatísticas e métricas
 * 
 * Este controlador fornece métodos para gerar e consultar estatísticas
 * baseadas nos logs de eventos do e-commerce.
 * 
 * @module controllers/statsController
 */

const Event = require('../../models/eventModel');
const fs = require('fs');
const path = require('path');

/**
 * Objeto que contém os métodos do controlador de estatísticas
 */
const statsController = {
  /**
   * Obtém estatísticas gerais do sistema
   * 
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   * @returns {Object} Resposta com estatísticas gerais ou mensagem de erro
   */
  getOverviewStats: async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      // Converte as strings de data para objetos Date
      const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 dias atrás por padrão
      const end = endDate ? new Date(endDate) : new Date();
      
      // Tenta carregar dados simulados primeiro
      const mockDataPath = path.join(__dirname, '../../utils/data/dashboard.json');
      if (fs.existsSync(mockDataPath)) {
        const mockData = JSON.parse(fs.readFileSync(mockDataPath, 'utf8'));
        
        // Extrai métricas relevantes dos dados simulados
        const overviewStats = {
          totalEvents: 1000, // Valor fixo para demonstração
          productViews: 450,
          productCustomizations: 200,
          cartAdds: 300,
          checkoutStarts: 150,
          checkoutCompletes: 100,
          conversionRate: 22.2, // (100/450) * 100
          cartAbandonmentRate: 66.7 // ((300-100)/300) * 100
        };
        
        return res.status(200).json({
          success: true,
          period: {
            start: start.toISOString(),
            end: end.toISOString()
          },
          stats: overviewStats
        });
      }
      
      // Fallback para busca no banco de dados se não houver dados simulados
      // Busca contagem total de eventos
      const totalEvents = await Event.countDocuments({
        timestamp: { $gte: start, $lte: end }
      });
      
      // Busca contagem de visualizações de produtos
      const productViews = await Event.countDocuments({
        eventType: 'product_view',
        timestamp: { $gte: start, $lte: end }
      });
      
      // Busca contagem de personalizações de produtos
      const productCustomizations = await Event.countDocuments({
        eventType: 'product_customize',
        timestamp: { $gte: start, $lte: end }
      });
      
      // Busca contagem de adições ao carrinho
      const cartAdds = await Event.countDocuments({
        eventType: 'cart_add',
        timestamp: { $gte: start, $lte: end }
      });
      
      // Busca contagem de inícios de checkout
      const checkoutStarts = await Event.countDocuments({
        eventType: 'checkout_start',
        timestamp: { $gte: start, $lte: end }
      });
      
      // Busca contagem de compras finalizadas
      const checkoutCompletes = await Event.countDocuments({
        eventType: 'checkout_complete',
        timestamp: { $gte: start, $lte: end }
      });
      
      // Calcula taxa de conversão geral (visualizações para compras)
      const conversionRate = productViews > 0
        ? (checkoutCompletes / productViews) * 100
        : 0;
      
      // Calcula taxa de abandono de carrinho
      const cartAbandonmentRate = cartAdds > 0
        ? ((cartAdds - checkoutCompletes) / cartAdds) * 100
        : 0;
      
      return res.status(200).json({
        success: true,
        period: {
          start: start.toISOString(),
          end: end.toISOString()
        },
        stats: {
          totalEvents,
          productViews,
          productCustomizations,
          cartAdds,
          checkoutStarts,
          checkoutCompletes,
          conversionRate: parseFloat(conversionRate.toFixed(2)),
          cartAbandonmentRate: parseFloat(cartAbandonmentRate.toFixed(2))
        }
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas gerais:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar estatísticas gerais',
        error: error.message
      });
    }
  },
  
  /**
   * Obtém dados para o dashboard principal
   * 
   * Este método combina estatísticas reais com dados fictícios gerados
   * para demonstração do dashboard.
   * 
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   * @returns {Object} Resposta com dados do dashboard ou mensagem de erro
   */
  getDashboardData: async (req, res) => {
    try {
      // Tenta carregar dados simulados do arquivo
      const mockDataPath = path.join(__dirname, '../../utils/data/dashboard.json');
      
      // Verifica se o arquivo existe
      if (fs.existsSync(mockDataPath)) {
        console.log('✅ Usando dados simulados do arquivo para o dashboard');
        const dashboardData = JSON.parse(fs.readFileSync(mockDataPath, 'utf8'));
        
        return res.status(200).json({
          success: true,
          dashboardData
        });
      }
      
      // Se não encontrar o arquivo, usa o gerador de dados fictícios
      console.log('⚠️ Arquivo de dados simulados não encontrado, gerando dados dinamicamente');
      
      // Obtém estatísticas reais
      const realStats = await statsController._getRealStats();
      
      // Gera dados fictícios para complementar
      const mockData = statsController._generateMockData();
      
      // Combina dados reais com fictícios
      const dashboardData = {
        ...realStats,
        ...mockData
      };
      
      return res.status(200).json({
        success: true,
        dashboardData
      });
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar dados do dashboard',
        error: error.message
      });
    }
  },
  
  /**
   * Obtém estatísticas reais do banco de dados
   * 
   * Método interno para buscar estatísticas baseadas em dados reais.
   * 
   * @returns {Object} Estatísticas reais
   * @private
   */
  _getRealStats: async () => {
    // Define período padrão (últimos 30 dias)
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    try {
      // Busca produtos mais visualizados
      const topProducts = await Event.findMostViewedProducts(5, startDate, endDate);
      
      // Busca contagem de eventos por tipo
      const eventCounts = await Event.countByType(startDate, endDate);
      
      return {
        topProducts,
        eventCounts,
        period: {
          start: startDate.toISOString(),
          end: endDate.toISOString()
        }
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas reais:', error);
      return {
        topProducts: [],
        eventCounts: [],
        period: {
          start: startDate.toISOString(),
          end: endDate.toISOString()
        }
      };
    }
  },
  
  /**
   * Gera dados fictícios para demonstração
   * 
   * Método interno para criar dados de exemplo quando não há dados reais suficientes.
   * 
   * @returns {Object} Dados fictícios para o dashboard
   * @private
   */
  _generateMockData: () => {
    // Gera dados de vendas diárias para os últimos 30 dias
    const dailySales = [];
    const dailyVisitors = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Mais vendas nos fins de semana, menos nas segundas-feiras
      const dayOfWeek = date.getDay(); // 0 = Domingo, 6 = Sábado
      let baseAmount = Math.floor(Math.random() * 4500) + 500;
      
      // Ajusta baseAmount com base no dia da semana
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        // Fins de semana têm mais vendas
        baseAmount *= 1.3;
      } else if (dayOfWeek === 1) {
        // Segundas-feiras têm menos vendas
        baseAmount *= 0.7;
      }
      
      dailySales.push({
        date: dateStr,
        amount: parseFloat(baseAmount.toFixed(2))
      });
      
      dailyVisitors.push({
        date: dateStr,
        count: Math.floor(Math.random() * 450) + 50
      });
    }
    
    // Gera dados de vendas por categoria
    const categories = ['Calçados', 'Roupas', 'Acessórios', 'Eletrônicos', 'Esportes'];
    const salesByCategory = categories.map(category => ({
      category,
      sales: Math.floor(Math.random() * 9000) + 1000
    }));
    
    // Gera dados de personalização mais populares
    const customizationTypes = ['Cor', 'Tamanho', 'Material', 'Estampa'];
    const customizationValues = {
      'Cor': ['Vermelho', 'Azul', 'Preto', 'Branco', 'Verde'],
      'Tamanho': ['P', 'M', 'G', 'GG'],
      'Material': ['Algodão', 'Poliéster', 'Couro', 'Sintético'],
      'Estampa': ['Lisa', 'Estampada', 'Listrada', 'Xadrez']
    };
    
    const popularCustomizations = [];
    customizationTypes.forEach(type => {
      customizationValues[type].forEach(value => {
        popularCustomizations.push({
          type,
          value,
          count: Math.floor(Math.random() * 450) + 50
        });
      });
    });
    
    // Ordena por contagem (decrescente) e pega os 10 primeiros
    const topCustomizations = popularCustomizations
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    // Gera dados de dispositivos utilizados
    const deviceUsage = [
      { device: 'Desktop', percentage: Math.floor(Math.random() * 30) + 30 },
      { device: 'Mobile', percentage: Math.floor(Math.random() * 30) + 30 },
      { device: 'Tablet', percentage: Math.floor(Math.random() * 10) + 5 }
    ];
    
    // Ajusta percentuais para somar 100%
    const totalPercentage = deviceUsage.reduce((sum, item) => sum + item.percentage, 0);
    deviceUsage.forEach(item => {
      item.percentage = parseFloat((item.percentage / totalPercentage * 100).toFixed(2));
    });
    
    // Calcula a receita total com base nas vendas diárias
    const totalRevenue = dailySales.reduce((sum, day) => sum + day.amount, 0);
    const orderCount = Math.floor(Math.random() * 500) + 500;
    
    return {
      dailySales,
      dailyVisitors,
      salesByCategory,
      popularCustomizations: topCustomizations,
      deviceUsage,
      // Métricas gerais fictícias
      metrics: {
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        orderCount,
        averageOrderValue: parseFloat((totalRevenue / orderCount).toFixed(2)),
        returnRate: parseFloat((Math.random() * 5).toFixed(1)),
        customerSatisfaction: parseFloat((4 + Math.random()).toFixed(1))
      }
    };
  },
  
  /**
   * Obtém dados para análise de tendências
   * 
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   * @returns {Object} Resposta com dados de tendências ou mensagem de erro
   */
  getTrendsData: async (req, res) => {
    try {
      const { metric, period = '30d' } = req.query;
      
      // Define período com base no parâmetro
      let startDate, endDate = new Date();
      switch (period) {
        case '7d':
          startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startDate = new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case '1y':
          startDate = new Date(endDate.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
        default:
          startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
      
      // Tenta carregar dados simulados primeiro
      const mockDataPath = path.join(__dirname, '../../utils/data/dashboard.json');
      if (fs.existsSync(mockDataPath)) {
        const mockData = JSON.parse(fs.readFileSync(mockDataPath, 'utf8'));
        
        // Extrai dados relevantes com base na métrica solicitada
        let trendsData = [];
        
        if (metric === 'sales' && mockData.dailySales) {
          trendsData = mockData.dailySales.map(item => ({
            date: item.date,
            value: item.amount
          }));
        } else {
          // Gera dados fictícios para outras métricas
          trendsData = statsController._generateTrendsData(metric, startDate, endDate);
        }
        
        return res.status(200).json({
          success: true,
          period: {
            start: startDate.toISOString(),
            end: endDate.toISOString(),
            label: period
          },
          metric,
          trendsData
        });
      }
      
      // Gera dados de tendências (fictícios para demonstração)
      const trendsData = statsController._generateTrendsData(metric, startDate, endDate);
      
      return res.status(200).json({
        success: true,
        period: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          label: period
        },
        metric,
        trendsData
      });
    } catch (error) {
      console.error('Erro ao buscar dados de tendências:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar dados de tendências',
        error: error.message
      });
    }
  },
  
  /**
   * Gera dados fictícios para análise de tendências
   * 
   * @param {String} metric - Métrica a ser analisada
   * @param {Date} startDate - Data inicial
   * @param {Date} endDate - Data final
   * @returns {Array} Dados de tendências
   * @private
   */
  _generateTrendsData: (metric, startDate, endDate) => {
    const data = [];
    const days = Math.ceil((endDate - startDate) / (24 * 60 * 60 * 1000));
    
    // Gera valores base para cada métrica
    let baseValue, minVariation, maxVariation;
    switch (metric) {
      case 'sales':
        baseValue = 1000;
        minVariation = -200;
        maxVariation = 300;
        break;
      case 'visitors':
        baseValue = 500;
        minVariation = -100;
        maxVariation = 150;
        break;
      case 'conversion':
        baseValue = 3;
        minVariation = -0.5;
        maxVariation = 1;
        break;
      case 'customizations':
        baseValue = 200;
        minVariation = -50;
        maxVariation = 80;
        break;
      default:
        baseValue = 100;
        minVariation = -20;
        maxVariation = 30;
    }
    
    // Gera dados diários com tendência crescente
    let currentValue = baseValue;
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      // Adiciona variação aleatória com tendência crescente
      const trendFactor = i / days; // Fator que aumenta com o tempo
      const variation = Math.floor(Math.random() * (maxVariation - minVariation + 1)) + minVariation + (maxVariation * trendFactor);
      
      currentValue += variation;
      if (currentValue < 0) currentValue = 0; // Evita valores negativos
      
      data.push({
        date: date.toISOString().split('T')[0],
        value: parseFloat(currentValue.toFixed(2))
      });
    }
    
    return data;
  }
};

module.exports = statsController;
