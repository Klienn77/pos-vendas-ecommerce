# 🛠️ Sistema de Pós-Vendas – E-commerce Imersivo

Este projeto é um módulo completo de **pós-vendas** para um e-commerce, com foco em análise de dados, estatísticas e gestão administrativa. Ideal para aprimorar a experiência do cliente e dar suporte estratégico à equipe de vendas.

---

## 📐 Arquitetura do Sistema

```text
+----------------------------------+
|                                  |
|    E-commerce Imersivo           |
|    (Aplicação Principal)         |
|                                  |
+-------------+------------------+-+
              |                  |
              |                  |
              v                  v
+-------------+----+    +--------+---------+
|                  |    |                  |
|  Sistema de Logs |    |  API de Dados    |
|                  |    |                  |
+--------+---------+    +--------+---------+
         |                       |
         v                       v
+--------+---------+    +--------+---------+
|                  |    |                  |
| Banco de Dados   |<---+ Processamento    |
| de Logs (MongoDB)|    | de Estatísticas  |
|                  |    |                  |
+------------------+    +--------+---------+
                                 |
                                 v
              +-----------------+-----------------+
              |                                   |
              |                                   |
+-------------+-------------+    +----------------+-------------+
|                           |    |                              |
|  Dashboard de Estatísticas|    |  Painel Administrativo       |
|  (Frontend)               |    |  (Frontend)                  |
|                           |    |                              |
+---------------------------+    +------------------------------+


# ⚙️ Componentes Principais

## 1. Sistema de Logs
Captura e armazena eventos de interação dos usuários para análise posterior.

**Fluxo de dados:**
- O frontend envia eventos via API
- Middleware formata e armazena no MongoDB
- Dados são processados para gerar estatísticas

**Eventos principais:**
- `product_view`
- `product_customize`
- `cart_add` / `cart_remove`
- `checkout_start` / `checkout_complete`
- `recommendation_click`

---

## 2. API de Dados
Fornece endpoints RESTful para acesso aos dados estatísticos e operacionais.

**Principais endpoints:**
- `GET /api/stats/products`
- `GET /api/stats/sales`
- `GET /api/stats/users`
- `GET /api/stats/funnel`
- `GET /api/admin/products`
- `GET /api/admin/orders`

**Autenticação:**
- JWT para administradores
- Endpoints públicos para dados abertos

---

## 3. Banco de Dados
Armazena logs e estatísticas com estrutura organizada.

**Coleções:**
- `events`: logs brutos de interação
- `stats`: estatísticas pré-calculadas
- `reports`: relatórios salvos

---

## 4. Processamento de Estatísticas
Transforma dados em métricas de valor.

**Funcionalidades:**
- Agregação automática
- Indicadores de performance
- Tendências de comportamento
- Relatórios periódicos

---

## 5. Dashboard de Estatísticas
Interface gráfica para análise de dados.

**Visualizações:**
- Gráficos interativos de vendas
- Funil de conversão
- Mapa de calor de interação
- Ranking de produtos
- Métricas de engajamento

---

## 6. Painel Administrativo
Ferramenta de controle e operação do sistema.

**Funcionalidades:**
- CRUD de produtos
- Gerenciamento de pedidos
- Controle de estoque
- Visualização de métricas
- Exportação de relatórios

---

# 🚀 Tecnologias Utilizadas

- **Frontend**: React, TailwindCSS, Chart.js  
- **Backend**: Node.js, Express  
- **Banco de Dados**: MongoDB  
- **Autenticação**: JSON Web Tokens (JWT)  
- **Ferramentas**: Vite, Git, Postman

---

# 📦 Como Executar o Projeto

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/sistema-pos-vendas.git
cd sistema-pos-vendas

# Instale as dependências
npm install

# Crie o arquivo de ambiente
cp .env.example .env
# (Edite com suas variáveis de conexão MongoDB, JWT etc.)

# Rode o servidor de desenvolvimento
npm run dev

🎯 Objetivo do Projeto
Este sistema foi desenvolvido como parte de um portfólio profissional, mas pode ser facilmente adaptado para uso real em qualquer e-commerce que deseje entender melhor o comportamento de seus usuários no pós-venda.

📮 Contato
Se quiser conversar sobre esse projeto ou contratar meus serviços como desenvolvedor:

💼https://www.linkedin.com/in/fabiano-pedroso-a1110278/

📧 fabianompedroso@hotmail.com 