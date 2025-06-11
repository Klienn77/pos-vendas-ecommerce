/**
 * Componente principal do Painel Administrativo
 * 
 * Este componente React implementa o painel administrativo para
 * gerenciamento de produtos, pedidos e visualização de estatísticas.
 * 
 * @module frontend/admin/AdminPanel
 */

import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import axios from 'axios';

/**
 * Painel Administrativo
 * 
 * @returns {JSX.Element} Componente React
 */
const AdminPanel = () => {
  // Estado para controle de autenticação
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Simulado como true para demonstração
  const [user, setUser] = useState({
    name: 'Administrador',
    role: 'Admin'
  });
  const [loading, setLoading] = useState(false);
  
  /**
   * Verifica se o usuário está autenticado
   * Nota: Esta é uma implementação simulada para demonstração
   */
  const checkAuth = async () => {
    try {
      setLoading(true);
      
      // Simulação de verificação de autenticação
      setTimeout(() => {
        setIsAuthenticated(true);
        setUser({
          name: 'Administrador',
          role: 'Admin'
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      setIsAuthenticated(false);
      setUser(null);
      setLoading(false);
    }
  };
  
  /**
   * Realiza o logout do usuário
   */
  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };
  
  // Efeito para verificar autenticação quando o componente é montado
  useEffect(() => {
    checkAuth();
  }, []);
  
  // Renderiza um indicador de carregamento
  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Carregando painel administrativo...</p>
      </div>
    );
  }
  
  // Renderiza o painel administrativo
  return (
    <div className="admin-panel">
      {isAuthenticated ? (
        <div className="admin-container">
          {/* Barra lateral */}
          <div className="admin-sidebar">
            <div className="admin-logo">
              <h2>E-commerce Admin</h2>
            </div>
            
            <div className="admin-user">
              <div className="user-avatar">
                {user.name.charAt(0)}
              </div>
              <div className="user-info">
                <p className="user-name">{user.name}</p>
                <p className="user-role">{user.role}</p>
              </div>
            </div>
            
            <nav className="admin-nav">
              <ul>
                <li>
                  <Link to="/">
                    <i className="icon-dashboard"></i>
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/admin">
                    <i className="icon-products"></i>
                    Produtos
                  </Link>
                </li>
                <li>
                  <Link to="/logs">
                    <i className="icon-orders"></i>
                    Logs
                  </Link>
                </li>
              </ul>
            </nav>
            
            <div className="admin-logout">
              <button onClick={logout}>
                <i className="icon-logout"></i>
                Sair
              </button>
            </div>
          </div>
          
          {/* Conteúdo principal */}
          <div className="admin-content">
            <h2>Painel Administrativo</h2>
            <p>Bem-vindo ao painel administrativo do sistema de pós-vendas.</p>
            
            <div className="admin-cards">
              <div className="admin-card">
                <h3>Produtos</h3>
                <p>Gerencie o catálogo de produtos</p>
                <div className="card-stats">
                  <span className="stat">152 produtos</span>
                  <span className="stat">12 categorias</span>
                </div>
                <Link to="/admin/products" className="card-link">Gerenciar</Link>
              </div>
              
              <div className="admin-card">
                <h3>Pedidos</h3>
                <p>Acompanhe e gerencie pedidos</p>
                <div className="card-stats">
                  <span className="stat">24 pendentes</span>
                  <span className="stat">8 hoje</span>
                </div>
                <Link to="/admin/orders" className="card-link">Visualizar</Link>
              </div>
              
              <div className="admin-card">
                <h3>Clientes</h3>
                <p>Gerencie contas de clientes</p>
                <div className="card-stats">
                  <span className="stat">543 ativos</span>
                  <span className="stat">12 novos</span>
                </div>
                <Link to="/admin/customers" className="card-link">Gerenciar</Link>
              </div>
              
              <div className="admin-card">
                <h3>Logs</h3>
                <p>Visualize logs do sistema</p>
                <div className="card-stats">
                  <span className="stat">1.2k eventos</span>
                  <span className="stat">24h atrás</span>
                </div>
                <Link to="/logs" className="card-link">Visualizar</Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="admin-login">
          <h2>Login necessário</h2>
          <p>Faça login para acessar o painel administrativo.</p>
          <button onClick={checkAuth}>Login</button>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
