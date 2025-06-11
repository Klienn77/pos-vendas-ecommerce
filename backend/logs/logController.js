/**
 * Controlador para gerenciamento de logs de eventos
 * 
 * Este controlador fornece métodos para registrar e consultar
 * eventos de interação do usuário no e-commerce.
 * 
 * @module controllers/logController
 */

const Event = require('../models/eventModel');

/**
 * Objeto que contém os métodos do controlador de logs
 */
const logController = {
  /**
   * Registra um novo evento de interação
   * 
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   * @returns {Object} Resposta com o evento registrado ou mensagem de erro
   */
  logEvent: async (req, res) => {
    try {
      const {
        eventType,
        userId,
        sessionId,
        eventData
      } = req.body;
      
      // Validação básica dos dados obrigatórios
      if (!eventType || !sessionId || !eventData) {
        return res.status(400).json({
          success: false,
          message: 'Dados incompletos. eventType, sessionId e eventData são obrigatórios.'
        });
      }
      
      // Criação do objeto de evento com dados da requisição
      const event = new Event({
        eventType,
        userId: userId || 'anonymous', // Usa 'anonymous' se userId não for fornecido
        isAuthenticated: !!userId, // Converte para booleano
        sessionId,
        eventData,
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
        pageUrl: req.body.pageUrl || '',
        referrer: req.body.referrer || ''
      });
      
      // Salva o evento no banco de dados
      await event.save();
      
      // Retorna sucesso com o evento registrado
      return res.status(201).json({
        success: true,
        message: 'Evento registrado com sucesso',
        event: {
          id: event._id,
          eventType: event.eventType,
          timestamp: event.timestamp
        }
      });
    } catch (error) {
      console.error('Erro ao registrar evento:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao registrar evento',
        error: error.message
      });
    }
  },
  
  /**
   * Obtém eventos por tipo em um período específico
   * 
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   * @returns {Object} Resposta com os eventos encontrados ou mensagem de erro
   */
  getEventsByType: async (req, res) => {
    try {
      const { type } = req.params;
      const { startDate, endDate, limit = 100 } = req.query;
      
      // Converte as strings de data para objetos Date
      const start = startDate ? new Date(startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 dias atrás por padrão
      const end = endDate ? new Date(endDate) : new Date();
      
      // Busca eventos do tipo especificado no período
      const events = await Event.findByTypeAndPeriod(type, start, end)
        .limit(parseInt(limit));
      
      return res.status(200).json({
        success: true,
        count: events.length,
        events
      });
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar eventos',
        error: error.message
      });
    }
  },
  
  /**
   * Obtém contagem de eventos agrupados por tipo
   * 
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   * @returns {Object} Resposta com a contagem de eventos por tipo ou mensagem de erro
   */
  getEventCounts: async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      // Converte as strings de data para objetos Date
      const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 dias atrás por padrão
      const end = endDate ? new Date(endDate) : new Date();
      
      // Conta eventos agrupados por tipo
      const counts = await Event.countByType(start, end);
      
      return res.status(200).json({
        success: true,
        period: {
          start: start.toISOString(),
          end: end.toISOString()
        },
        counts
      });
    } catch (error) {
      console.error('Erro ao contar eventos:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao contar eventos',
        error: error.message
      });
    }
  },
  
  /**
   * Obtém os produtos mais visualizados
   * 
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   * @returns {Object} Resposta com os produtos mais visualizados ou mensagem de erro
   */
  getMostViewedProducts: async (req, res) => {
    try {
      const { limit = 10, startDate, endDate } = req.query;
      
      // Converte as strings de data para objetos Date
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      
      // Busca produtos mais visualizados
      const products = await Event.findMostViewedProducts(parseInt(limit), start, end);
      
      return res.status(200).json({
        success: true,
        count: products.length,
        products
      });
    } catch (error) {
      console.error('Erro ao buscar produtos mais visualizados:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar produtos mais visualizados',
        error: error.message
      });
    }
  },
  
  /**
   * Obtém dados para análise de funil de conversão
   * 
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   * @returns {Object} Resposta com os dados do funil ou mensagem de erro
   */
  getFunnelData: async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      // Converte as strings de data para objetos Date
      const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 dias atrás por padrão
      const end = endDate ? new Date(endDate) : new Date();
      
      // Define os estágios do funil
      const funnelStages = [
        'product_view',
        'product_customize',
        'cart_add',
        'checkout_start',
        'checkout_complete'
      ];
      
      // Objeto para armazenar os resultados
      const funnelData = {};
      
      // Busca contagem para cada estágio do funil
      for (const stage of funnelStages) {
        const events = await Event.find({
          eventType: stage,
          timestamp: { $gte: start, $lte: end }
        }).countDocuments();
        
        funnelData[stage] = events;
      }
      
      // Calcula taxas de conversão entre estágios
      const conversionRates = {};
      for (let i = 0; i < funnelStages.length - 1; i++) {
        const currentStage = funnelStages[i];
        const nextStage = funnelStages[i + 1];
        
        const rate = funnelData[currentStage] > 0
          ? (funnelData[nextStage] / funnelData[currentStage]) * 100
          : 0;
          
        conversionRates[`${currentStage}_to_${nextStage}`] = parseFloat(rate.toFixed(2));
      }
      
      return res.status(200).json({
        success: true,
        period: {
          start: start.toISOString(),
          end: end.toISOString()
        },
        funnelData,
        conversionRates
      });
    } catch (error) {
      console.error('Erro ao buscar dados do funil:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar dados do funil',
        error: error.message
      });
    }
  }
};

module.exports = logController;
