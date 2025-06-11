/**
 * Componente para visualização de logs do sistema
 * 
 * Este componente React implementa a visualização e análise de logs
 * do sistema de e-commerce, permitindo filtrar e analisar eventos.
 * 
 * @module frontend/admin/LogViewer
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Visualizador de Logs
 * 
 * @returns {JSX.Element} Componente React
 */
const LogViewer = () => {
  // Estados para armazenar os dados e filtros
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    startDate: format(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), // 7 dias atrás
    endDate: format(new Date(), 'yyyy-MM-dd'),
    eventType: '',
    userId: '',
    productId: '',
    severity: ''
  });
  
  /**
   * Busca os logs da API com base nos filtros
   */
  const fetchLogs = async () => {
    try {
      setLoading(true);
      
      // URL base da API a partir das variáveis de ambiente
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      
      // Faz a requisição para a API
      const response = await axios.get(`${apiUrl}/api/logs`, { params: filters });
      
      // Atualiza o estado com os logs recebidos
      setLogs(response.data.logs || []);
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar logs:', err);
      
      // Dados simulados para demonstração quando a API não está disponível
      const mockLogs = [
        {
          _id: '1',
          eventType: 'page_view',
          userId: 'user_123',
          productId: null,
          severity: 'info',
          message: 'Usuário visualizou a página inicial',
          createdAt: new Date().toISOString()
        },
        {
          _id: '2',
          eventType: 'product_view',
          userId: 'user_123',
          productId: 'prod_456',
          severity: 'info',
          message: 'Usuário visualizou produto: Tênis Esportivo',
          createdAt: new Date(Date.now() - 3600000).toISOString()
        },
        {
          _id: '3',
          eventType: 'error',
          userId: 'user_789',
          productId: null,
          severity: 'error',
          message: 'Erro ao processar pagamento',
          createdAt: new Date(Date.now() - 7200000).toISOString()
        }
      ];
      
      setLogs(mockLogs);
      setError('Usando dados simulados - API de logs não disponível no momento.');
    } finally {
      setLoading(false);
    }
  };
  
  // Efeito para buscar os logs quando o componente é montado ou os filtros mudam
  useEffect(() => {
    fetchLogs();
  }, []);
  
  /**
   * Manipula a mudança nos filtros
   * 
   * @param {Object} e - Evento de mudança
   */
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value
    }));
  };
  
  /**
   * Aplica os filtros e busca os logs
   * 
   * @param {Object} e - Evento de submissão do formulário
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    fetchLogs();
  };
  
  /**
   * Formata a data para exibição
   * 
   * @param {String} dateString - Data em formato ISO
   * @returns {String} Data formatada
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, "dd 'de' MMMM 'de' yyyy, HH:mm:ss", { locale: ptBR });
  };
  
  /**
   * Obtém a classe CSS com base na severidade do log
   * 
   * @param {String} severity - Severidade do log
   * @returns {String} Classe CSS
   */
  const getSeverityClass = (severity) => {
    switch (severity) {
      case 'error':
        return 'log-severity-error';
      case 'warning':
        return 'log-severity-warning';
      case 'info':
        return 'log-severity-info';
      default:
        return '';
    }
  };
  
  /**
   * Exporta os logs para CSV
   */
  const exportToCSV = () => {
    if (logs.length === 0) {
      alert('Não há logs para exportar.');
      return;
    }
    
    // Cabeçalhos do CSV
    const headers = ['ID', 'Tipo de Evento', 'Usuário', 'Produto', 'Severidade', 'Mensagem', 'Data'];
    
    // Linhas do CSV
    const rows = logs.map(log => [
      log._id,
      log.eventType,
      log.userId || 'N/A',
      log.productId || 'N/A',
      log.severity,
      log.message,
      log.createdAt
    ]);
    
    // Combina cabeçalhos e linhas
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Cria um blob e um link para download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `logs_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="log-viewer">
      <h1>Visualizador de Logs</h1>
      
      {/* Formulário de filtros */}
      <div className="log-filters">
        <form onSubmit={handleSubmit}>
          <div className="filter-row">
            <div className="filter-group">
              <label htmlFor="startDate">Data Inicial:</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
              />
            </div>
            
            <div className="filter-group">
              <label htmlFor="endDate">Data Final:</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
              />
            </div>
            
            <div className="filter-group">
              <label htmlFor="eventType">Tipo de Evento:</label>
              <select
                id="eventType"
                name="eventType"
                value={filters.eventType}
                onChange={handleFilterChange}
              >
                <option value="">Todos</option>
                <option value="page_view">Visualização de Página</option>
                <option value="product_view">Visualização de Produto</option>
                <option value="add_to_cart">Adição ao Carrinho</option>
                <option value="checkout">Checkout</option>
                <option value="purchase">Compra</option>
                <option value="login">Login</option>
                <option value="signup">Cadastro</option>
                <option value="error">Erro</option>
              </select>
            </div>
          </div>
          
          <div className="filter-row">
            <div className="filter-group">
              <label htmlFor="userId">ID do Usuário:</label>
              <input
                type="text"
                id="userId"
                name="userId"
                value={filters.userId}
                onChange={handleFilterChange}
                placeholder="Filtrar por ID do usuário"
              />
            </div>
            
            <div className="filter-group">
              <label htmlFor="productId">ID do Produto:</label>
              <input
                type="text"
                id="productId"
                name="productId"
                value={filters.productId}
                onChange={handleFilterChange}
                placeholder="Filtrar por ID do produto"
              />
            </div>
            
            <div className="filter-group">
              <label htmlFor="severity">Severidade:</label>
              <select
                id="severity"
                name="severity"
                value={filters.severity}
                onChange={handleFilterChange}
              >
                <option value="">Todas</option>
                <option value="info">Informação</option>
                <option value="warning">Aviso</option>
                <option value="error">Erro</option>
              </select>
            </div>
          </div>
          
          <div className="filter-actions">
            <button type="submit" className="btn-primary">Aplicar Filtros</button>
            <button type="button" className="btn-secondary" onClick={exportToCSV}>
              Exportar para CSV
            </button>
          </div>
        </form>
      </div>
      
      {/* Exibição dos logs */}
      <div className="logs-container">
        {loading ? (
          <div className="logs-loading">
            <div className="spinner"></div>
            <p>Carregando logs...</p>
          </div>
        ) : error ? (
          <div className="logs-error">
            <p>{error}</p>
            <button onClick={fetchLogs}>Tentar novamente</button>
          </div>
        ) : logs.length === 0 ? (
          <div className="logs-empty">
            <p>Nenhum log encontrado para os filtros selecionados.</p>
          </div>
        ) : (
          <table className="logs-table">
            <thead>
              <tr>
                <th>Tipo de Evento</th>
                <th>Usuário</th>
                <th>Produto</th>
                <th>Severidade</th>
                <th>Mensagem</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log._id} className={getSeverityClass(log.severity)}>
                  <td>{log.eventType}</td>
                  <td>{log.userId || 'N/A'}</td>
                  <td>{log.productId || 'N/A'}</td>
                  <td>
                    <span className={`severity-badge ${log.severity}`}>
                      {log.severity}
                    </span>
                  </td>
                  <td>{log.message}</td>
                  <td>{formatDate(log.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default LogViewer;
