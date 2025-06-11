import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Dashboard from './admin/Dashboard';
import AdminPanel from './admin/AdminPanel';
import LogViewer from './admin/LogViewer';
import './App.css';

/**
 * Componente principal da aplicação
 * 
 * Configura as rotas e estrutura da aplicação de pós-vendas.
 */
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // Simula autenticação
  useEffect(() => {
    const checkAuth = () => {
      // Simulação: autenticação sempre aprovada
      setIsAuthenticated(true);
      setUser({
        id: 'admin123',
        name: 'Administrador',
        role: 'admin'
      });
    };

    checkAuth();
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    setUser({
      id: 'admin123',
      name: 'Administrador',
      role: 'admin'
    });
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <Router>
      <div className="app-container">
        <header className="app-header">
          <div className="logo">
            <h1>Pós-Vendas</h1>
          </div>

          <nav className="main-nav">
            <ul>
              <li><Link to="/dashboard">Dashboard</Link></li>
              <li><Link to="/admin">Painel Admin</Link></li>
              <li><Link to="/logs">Logs</Link></li>
            </ul>
          </nav>

          <div className="user-info">
            {isAuthenticated ? (
              <div className="user-profile">
                <span className="user-name">{user?.name}</span>
                <button className="logout-btn" onClick={handleLogout}>
                  Sair
                </button>
              </div>
            ) : (
              <button className="login-btn" onClick={handleLogin}>
                Login
              </button>
            )}
          </div>
        </header>

        <main className="app-content">
          {isAuthenticated ? (
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/logs" element={<LogViewer />} />
              <Route path="*" element={
                <div className="not-found">
                  <h2>Página não encontrada</h2>
                  <p>A página que você está procurando não existe.</p>
                  <Link to="/">Voltar para o Dashboard</Link>
                </div>
              } />
            </Routes>
          ) : (
            <div className="login-required">
              <h2>Login Necessário</h2>
              <p>Faça login para acessar o sistema de pós-vendas.</p>
              <button className="login-btn" onClick={handleLogin}>
                Login
              </button>
            </div>
          )}
        </main>

        <footer className="app-footer">
          <p>&copy; 2025 Sistema de Pós-Vendas para E-commerce Imersivo</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
