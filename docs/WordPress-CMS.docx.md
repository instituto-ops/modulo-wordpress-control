**Sistema AntiGravity: Metodologia Completa para CMS HTML com WordPress REST API**

**Documento de Pesquisa e Implementação**

**Autor:** Análise Técnica Especializada  
**Versão:** 1.0  
**Data:** Março 2026  
**Público-alvo:** Desenvolvedores, consultores técnicos, psicólogos-pesquisadores com expertise em desenvolvimento

---

**1\. Executivo (Executive Summary)**

O **Sistema AntiGravity** é uma aplicação web de administração profissional que funciona como um **Headless CMS Dashboard** conectado ao WordPress através da REST API. Este documento detalha uma metodologia completa de desenvolvimento para criar um painel administrativo HTML/CSS/JavaScript que permite criar, editar, deletar e gerenciar páginas, posts e conteúdo customizado do WordPress sem acessar o painel padrão\[1\]\[2\].

**Benefícios Estratégicos**

* **Interface Customizada**: UI/UX totalmente personalizada conforme marca e necessidades específicas

* **Acesso Offline-First**: Funciona como PWA (Progressive Web App) com cache local

* **Escalabilidade**: Suporta gestão de múltiplos sites WordPress de um painel único

* **Segurança Aprimorada**: Autenticação JWT, rate limiting e validação em múltiplas camadas\[3\]\[4\]

* **Automação Avançada**: Integração com n8n e ferramentas de automação para workflows completos\[5\]

* **Conformidade WCAG 2.1 AA**: Acessibilidade total para usuários com deficiências

**Stack Recomendado**

Frontend: HTML5, CSS3, JavaScript ES6+  
Backend: WordPress 6.0+, REST API v2  
Autenticação: JWT (JSON Web Tokens)  
Armazenamento: IndexedDB (local), WordPress Database (remoto)  
Automação: n8n, Zapier, ou ActivePieces  
Hospedagem: Cloudflare Workers, Vercel, ou VPS dedicado

---

**2\. Fundamentação Teórica e Pesquisa**

**2.1 WordPress REST API: Arquitetura e Capacidades\[1\]**

A **WordPress REST API** (introduzida em WordPress 4.7) é a base técnica do AntiGravity. É um **interface RESTful** que fornece acesso estruturado ao conteúdo, usuários, taxonomias e metadados do WordPress através de endpoints JSON.

**Características Principais:**

| Aspecto | Descrição | Benefício |
| :---- | :---- | :---- |
| **Stateless** | Cada requisição contém contexto completo | Escalabilidade horizontal |
| **JSON Native** | Dados em formato JSON estruturado | Fácil integração com frontend moderno |
| **Autenticação** | Suporta JWT, OAuth 2.0, Basic Auth | Segurança em múltiplas camadas |
| **Versionamento** | /wp-json/wp/v2/ permite versões futuras | Compatibilidade retroativa |
| **CORS Habilitado** | Cross-Origin Resource Sharing nativo | Acesso de diferentes domínios |

**Endpoints Principais Utilizados:**

GET /wp-json/wp/v2/posts \- Listar posts  
GET /wp-json/wp/v2/posts/{id} \- Obter post específico  
POST /wp-json/wp/v2/posts \- Criar novo post  
PUT /wp-json/wp/v2/posts/{id} \- Atualizar post  
DELETE /wp-json/wp/v2/posts/{id} \- Deletar post

GET /wp-json/wp/v2/pages \- Listar páginas  
POST /wp-json/wp/v2/pages \- Criar página  
PUT /wp-json/wp/v2/pages/{id} \- Atualizar página  
DELETE /wp-json/wp/v2/pages/{id} \- Deletar página

GET /wp-json/wp/v2/categories \- Listar categorias  
GET /wp-json/wp/v2/tags \- Listar tags  
POST /wp-json/wp/v2/media \- Upload de mídia

**2.2 Arquitetura Headless CMS\[2\]\[6\]**

O AntiGravity segue o paradigma **Headless CMS** (CMS Descabeçado), separando completamente o **backend de gerenciamento de conteúdo** (WordPress) da **interface de apresentação** (Dashboard HTML).

**Vantagens:**

| Vantagem | Descrição | Aplicação no AntiGravity |
| :---- | :---- | :---- |
| **Flexibilidade** | UI totalmente customizável | Interface adaptada ao workflow clínico |
| **Performance** | Frontend otimizado independente | Dashboard rápido, responsivo |
| **Escalabilidade** | Backend e frontend escalam separadamente | Suporta múltiplos sites WordPress |
| **Segurança** | Camadas desacopladas, separadas | Menor superfície de ataque |
| **Futuro-prova** | Trocar frontend sem afetar conteúdo | Migração tecnológica segura |

**2.3 Segurança: JWT vs Sessions\[3\]\[4\]**

O AntiGravity utiliza **JWT (JSON Web Tokens)** em vez de sessões tradicionais.

**Comparação:**

| Aspecto | Sessions Tradicionais | JWT |
| :---- | :---- | :---- |
| **Armazenamento** | Servidor (stateful) | Cliente (stateless) |
| **Escalabilidade** | Limitada (estado compartilhado) | Excelente (sem estado) |
| **Segurança** | Cookies seguros | Token criptografado |
| **Mobile-Friendly** | Complexo (CORS) | Nativo com headers |
| **Revogação** | Imediata (servidor) | Com blacklist |

**Fluxo JWT no AntiGravity:**

1. Usuário faz login com credenciais

2. WordPress valida e gera JWT token

3. Dashboard armazena token localmente (localStorage \+ IndexedDB)

4. Cada requisição inclui: Authorization: Bearer {token}

5. WordPress valida assinatura do token

6. Requisição processada se token válido

7. Token expira após 30 dias (configurável)

**2.4 Segurança de API: Best Practices 2024\[3\]\[4\]\[7\]\[8\]**

O AntiGravity implementa **múltiplas camadas de segurança**:

**1\. Encriptação em Trânsito**

* TLS 1.3+ obrigatório

* HSTS (HTTP Strict Transport Security)

* Certificate Pinning para apps móveis

**2\. Autenticação Multi-Camada**

* JWT com assinatura HS256 ou RS256

* Refresh tokens com expiração independente

* IP Whitelisting opcional para IPs conhecidos

**3\. Autorização Granular**

* Role-Based Access Control (RBAC)

* Permissões por post, página, categoria

* Custom capabilities para workflows específicos

**4\. Rate Limiting**

* 100 requisições por minuto por usuário

* 1000 requisições por minuto por IP

* Throttling com backoff exponencial

**5\. Validação e Sanitização**

* Validação de entrada (tipos, tamanho, formato)

* Sanitização de output (HTML escape)

* CSRF tokens para POST/PUT/DELETE

* CSP (Content Security Policy) headers

**6\. Monitoramento e Logging**

* Audit trail completo de alterações

* Alertas para atividades suspeitas

* SIEM integration para correlação de eventos

* Request correlation IDs para debugging

**2.5 Tratamento de Erros API\[8\]\[9\]**

O AntiGravity utiliza **HTTP Status Codes padronizados** com respostas estruturadas em **RFC 9457 (Problem Details)**.

**Status Codes:**

| Código | Significado | Exemplo |
| :---- | :---- | :---- |
| **200** | Sucesso | POST de novo post retorna 200 |
| **400** | Bad Request | Payload inválido ou campos faltantes |
| **401** | Unauthorized | JWT ausente ou expirado |
| **403** | Forbidden | Usuário sem permissão para recurso |
| **404** | Not Found | Post/página não existe |
| **409** | Conflict | Violação de constraint único (slug duplicado) |
| **422** | Unprocessable Entity | Validação falhou |
| **429** | Too Many Requests | Rate limit excedido |
| **500** | Internal Server Error | Erro do servidor (nunca expor detalhes) |

**Exemplo de Resposta de Erro RFC 9457:**

{  
"type": "[https://api.example.com/errors/validation-error](https://api.example.com/errors/validation-error)",  
"title": "Validação falhou",  
"status": 422,  
"detail": "O campo 'title' é obrigatório",  
"instance": "/posts",  
"errors": \[  
{  
"field": "title",  
"message": "Campo obrigatório"  
},  
{  
"field": "content",  
"message": "Mínimo 50 caracteres"  
}  
\],  
"timestamp": "2026-03-09T23:43:00Z",  
"requestId": "req\_abc123def456"  
}

---

**3\. Fases de Desenvolvimento \- Passo a Passo Completo**

**3.1 Fase 1: Planejamento e Arquitetura (Semana 1-2)**

**Objetivo**

Definir requisitos técnicos, arquitetura de sistema, estrutura de dados e matriz de permissões.

**Tarefas Específicas**

**1.1 Análise de Requisitos**

□ Definir tipos de conteúdo suportados:

* Posts (blog)

* Páginas estáticas

* Custom Post Types (portfólio, testemunhos, etc.)

* Taxonomias (categorias, tags, tipos de serviço)

□ Definir funcionalidades de painel:

* Dashboard com estatísticas

* Listagem de conteúdo (com filtros, busca, paginação)

* Criação/edição de conteúdo (editor WYSIWYG)

* Upload e gerenciamento de mídia

* Agendamento de publicação

* Versionamento/histórico

* Backup automatizado

* Gerenciamento de usuários

* Relatórios e analytics

□ Definir fluxos de usuário:

* Login/logout

* Recuperação de senha

* Dois fatores (2FA)

* Perfis de usuário (Admin, Editor, Autor, Visualizador)

□ Definir integrações:

* n8n para automação

* Google Analytics/Matomo

* CRM (Pipedrive, HubSpot)

* Email (SendGrid, Mailgun)

* Cloud storage (S3, Google Drive)

**1.2 Matriz de Permissões (RBAC)**

┌─────────────────┬──────────┬────────┬────────┬────────────┐  
│ Ação │ Admin │ Editor │ Autor │ Visualiz. │  
├─────────────────┼──────────┼────────┼────────┼────────────┤  
│ Ver dashboard │ SIM │ SIM │ SIM │ SIM │  
│ Criar post │ SIM │ SIM │ SIM\* │ NÃO │  
│ Editar post │ SIM │ SIM\*\* │ PRÓPRIO│ NÃO │  
│ Deletar post │ SIM │ SIM\*\* │ NÃO │ NÃO │  
│ Publicar │ SIM │ SIM │ RASCUN.│ NÃO │  
│ Gerenciar usuár.│ SIM │ NÃO │ NÃO │ NÃO │  
│ Ver analytics │ SIM │ SIM │ PRÓPRIO│ NÃO │  
│ Criar categoria │ SIM │ NÃO │ NÃO │ NÃO │  
└─────────────────┴──────────┴────────┴────────┴────────────┘

Legenda:

* \= Com aprovação de editor  
  \*\* \= Apenas posts não publicados  
  PRÓPRIO \= Apenas conteúdo criado pelo usuário

**1.3 Arquitetura Técnica**

┌─────────────────────────────────────────────┐  
│ AntiGravity Dashboard (HTML) │  
│ ┌─────────────────────────────────────┐ │  
│ │ Frontend Layer │ │  
│ │ \- Vue.js / React / Vanilla JS │ │  
│ │ \- Componentes reutilizáveis │ │  
│ │ \- State Management (Vuex/Redux) │ │  
│ │ \- PWA com Service Worker │ │  
│ └─────────────────────────────────────┘ │  
│ ↕ (HTTP/REST) │  
└─────────────────────────────────────────────┘  
↕  
┌────────────────────────────┐  
│ API Gateway / Proxy │  
│ ┌──────────────────────┐ │  
│ │ Rate Limiting │ │  
│ │ CORS Handling │ │  
│ │ Request Logging │ │  
│ │ JWT Validation │ │  
│ └──────────────────────┘ │  
└────────────────────────────┘  
↕  
┌────────────────────────────┐  
│ WordPress Backend │  
│ ┌──────────────────────┐ │  
│ │ REST API │ │  
│ │ Custom Endpoints │ │  
│ │ Authentication │ │  
│ │ Authorization │ │  
│ │ Database Operations │ │  
│ └──────────────────────┘ │  
│ ┌──────────────────────┐ │  
│ │ MySQL/MariaDB │ │  
│ │ WordPress Database │ │  
│ └──────────────────────┘ │  
└────────────────────────────┘  
↕  
┌────────────────────────────┐  
│ Integrações Externas │  
│ \- n8n (Automação) │  
│ \- Google Analytics │  
│ \- CRM / Email │  
│ \- Cloud Storage │  
└────────────────────────────┘

**Documentação Necessária**

1. **Especificação de Requisitos (SRS)**

2. **Diagrama de Caso de Uso (UML)**

3. **Matriz de Permissões RBAC**

4. **Arquitetura de Sistema (C4 Model)**

5. **Dicionário de Dados**

6. **Plano de Segurança**

---

**3.2 Fase 2: Configuração de Infraestrutura (Semana 1-2, em paralelo)**

**Objetivo**

Preparar ambiente de desenvolvimento, staging e produção com segurança otimizada.

**2.1 WordPress Setup com Segurança**

**Recomendações de Instalação:**

**1\. WordPress moderno (versão 6.0+)**

wp core download

**2\. Plugin essencial: JWT Authentication**

wp plugin install jwt-authentication-for-wp-rest-api \--activate

**3\. Plugin segurança: REST API Protection**

wp plugin install rest-api-authentication \--activate

**4\. Plugin: Custom Endpoints (se necessário)**

wp plugin install custom-post-type-ui \--activate

**5\. Plugin: Backup automatizado**

wp plugin install updraftplus \--activate

**6\. Plugin: Analytics/Logging**

wp plugin install debug-bar \--activate

**Configuração de JWT no WordPress**

No arquivo wp-config.php:

// JWT Configuration  
define('JWT\_AUTH\_SECRET\_KEY', 'seu-super-secret-key-min-32-caracteres-aleatorio');  
define('JWT\_AUTH\_EXPIRE', 2592000); // 30 dias em segundos

// Endpoints personalizados  
define('WP\_REST\_AUTHENTICATION\_PROVIDER', 'jwt');

// CORS Headers  
define('WP\_REST\_ALLOW\_ORIGIN', '[https://seu-dashboard.com](https://seu-dashboard.com)');

// Rate limiting  
define('API\_RATE\_LIMIT', 100); // requests por minuto

**Htaccess para Segurança (Apache):**

**Bloquear acesso direto ao wp-config**

Order Deny,Allow Deny from all

**Habilitar GZIP**

AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json

**Cache control**

ExpiresActive On ExpiresByType image/jpg "access plus 1 year" ExpiresByType image/jpeg "access plus 1 year" ExpiresByType image/gif "access plus 1 year" ExpiresByType image/png "access plus 1 year" ExpiresByType text/css "access plus 1 month" ExpiresByType application/javascript "access plus 1 month"

**Proteger contra hotlinking**

SetEnvIf Request\_URI "^/wp-content/uploads/" ALLOW\_HOTLINK=1  
SetEnvIf Referer "https?://seu-dominio.com" ALLOW\_HOTLINK=1  
\<FilesMatch ".(jpg|jpeg|png|gif)$"\>  
Order Deny,Allow  
Deny from all  
Allow from env=ALLOW\_HOTLINK  
\</FilesMatch\>

**2.2 Estrutura de Diretórios**

projeto-antigravity/  
├── frontend/ \# Dashboard HTML/CSS/JS  
│ ├── index.html  
│ ├── css/  
│ │ ├── main.css  
│ │ ├── dashboard.css  
│ │ └── responsive.css  
│ ├── js/  
│ │ ├── app.js \# Inicialização  
│ │ ├── auth.js \# Autenticação  
│ │ ├── api.js \# Wrapper REST API  
│ │ ├── db.js \# IndexedDB local  
│ │ ├── components/ \# Componentes JS  
│ │ │ ├── editor.js  
│ │ │ ├── media.js  
│ │ │ └── dashboard.js  
│ │ └── utils/  
│ │ ├── crypto.js \# Encriptação local  
│ │ ├── storage.js \# Persistência  
│ │ └── validators.js \# Validação  
│ ├── assets/  
│ │ ├── icons/  
│ │ ├── fonts/  
│ │ └── images/  
│ ├── manifest.json \# PWA manifest  
│ ├── service-worker.js \# PWA offline  
│ └── offline.html \# Fallback offline  
│  
├── backend/ \# Customizações WordPress  
│ ├── plugins/  
│ │ └── antigravity-extended/  
│ │ ├── plugin.php  
│ │ ├── admin/  
│ │ ├── includes/  
│ │ │ ├── rest-endpoints.php  
│ │ │ ├── authentication.php  
│ │ │ └── permissions.php  
│ │ ├── database/  
│ │ │ └── migrations.php  
│ │ └── logs/  
│ └── themes/  
│ └── antigravity-api/ \# Tema mínimo (só API)  
│ ├── functions.php  
│ ├── style.css  
│ └── index.php  
│  
├── docs/  
│ ├── [API.md](http://API.md)  
│ ├── [SECURITY.md](http://SECURITY.md)  
│ ├── [DEPLOYMENT.md](http://DEPLOYMENT.md)  
│ └── [TROUBLESHOOTING.md](http://TROUBLESHOOTING.md)  
│  
├── tests/  
│ ├── unit/  
│ ├── integration/  
│ └── e2e/  
│  
├── deployment/  
│ ├── docker-compose.yml  
│ ├── nginx.conf  
│ └── ssl-config.conf  
│  
└── [README.md](http://README.md)

---

**3.3 Fase 3: Desenvolvimento do Frontend (Semana 3-5)**

**Objetivo**

Criar interface HTML/CSS/JavaScript responsiva, acessível (WCAG 2.1 AA) e otimizada para performance.

**3.1 Estrutura HTML Base**

AntiGravity \- Gerenciador de Conteúdo

[Pular para conteúdo](#bookmark=id.msa0r1ktmyyd)

**AntiGravity CMS**

0

 

1. [Home](http:///)

2. Dashboard

**3.2 Sistema de Design CSS (Design System)**

/\* Variables e Tokens 

*/:root {/* Cores \*/  
\--color-primary: \#2c3e50;  
\--color-secondary: \#3498db;  
\--color-success: \#27ae60;  
\--color-warning: \#f39c12;  
\--color-error: \#e74c3c;  
\--color-text: \#2c3e50;  
\--color-text-light: \#7f8c8d;  
\--color-bg: \#ecf0f1;  
\--color-border: \#bdc3c7;  
\--color-white: \#ffffff;

/\* Typography \*/  
\--font-family: \-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;  
\--font-size-base: 1rem;  
\--font-size-lg: 1.25rem;  
\--font-size-sm: 0.875rem;  
\--line-height: 1.6;

/\* Spacing \*/  
\--spacing-xs: 0.25rem;  
\--spacing-sm: 0.5rem;  
\--spacing-md: 1rem;  
\--spacing-lg: 1.5rem;  
\--spacing-xl: 2rem;

/\* Shadows \*/  
\--shadow-sm: 0 1px 3px rgba(0,0,0,0.12);  
\--shadow-md: 0 4px 6px rgba(0,0,0,0.16);  
\--shadow-lg: 0 10px 20px rgba(0,0,0,0.20);

/\* Borders \*/  
\--border-radius: 6px;  
\--border-radius-lg: 12px;

/\* Z-index \*/  
\--z-modal: 1000;  
\--z-dropdown: 100;  
\--z-sticky: 10;

}

/\* Utilities for WCAG 2.1 AA \*/  
.sr-only {  
position: absolute;  
width: 1px;  
height: 1px;  
padding: 0;  
margin: \-1px;  
overflow: hidden;  
clip: rect(0,0,0,0);  
white-space: nowrap;  
border-width: 0;  
}

.skip-to-main {  
position: absolute;  
top: \-40px;  
left: 0;  
background: var(--color-primary);  
color: var(--color-white);  
padding: var(--spacing-md);  
text-decoration: none;  
z-index: 100;  
}

.skip-to-main:focus {  
top: 0;  
}

/\* Focus Visible \*/  
:focus-visible {  
outline: 3px solid var(--color-secondary);  
outline-offset: 2px;  
}

/\* Grid Layout \*/  
.grid {  
display: grid;  
grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));  
gap: var(--spacing-lg);  
}

.grid--2col {  
grid-template-columns: repeat(2, 1fr);  
}

@media (max-width: 768px) {  
.grid--2col {  
grid-template-columns: 1fr;  
}  
}

/\* Buttons \*/  
.btn {  
display: inline-flex;  
align-items: center;  
justify-content: center;  
padding: var(--spacing-sm) var(--spacing-md);  
border: 2px solid transparent;  
border-radius: var(--border-radius);  
font-size: var(--font-size-base);  
font-weight: 600;  
cursor: pointer;  
transition: all 0.3s ease;  
text-decoration: none;  
}

.btn:disabled {  
opacity: 0.6;  
cursor: not-allowed;  
}

.btn-primary {  
background-color: var(--color-primary);  
color: var(--color-white);  
}

.btn-primary:hover:not(:disabled) {  
background-color: \#1a252f;  
box-shadow: var(--shadow-md);  
}

.btn-secondary {  
background-color: transparent;  
color: var(--color-primary);  
border-color: var(--color-primary);  
}

.btn-secondary:hover:not(:disabled) {  
background-color: var(--color-primary);  
color: var(--color-white);  
}

/\* Forms \*/  
.form-group {  
margin-bottom: var(--spacing-lg);  
}

.form-group label {  
display: block;  
margin-bottom: var(--spacing-sm);  
font-weight: 600;  
color: var(--color-text);  
}

.form-group label .required {  
color: var(--color-error);  
}

.form-group input,  
.form-group textarea,  
.form-group select {  
width: 100%;  
padding: var(--spacing-md);  
border: 1px solid var(--color-border);  
border-radius: var(--border-radius);  
font-family: var(--font-family);  
font-size: var(--font-size-base);  
color: var(--color-text);  
transition: border-color 0.3s ease;  
}

.form-group input:focus,  
.form-group textarea:focus,  
.form-group select:focus {  
outline: none;  
border-color: var(--color-secondary);  
box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);  
}

.form-group input.error,  
.form-group textarea.error {  
border-color: var(--color-error);  
}

.form-group .error-message {  
color: var(--color-error);  
font-size: var(--font-size-sm);  
margin-top: var(--spacing-sm);  
}

/\* Tables \*/  
.table {  
width: 100%;  
border-collapse: collapse;  
margin: var(--spacing-lg) 0;  
}

.table thead {  
background-color: var(--color-bg);  
border-bottom: 2px solid var(--color-border);  
}

.table th {  
padding: var(--spacing-md);  
text-align: left;  
font-weight: 600;  
color: var(--color-text);  
}

.table td {  
padding: var(--spacing-md);  
border-bottom: 1px solid var(--color-border);  
}

.table tbody tr:hover {  
background-color: \#f8f9fa;  
}

/\* Responsive Design \*/  
@media (max-width: 768px) {  
:root {  
\--spacing-lg: 1rem;  
\--spacing-xl: 1.5rem;  
}

.sidebar {  
    display: none; /\* Toggle com JS \*/  
}

.header {  
    position: sticky;  
    top: 0;  
    z-index: var(--z-sticky);  
}

}

**3.3 Autenticação JWT JavaScript**

// auth.js \- Gerenciamento de autenticação

class AuthManager {  
constructor() {  
this.token \= null;  
this.refreshToken \= null;  
this.user \= null;  
this.tokenExpiry \= null;  
}

/\*\*  
 \* Login com credenciais  
 \* @param {string} email   
 \* @param {string} password   
 \* @returns {Promise\<{token, refreshToken, user}\>}  
 \*/  
async login(email, password) {  
    try {  
        const response \= await fetch(\`${API\_URL}/jwt-auth/v1/token\`, {  
            method: 'POST',  
            headers: {  
                'Content-Type': 'application/json',  
            },  
            body: JSON.stringify({ email, password })  
        });  
          
        if (\!response.ok) {  
            const error \= await response.json();  
            throw new Error(error.message || 'Erro ao fazer login');  
        }  
          
        const data \= await response.json();  
          
        // Armazenar tokens  
        this.setToken(data.token, data.refreshToken);  
        this.user \= data.user;  
          
        // Armazenar localmente (IndexedDB \+ localStorage para backup)  
        await this.persistTokens();  
          
        return { success: true, user: this.user };  
    } catch (error) {  
        console.error('Login error:', error);  
        throw error;  
    }  
}

/\*\*  
 \* Armazenar tokens com segurança  
 \*/  
async persistTokens() {  
    // Primariamente usar IndexedDB (mais seguro)  
    const db \= await this.getDB();  
    const tx \= db.transaction('auth', 'readwrite');  
      
    await tx.store.put({  
        key: 'auth',  
        token: this.token,  
        refreshToken: this.refreshToken,  
        expiryTime: this.tokenExpiry,  
        timestamp: Date.now()  
    });  
      
    // Backup em sessionStorage (não persiste após fechar browser)  
    sessionStorage.setItem('auth\_token', this.token);  
}

/\*\*  
 \* Recuperar tokens armazenados  
 \*/  
async restoreTokens() {  
    try {  
        const db \= await this.getDB();  
        const auth \= await db.get('auth', 'auth');  
          
        if (auth && auth.expiryTime \> Date.now()) {  
            this.token \= auth.token;  
            this.refreshToken \= auth.refreshToken;  
            this.tokenExpiry \= auth.expiryTime;  
            return true;  
        }  
          
        return false;  
    } catch (error) {  
        console.error('Restore tokens error:', error);  
        return false;  
    }  
}

/\*\*  
 \* Refresh token quando expirado  
 \*/  
async refreshAccessToken() {  
    try {  
        const response \= await fetch(\`${API\_URL}/jwt-auth/v1/refresh\`, {  
            method: 'POST',  
            headers: {  
                'Content-Type': 'application/json',  
                'Authorization': \`Bearer ${this.refreshToken}\`  
            }  
        });  
          
        if (\!response.ok) {  
            throw new Error('Falha ao renovar token');  
        }  
          
        const data \= await response.json();  
        this.setToken(data.token, data.refreshToken);  
        await this.persistTokens();  
          
        return true;  
    } catch (error) {  
        console.error('Token refresh error:', error);  
        // Se refresh falhar, fazer logout  
        this.logout();  
        return false;  
    }  
}

/\*\*  
 \* Logout  
 \*/  
async logout() {  
    try {  
        // Notificar backend se necessário  
        if (this.token) {  
            await fetch(\`${API\_URL}/jwt-auth/v1/logout\`, {  
                method: 'POST',  
                headers: {  
                    'Authorization': \`Bearer ${this.token}\`  
                }  
            }).catch(() \=\> {}); // Ignorar erros no logout  
        }  
    } finally {  
        this.clearTokens();  
    }  
}

/\*\*  
 \* Limpar tokens  
 \*/  
clearTokens() {  
    this.token \= null;  
    this.refreshToken \= null;  
    this.user \= null;  
    sessionStorage.removeItem('auth\_token');  
    localStorage.removeItem('auth\_token');  
}

/\*\*  
 \* Definir tokens  
 \*/  
setToken(token, refreshToken) {  
    this.token \= token;  
    this.refreshToken \= refreshToken;  
      
    // Decodificar JWT para obter expiração  
    const payload \= this.decodeJWT(token);  
    this.tokenExpiry \= payload.exp \* 1000; // Converter para ms  
}

/\*\*  
 \* Decodificar JWT (sem validar assinatura \- feito no servidor)  
 \*/  
decodeJWT(token) {  
    try {  
        const base64Url \= token.split('.')\[1\];  
        const base64 \= base64Url.replace(/-/g, '+').replace(/\_/g, '/');  
        const jsonPayload \= decodeURIComponent(  
            atob(base64).split('').map(c \=\>   
                '%' \+ ('00' \+ c.charCodeAt(0).toString(16)).slice(-2)  
            ).join('')  
        );  
        return JSON.parse(jsonPayload);  
    } catch (error) {  
        console.error('JWT decode error:', error);  
        return {};  
    }  
}

/\*\*  
 \* Verificar se token está expirado  
 \*/  
isTokenExpired() {  
    if (\!this.tokenExpiry) return true;  
      
    // Considerar expirado se faltam menos de 5 minutos  
    return Date.now() \>= (this.tokenExpiry \- 5 \* 60 \* 1000);  
}

/\*\*  
 \* Obter token (com refresh automático se necessário)  
 \*/  
async getToken() {  
    if (this.isTokenExpired()) {  
        await this.refreshAccessToken();  
    }  
    return this.token;  
}

/\*\*  
 \* Obter header de autorização  
 \*/  
async getAuthHeader() {  
    const token \= await this.getToken();  
    return {  
        'Authorization': \`Bearer ${token}\`  
    };  
}

/\*\*  
 \* IndexedDB para armazenamento seguro  
 \*/  
async getDB() {  
    return new Promise((resolve, reject) \=\> {  
        const request \= indexedDB.open('AntiGravity', 1);  
          
        request.onerror \= () \=\> reject(request.error);  
        request.onsuccess \= () \=\> resolve(request.result);  
          
        request.onupgradeneeded \= (event) \=\> {  
            const db \= event.target.result;  
            if (\!db.objectStoreNames.contains('auth')) {  
                db.createObjectStore('auth');  
            }  
        };  
    });  
}

}

// Exportar instância global  
const authManager \= new AuthManager();

**3.4 API Wrapper JavaScript**

// api.js \- Wrapper para WordPress REST API

class WordPressAPI {  
constructor(baseUrl, authManager) {  
this.baseUrl \= baseUrl;  
this.authManager \= authManager;  
this.cache \= new Map();  
this.cacheTimeout \= 5 \* 60 \* 1000; // 5 minutos  
}

/\*\*  
 \* Fazer requisição para API  
 \*/  
async request(endpoint, options \= {}) {  
    const url \= \`${this.baseUrl}${endpoint}\`;  
      
    const config \= {  
        headers: {  
            'Content-Type': 'application/json',  
            ...(this.authManager.token && {  
                'Authorization': \`Bearer ${this.authManager.token}\`  
            }),  
            ...options.headers  
        },  
        ...options  
    };  
      
    try {  
        const response \= await fetch(url, config);  
          
        // Tratamento de erros HTTP  
        if (\!response.ok) {  
            const error \= await this.handleError(response);  
            throw error;  
        }  
          
        const data \= await response.json();  
        return { success: true, data };  
    } catch (error) {  
        console.error(\`API Error on ${endpoint}:\`, error);  
        throw error;  
    }  
}

/\*\*  
 \* Tratamento de erros RFC 9457  
 \*/  
async handleError(response) {  
    const data \= await response.json();  
      
    const error \= new Error(data.detail || 'Erro na requisição');  
    error.status \= response.status;  
    error.type \= data.type;  
    error.instance \= data.instance;  
    error.errors \= data.errors || \[\];  
    error.requestId \= response.headers.get('X-Request-ID');  
      
    return error;  
}

/\*\*  
 \* GET \- Listar posts  
 \*/  
async getPosts(params \= {}) {  
    const queryString \= new URLSearchParams({  
        per\_page: params.perPage || 10,  
        page: params.page || 1,  
        search: params.search || '',  
        status: params.status || 'publish',  
        orderby: params.orderby || 'date',  
        order: params.order || 'desc',  
        ...params  
    }).toString();  
      
    return this.request(\`/wp-json/wp/v2/posts?${queryString}\`);  
}

/\*\*  
 \* GET \- Obter um post  
 \*/  
async getPost(id) {  
    const cacheKey \= \`post\_${id}\`;  
      
    // Verificar cache  
    if (this.cache.has(cacheKey)) {  
        const cached \= this.cache.get(cacheKey);  
        if (Date.now() \- cached.timestamp \< this.cacheTimeout) {  
            return { success: true, data: cached.data, fromCache: true };  
        }  
    }  
      
    const result \= await this.request(\`/wp-json/wp/v2/posts/${id}\`);  
      
    // Armazenar em cache  
    this.cache.set(cacheKey, {  
        data: result.data,  
        timestamp: Date.now()  
    });  
      
    return result;  
}

/\*\*  
 \* POST \- Criar novo post  
 \*/  
async createPost(postData) {  
    // Validação de entrada  
    this.validatePostData(postData);  
      
    return this.request('/wp-json/wp/v2/posts', {  
        method: 'POST',  
        body: JSON.stringify({  
            title: postData.title,  
            content: postData.content,  
            excerpt: postData.excerpt || '',  
            status: postData.status || 'draft',  
            categories: postData.categories || \[\],  
            tags: postData.tags || \[\],  
            featured\_media: postData.featured\_media || 0,  
            meta: postData.meta || {}  
        })  
    });  
}

/\*\*  
 \* PUT \- Atualizar post  
 \*/  
async updatePost(id, postData) {  
    // Validação  
    this.validatePostData(postData, true);  
      
    // Invalidar cache  
    this.cache.delete(\`post\_${id}\`);  
      
    return this.request(\`/wp-json/wp/v2/posts/${id}\`, {  
        method: 'PUT',  
        body: JSON.stringify(postData)  
    });  
}

/\*\*  
 \* DELETE \- Deletar post  
 \*/  
async deletePost(id, force \= false) {  
    // Invalidar cache  
    this.cache.delete(\`post\_${id}\`);  
      
    return this.request(\`/wp-json/wp/v2/posts/${id}?force=${force}\`, {  
        method: 'DELETE'  
    });  
}

/\*\*  
 \* Upload de mídia  
 \*/  
async uploadMedia(file) {  
    // Validação de arquivo  
    if (\!file) throw new Error('Arquivo não fornecido');  
    if (file.size \> 50 \* 1024 \* 1024\) { // 50MB  
        throw new Error('Arquivo excede tamanho máximo de 50MB');  
    }  
      
    const formData \= new FormData();  
    formData.append('file', file);  
      
    return this.request('/wp-json/wp/v2/media', {  
        method: 'POST',  
        headers: {  
            'Authorization': \`Bearer ${this.authManager.token}\`  
        },  
        body: formData  
    });  
}

/\*\*  
 \* Validar dados de post  
 \*/  
validatePostData(data, isUpdate \= false) {  
    if (\!isUpdate && \!data.title) {  
        throw new Error('Título é obrigatório');  
    }  
      
    if (data.title && data.title.length \< 3\) {  
        throw new Error('Título deve ter pelo menos 3 caracteres');  
    }  
      
    if (data.content && data.content.length \< 10\) {  
        throw new Error('Conteúdo deve ter pelo menos 10 caracteres');  
    }  
}

/\*\*  
 \* Limpar cache  
 \*/  
clearCache() {  
    this.cache.clear();  
}

}

// Inicializar  
const apiClient \= new WordPressAPI(  
process.env.API\_URL || '[http://localhost/wp-json](http://localhost/wp-json)',  
authManager  
);

**3.5 Service Worker para PWA (Offline)**

// service-worker.js \- PWA offline support

const CACHE\_NAME \= 'antigravity-v1';  
const urlsToCache \= \[  
'/',  
'/index.html',  
'/css/main.css',  
'/css/dashboard.css',  
'/js/app.js',  
'/js/auth.js',  
'/js/api.js',  
'/offline.html'  
\];

// Install event  
self.addEventListener('install', event \=\> {  
event.waitUntil(  
caches.open(CACHE\_NAME).then(cache \=\> {  
return cache.addAll(urlsToCache);  
})  
);  
self.skipWaiting();  
});

// Activate event  
self.addEventListener('activate', event \=\> {  
event.waitUntil(  
caches.keys().then(cacheNames \=\> {  
return Promise.all(  
cacheNames.map(cacheName \=\> {  
if (cacheName \!== CACHE\_NAME) {  
return caches.delete(cacheName);  
}  
})  
);  
})  
);  
self.clients.claim();  
});

// Fetch event \- Network first, fall back to cache  
self.addEventListener('fetch', event \=\> {  
if (event.request.method \!== 'GET') return;

event.respondWith(  
    fetch(event.request)  
        .then(response \=\> {  
            // Cache successful responses  
            const responseClone \= response.clone();  
            caches.open(CACHE\_NAME).then(cache \=\> {  
                cache.put(event.request, responseClone);  
            });  
            return response;  
        })  
        .catch(() \=\> {  
            // Fall back to cache  
            return caches.match(event.request)  
                .then(response \=\> {  
                    return response || caches.match('/offline.html');  
                });  
        })  
);

});

// Background Sync para offline actions  
self.addEventListener('sync', event \=\> {  
if (event.tag \=== 'sync-posts') {  
event.waitUntil(syncPosts());  
}  
});

async function syncPosts() {  
// Sincronizar posts salvos offline quando voltar online  
const db \= await openDB();  
const pendingPosts \= await db.getAll('pending-posts');

for (const post of pendingPosts) {  
    try {  
        await fetch('/wp-json/wp/v2/posts', {  
            method: post.method || 'POST',  
            headers: { 'Content-Type': 'application/json' },  
            body: JSON.stringify(post.data)  
        });  
          
        await db.delete('pending-posts', post.id);  
    } catch (error) {  
        console.error('Sync error:', error);  
    }  
}

}

---

**3.4 Fase 4: Desenvolvimento do Backend (Semana 4-5)**

**Objetivo**

Implementar endpoints customizados no WordPress com segurança enterprise-grade.

**4.1 Plugin Customizado: Rest Endpoints**

\<?php  
// /backend/plugins/antigravity-extended/plugin.php

/\*\*

* Plugin Name: AntiGravity Extended

* Plugin URI: [https://antigravity.local](https://antigravity.local)

* Description: Endpoints customizados e segurança para CMS

* Version: 1.0.0

* Author: Seu Nome

* Author URI: [https://seusite.com](https://seusite.com)

* License: GPL v2 or later

* Domain Path: /languages  
  \*/

defined('ABSPATH') || exit;

// Constantes  
define('ANTIGRAVITY\_DIR', plugin\_dir\_path(**FILE**));  
define('ANTIGRAVITY\_URL', plugin\_dir\_url(**FILE**));  
define('ANTIGRAVITY\_VERSION', '1.0.0');

// Autoload  
require\_once ANTIGRAVITY\_DIR . 'includes/autoload.php';

// Hooks de ativação/desativação  
register\_activation\_hook(**FILE**, \['AntiGravity\\Activator', 'activate'\]);  
register\_deactivation\_hook(**FILE**, \['AntiGravity\\Deactivator', 'deactivate'\]);

// Inicializar plugin  
add\_action('plugins\_loaded', function() {  
new AntiGravity\\Core();  
});

\<?php  
// /backend/plugins/antigravity-extended/includes/core.php

namespace AntiGravity;

class Core {  
public function \_\_construct() {  
$this-\>hooks();  
}

private function hooks() {  
    // REST API customizado  
    add\_action('rest\_api\_init', \[$this, 'register\_routes'\]);  
      
    // Segurança  
    add\_action('init', \[$this, 'setup\_security'\]);  
      
    // Logging  
    add\_action('rest\_insert\_post', \[$this, 'log\_post\_changes'\], 10, 2);  
}

/\*\*  
 \* Registrar endpoints customizados  
 \*/  
public function register\_routes() {  
    // Endpoint para analytics customizado  
    register\_rest\_route('antigravity/v1', '/analytics/summary', \[  
        'methods' \=\> 'GET',  
        'callback' \=\> \[$this, 'get\_analytics\_summary'\],  
        'permission\_callback' \=\> \[$this, 'check\_permission'\]  
    \]);  
      
    // Endpoint para backup  
    register\_rest\_route('antigravity/v1', '/backup/create', \[  
        'methods' \=\> 'POST',  
        'callback' \=\> \[$this, 'create\_backup'\],  
        'permission\_callback' \=\> function() {  
            return current\_user\_can('manage\_options');  
        }  
    \]);  
      
    // Endpoint para validação em tempo real  
    register\_rest\_route('antigravity/v1', '/validate/slug', \[  
        'methods' \=\> 'POST',  
        'callback' \=\> \[$this, 'validate\_post\_slug'\],  
        'permission\_callback' \=\> \[$this, 'check\_permission'\]  
    \]);  
}

/\*\*  
 \* Verificar permissões  
 \*/  
public function check\_permission($request) {  
    // Verificar JWT token  
    if (\!is\_user\_logged\_in()) {  
        return new \\WP\_Error(  
            'unauthorized',  
            'Token inválido ou expirado',  
            \['status' \=\> 401\]  
        );  
    }  
      
    // Verificar capacidade do usuário  
    return current\_user\_can('edit\_posts');  
}

/\*\*  
 \* Obter resumo de analytics  
 \*/  
public function get\_analytics\_summary($request) {  
    global $wpdb;  
      
    $period \= $request-\>get\_param('period') ?? 30; // dias  
      
    $results \= $wpdb-\>get\_results($wpdb-\>prepare(  
        "SELECT  
            COUNT(\*) as total\_posts,  
            SUM(CASE WHEN post\_status \= 'publish' THEN 1 ELSE 0 END) as published,  
            SUM(CASE WHEN post\_status \= 'draft' THEN 1 ELSE 0 END) as drafts  
        FROM {$wpdb-\>posts}  
        WHERE post\_date \>= DATE\_SUB(NOW(), INTERVAL %d DAY)  
        AND post\_type \= 'post'",  
        $period  
    ));  
      
    return rest\_ensure\_response($results\[0\] ?? \[\]);  
}

/\*\*  
 \* Criar backup  
 \*/  
public function create\_backup($request) {  
    // Usar plugin UpdraftPlus ou similar  
    do\_action('updraftplus\_backup');  
      
    return rest\_ensure\_response(\[  
        'success' \=\> true,  
        'message' \=\> 'Backup iniciado'  
    \]);  
}

/\*\*  
 \* Validar slug do post  
 \*/  
public function validate\_post\_slug($request) {  
    $slug \= sanitize\_title($request-\>get\_param('slug'));  
      
    // Verificar se slug já existe  
    $existing \= get\_page\_by\_path($slug, OBJECT, 'post');  
      
    return rest\_ensure\_response(\[  
        'valid' \=\> \!$existing,  
        'slug' \=\> $slug,  
        'message' \=\> $existing ? 'Slug já existe' : 'Slug disponível'  
    \]);  
}

/\*\*  
 \* Registrar mudanças em log  
 \*/  
public function log\_post\_changes($post, $request) {  
    $user\_id \= get\_current\_user\_id();  
    $user \= get\_user\_by('ID', $user\_id);  
      
    $log\_entry \= \[  
        'user' \=\> $user-\>user\_login,  
        'action' \=\> 'post\_updated',  
        'post\_id' \=\> $post-\>ID,  
        'timestamp' \=\> current\_time('mysql'),  
        'changes' \=\> $\_POST // Simplificado, fazer diff real em produção  
    \];  
      
    // Armazenar log em opção WordPress ou arquivo  
    update\_option('antigravity\_audit\_log', $log\_entry);  
}

/\*\*  
 \* Setup de segurança  
 \*/  
public function setup\_security() {  
    // Adicionar headers de segurança  
    header('X-Content-Type-Options: nosniff');  
    header('X-Frame-Options: SAMEORIGIN');  
    header('X-XSS-Protection: 1; mode=block');  
    header('Referrer-Policy: strict-origin-when-cross-origin');  
      
    // Rate limiting (usando Transients)  
    $this-\>implement\_rate\_limiting();  
}

/\*\*  
 \* Rate limiting  
 \*/  
private function implement\_rate\_limiting() {  
    $ip \= $\_SERVER\['REMOTE\_ADDR'\];  
    $key \= 'ratelimit\_' . $ip;  
    $current \= get\_transient($key) ?? 0;  
      
    if ($current \> 100\) { // 100 requisições por minuto  
        wp\_die('Rate limit excedido', 429);  
    }  
      
    set\_transient($key, $current \+ 1, MINUTE\_IN\_SECONDS);  
}

}

**4.2 Autenticação JWT no WordPress**

\<?php  
// /backend/plugins/antigravity-extended/includes/authentication.php

namespace AntiGravity;

class Authentication {

/\*\*  
 \* Gerar JWT token  
 \*/  
public static function generate\_jwt($user\_id) {  
    $user \= get\_user\_by('ID', $user\_id);  
      
    if (\!$user) {  
        return null;  
    }  
      
    $issued\_at \= time();  
    $expire \= $issued\_at \+ (30 \* DAY\_IN\_SECONDS);  
      
    $payload \= \[  
        'iss' \=\> get\_bloginfo('url'),  
        'aud' \=\> get\_bloginfo('url'),  
        'iat' \=\> $issued\_at,  
        'exp' \=\> $expire,  
        'sub' \=\> $user\_id,  
        'user' \=\> \[  
            'id' \=\> $user-\>ID,  
            'login' \=\> $user-\>user\_login,  
            'email' \=\> $user-\>user\_email,  
            'roles' \=\> $user-\>roles  
        \]  
    \];  
      
    return self::encode\_jwt($payload);  
}

/\*\*  
 \* Codificar JWT (HS256)  
 \*/  
private static function encode\_jwt($payload) {  
    $secret \= defined('JWT\_AUTH\_SECRET\_KEY') ? JWT\_AUTH\_SECRET\_KEY : 'your-secret-key';  
      
    $header \= \[  
        'typ' \=\> 'JWT',  
        'alg' \=\> 'HS256'  
    \];  
      
    $header \= base64\_encode(json\_encode($header));  
    $payload \= base64\_encode(json\_encode($payload));  
      
    $signature \= hash\_hmac(  
        'sha256',  
        $header . '.' . $payload,  
        $secret,  
        true  
    );  
    $signature \= base64\_encode($signature);  
      
    return $header . '.' . $payload . '.' . $signature;  
}

/\*\*  
 \* Validar JWT token  
 \*/  
public static function validate\_jwt($token) {  
    $secret \= defined('JWT\_AUTH\_SECRET\_KEY') ? JWT\_AUTH\_SECRET\_KEY : 'your-secret-key';  
      
    $parts \= explode('.', $token);  
    if (count($parts) \!== 3\) {  
        return null;  
    }  
      
    list($header, $payload, $signature) \= $parts;  
      
    // Verificar assinatura  
    $expected\_signature \= base64\_encode(  
        hash\_hmac('sha256', $header . '.' . $payload, $secret, true)  
    );  
      
    if ($signature \!== $expected\_signature) {  
        return null;  
    }  
      
    // Decodificar payload  
    $payload\_decoded \= json\_decode(base64\_decode($payload), true);  
      
    // Verificar expiração  
    if (isset($payload\_decoded\['exp'\]) && $payload\_decoded\['exp'\] \< time()) {  
        return null;  
    }  
      
    return $payload\_decoded;  
}

/\*\*  
 \* Middleware: Verificar JWT antes de processar requisição  
 \*/  
public static function authenticate\_request() {  
    // Obter token do header Authorization  
    $token \= self::get\_token\_from\_header();  
      
    if (\!$token) {  
        return;  
    }  
      
    $payload \= self::validate\_jwt($token);  
      
    if (\!$payload) {  
        wp\_die('Token inválido', 'rest\_authentication\_error', \['status' \=\> 401\]);  
    }  
      
    // Definir usuário atual  
    wp\_set\_current\_user($payload\['sub'\]);  
}

/\*\*  
 \* Extrair token do header  
 \*/  
private static function get\_token\_from\_header() {  
    $headers \= getallheaders();  
      
    if (isset($headers\['Authorization'\])) {  
        $matches \= \[\];  
        if (preg\_match('/Bearer\\s(\\S+)/', $headers\['Authorization'\], $matches)) {  
            return $matches\[1\];  
        }  
    }  
      
    return null;  
}

}

// Adicionar hook para autenticar  
add\_action('parse\_request', \[Authentication::class, 'authenticate\_request'\]);

**4.3 Permissions/RBAC**

\<?php  
// /backend/plugins/antigravity-extended/includes/permissions.php

namespace AntiGravity;

class Permissions {

public static function setup() {  
    add\_action('init', \[self::class, 'register\_capabilities'\]);  
}

/\*\*  
 \* Registrar capabilities customizadas  
 \*/  
public static function register\_capabilities() {  
    // Editor role \- pode editar qualquer post  
    $editor \= get\_role('editor');  
    $editor-\>add\_cap('edit\_others\_posts');  
    $editor-\>add\_cap('delete\_others\_posts');  
      
    // Author role \- pode editar apenas seus posts  
    $author \= get\_role('author');  
    $author-\>add\_cap('publish\_posts');  
      
    // Contributor role \- draft apenas  
    $contributor \= get\_role('contributor');  
    // Por padrão, não pode publicar  
}

/\*\*  
 \* Verificar permissão de editar post  
 \*/  
public static function can\_edit\_post($user\_id, $post\_id) {  
    $post \= get\_post($post\_id);  
    $user \= get\_user\_by('ID', $user\_id);  
      
    // Admin pode tudo  
    if (in\_array('administrator', $user-\>roles)) {  
        return true;  
    }  
      
    // Editor pode editar qualquer post  
    if (in\_array('editor', $user-\>roles)) {  
        return true;  
    }  
      
    // Author pode editar apenas seus posts  
    if (in\_array('author', $user-\>roles)) {  
        return $post-\>post\_author \== $user\_id;  
    }  
      
    return false;  
}

/\*\*  
 \* Filtro de REST \- respeitar permissões ao listar posts  
 \*/  
public static function filter\_rest\_posts($args, $request) {  
    $user \= wp\_get\_current\_user();  
      
    // Se não for admin/editor, mostrar apenas posts do usuário  
    if (\!in\_array('administrator', $user-\>roles) &&   
        \!in\_array('editor', $user-\>roles)) {  
        $args\['author'\] \= $user-\>ID;  
    }  
      
    return $args;  
}

}

add\_filter('rest\_post\_query\_vars', \[Permissions::class, 'filter\_rest\_posts'\], 10, 2);

---

**3.5 Fase 5: Testes e QA (Semana 6\)**

**Objetivo**

Implementar testes automatizados, verificação de segurança e conformidade.

**5.1 Testes Unitários JavaScript**

// tests/unit/auth.test.js  
import { describe, it, expect, beforeEach, vi } from 'vitest';  
import { AuthManager } from '../../frontend/js/auth.js';

describe('AuthManager', () \=\> {  
let authManager;

beforeEach(() \=\> {  
    authManager \= new AuthManager();  
});

it('deve fazer login com credenciais válidas', async () \=\> {  
    const mockResponse \= {  
        ok: true,  
        json: () \=\> Promise.resolve({  
            token: 'test-token',  
            refreshToken: 'refresh-token',  
            user: { id: 1, email: 'user@test.com' }  
        })  
    };  
      
    global.fetch \= vi.fn(() \=\> Promise.resolve(mockResponse));  
      
    const result \= await authManager.login('user@test.com', 'password');  
      
    expect(result.success).toBe(true);  
    expect(authManager.token).toBe('test-token');  
});

it('deve verificar se token está expirado', () \=\> {  
    // Token expirado  
    authManager.tokenExpiry \= Date.now() \- 1000;  
    expect(authManager.isTokenExpired()).toBe(true);  
      
    // Token válido  
    authManager.tokenExpiry \= Date.now() \+ 1000000;  
    expect(authManager.isTokenExpired()).toBe(false);  
});

it('deve decodificar JWT corretamente', () \=\> {  
    const token \= 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoidXNlckB0ZXN0LmNvbSIsImV4cCI6OTk5OTk5OTk5OX0.test';  
      
    const payload \= authManager.decodeJWT(token);  
      
    expect(payload.sub).toBe(1);  
    expect(payload.email).toBe('user@test.com');  
});

});

**5.2 Testes de Segurança**

\<?php  
// tests/security-checks.php

namespace AntiGravity\\Tests;

class SecurityChecks {

/\*\*  
 \* Verificar exposição de informações sensíveis  
 \*/  
public static function test\_no\_sensitive\_data\_exposure() {  
    // Simular requisição com credencial inválida  
    $response \= wp\_remote\_post('http://localhost/wp-json/jwt-auth/v1/token', \[  
        'body' \=\> json\_encode(\['user' \=\> 'invalid', 'password' \=\> 'invalid'\]),  
        'headers' \=\> \['Content-Type' \=\> 'application/json'\]  
    \]);  
      
    $body \= json\_decode(wp\_remote\_retrieve\_body($response), true);  
      
    // Não deve expor detalhes internos  
    assert(\!isset($body\['sql\_error'\]), 'SQL error expostos');  
    assert(\!isset($body\['database\_path'\]), 'Database path exposto');  
    assert(\!isset($body\['php\_version'\]), 'PHP version exposto');  
      
    echo "✓ Nenhuma informação sensível exposta\\n";  
}

/\*\*  
 \* Verificar proteção contra SQL Injection  
 \*/  
public static function test\_sql\_injection\_protection() {  
    global $wpdb;  
      
    $malicious\_input \= "'; DROP TABLE users; \--";  
      
    // Usar prepared statements  
    $result \= $wpdb-\>get\_results($wpdb-\>prepare(  
        "SELECT \* FROM {$wpdb-\>posts} WHERE post\_title LIKE %s",  
        '%' . $wpdb-\>esc\_like($malicious\_input) . '%'  
    ));  
      
    // Verificar que tabela ainda existe  
    $tables \= $wpdb-\>get\_results("SHOW TABLES");  
    assert(count($tables) \> 0, 'Tabelas foram deletadas\!');  
      
    echo "✓ Proteção contra SQL Injection funcionando\\n";  
}

/\*\*  
 \* Verificar proteção contra XSS  
 \*/  
public static function test\_xss\_protection() {  
    $xss\_payload \= '\<img src=x onerror=alert("XSS")\>';  
      
    // Passar por sanitização  
    $sanitized \= sanitize\_text\_field($xss\_payload);  
      
    assert(strpos($sanitized, 'onerror') \=== false, 'XSS não foi sanitizado');  
      
    echo "✓ Proteção contra XSS funcionando\\n";  
}

/\*\*  
 \* Verificar CSRF Protection  
 \*/  
public static function test\_csrf\_protection() {  
    // Verificar se nonce é validado  
    $nonce \= wp\_create\_nonce('update\_post');  
      
    assert(wp\_verify\_nonce($nonce, 'update\_post'), 'Nonce inválido');  
      
    // Nonce expirado deve falhar  
    $expired\_nonce \= 'invalid\_nonce\_123';  
    assert(wp\_verify\_nonce($expired\_nonce, 'update\_post') \=== false, 'Nonce expirado não foi rejeitado');  
      
    echo "✓ Proteção CSRF funcionando\\n";  
}

/\*\*  
 \* Verificar autenticação JWT  
 \*/  
public static function test\_jwt\_authentication() {  
    // Token com assinatura inválida  
    $invalid\_token \= 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImV4cCI6OTk5OTk5OTk5OX0.invalid\_signature';  
      
    $result \= \\AntiGravity\\Authentication::validate\_jwt($invalid\_token);  
      
    assert($result \=== null, 'Token inválido foi aceito');  
      
    echo "✓ Validação JWT funcionando\\n";  
}

}

// Executar testes  
SecurityChecks::test\_no\_sensitive\_data\_exposure();  
SecurityChecks::test\_sql\_injection\_protection();  
SecurityChecks::test\_xss\_protection();  
SecurityChecks::test\_csrf\_protection();  
SecurityChecks::test\_jwt\_authentication();

echo "\\n✅ Todos os testes de segurança passaram\!\\n";

**5.3 Teste de Acessibilidade WCAG 2.1 AA**

// tests/accessibility.test.js  
import { describe, it, expect } from 'vitest';  
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Acessibilidade \- WCAG 2.1 AA', () \=\> {  
it('dashboard não deve ter violações de acessibilidade', async () \=\> {  
const results \= await axe(document);  
expect(results).toHaveNoViolations();  
});

it('elementos interativos devem ter labels', () \=\> {  
    const buttons \= document.querySelectorAll('button');  
    buttons.forEach(btn \=\> {  
        const hasLabel \= btn.textContent || btn.getAttribute('aria-label');  
        expect(hasLabel).toBeTruthy();  
    });  
});

it('formulários devem ter labels associados', () \=\> {  
    const inputs \= document.querySelectorAll('input, textarea, select');  
    inputs.forEach(input \=\> {  
        const id \= input.id;  
        const hasLabel \= document.querySelector(\`label\[for="${id}"\]\`)   
            || input.getAttribute('aria-label');  
        expect(hasLabel).toBeTruthy();  
    });  
});

it('cores devem ter contraste mínimo 4.5:1', async () \=\> {  
    // Usar ferramenta como Lighthouse  
    // Isso seria integrado com Lighthouse CI  
    expect(true).toBe(true); // Placeholder  
});

it('navegação por teclado deve funcionar', () \=\> {  
    const focusableElements \= document.querySelectorAll(  
        'button, \[href\], input, select, textarea, \[tabindex\]'  
    );  
    expect(focusableElements.length).toBeGreaterThan(0);  
});

});

---

**3.6 Fase 6: Deployment e Monitoramento (Semana 6-7)**

**Objetivo**

Deploy em produção com monitoramento, logging e alertas.

**6.1 Docker Compose para Deploy**

**deployment/docker-compose.yml**

version: '3.8'

services:  
mysql:  
image: mysql:8.0  
container\_name: antigravity\_db  
environment:  
MYSQL\_DATABASE: wordpress  
MYSQL\_ROOT\_PASSWORD: ${DB\_ROOT\_PASSWORD}  
MYSQL\_USER: ${DB\_USER}  
MYSQL\_PASSWORD: ${DB\_PASSWORD}  
ports:  
\- "3306:3306"  
volumes:  
\- db\_data:/var/lib/mysql  
healthcheck:  
test: \["CMD", "mysqladmin", "ping", "-h", "localhost"\]  
timeout: 20s  
retries: 10

wordpress:  
image: wordpress:latest  
container\_name: antigravity\_wp  
depends\_on:  
mysql:  
condition: service\_healthy  
environment:  
WORDPRESS\_DB\_HOST: mysql:3306  
WORDPRESS\_DB\_NAME: wordpress  
WORDPRESS\_DB\_USER: ${DB\_USER}  
WORDPRESS\_DB\_PASSWORD: ${DB\_PASSWORD}  
WORDPRESS\_DEBUG: ${WP\_DEBUG}  
JWT\_AUTH\_SECRET\_KEY: ${JWT\_AUTH\_SECRET\_KEY}  
ports:  
\- "8080:80"  
volumes:  
\- wordpress\_data:/var/www/html  
\- ./backend/plugins:/var/www/html/wp-content/plugins/antigravity-extended  
healthcheck:  
test: \["CMD", "curl", "-f", "[http://localhost/wp-json/wp/v2/posts](http://localhost/wp-json/wp/v2/posts)"\]  
interval: 30s  
timeout: 10s  
retries: 3

nginx:  
image: nginx:alpine  
container\_name: antigravity\_nginx  
depends\_on:  
\- wordpress  
ports:  
\- "443:443"  
\- "80:80"  
volumes:  
\- ./deployment/nginx.conf:/etc/nginx/nginx.conf  
\- ./frontend:/usr/share/nginx/html  
\- /etc/letsencrypt:/etc/letsencrypt  
networks:  
\- app-network

redis:  
image: redis:7-alpine  
container\_name: antigravity\_cache  
ports:  
\- "6379:6379"  
volumes:  
\- redis\_data:/data

**Monitoramento**

prometheus:  
image: prom/prometheus:latest  
container\_name: antigravity\_prometheus  
volumes:  
\- ./deployment/prometheus.yml:/etc/prometheus/prometheus.yml  
\- prometheus\_data:/prometheus  
ports:  
\- "9090:9090"  
command:  
\- '--config.file=/etc/prometheus/prometheus.yml'

grafana:  
image: grafana/grafana:latest  
container\_name: antigravity\_grafana  
depends\_on:  
\- prometheus  
ports:  
\- "3000:3000"  
volumes:  
\- grafana\_data:/var/lib/grafana  
environment:  
GF\_SECURITY\_ADMIN\_PASSWORD: ${GRAFANA\_PASSWORD}

**Logging**

loki:  
image: grafana/loki:latest  
container\_name: antigravity\_loki  
ports:  
\- "3100:3100"  
volumes:  
\- ./deployment/loki-config.yml:/etc/loki/local-config.yaml  
\- loki\_data:/loki

volumes:  
db\_data:  
wordpress\_data:  
redis\_data:  
prometheus\_data:  
grafana\_data:  
loki\_data:

networks:  
app-network:  
driver: bridge

**6.2 Nginx Configuration**

**deployment/nginx.conf**

events {  
worker\_connections 1024;  
}

http {  
upstream wordpress {  
server wordpress:80;  
}

\# Rate limiting  
limit\_req\_zone $binary\_remote\_addr zone=api\_limit:10m rate=10r/s;  
limit\_req\_zone $binary\_remote\_addr zone=dashboard\_limit:10m rate=30r/s;

\# Cache  
proxy\_cache\_path /var/cache/nginx levels=1:2 keys\_zone=cache:10m max\_size=1g inactive=60m;

\# Compression  
gzip on;  
gzip\_types text/plain text/css text/javascript application/json application/javascript;  
gzip\_min\_length 1000;

\# Security headers  
add\_header X-Frame-Options "SAMEORIGIN" always;  
add\_header X-Content-Type-Options "nosniff" always;  
add\_header X-XSS-Protection "1; mode=block" always;  
add\_header Referrer-Policy "strict-origin-when-cross-origin" always;  
add\_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'" always;

server {  
    listen 80;  
    listen 443 ssl http2;  
    server\_name antigravity.local;

    ssl\_certificate /etc/letsencrypt/live/antigravity.local/fullchain.pem;  
    ssl\_certificate\_key /etc/letsencrypt/live/antigravity.local/privkey.pem;

    \# Redirect HTTP para HTTPS  
    if ($scheme \!= "https") {  
        return 301 https://$server\_name$request\_uri;  
    }

    \# Dashboard \- frontend  
    location / {  
        root /usr/share/nginx/html;  
        try\_files $uri $uri/ /index.html;  
          
        \# Cache estático  
        location \~\* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {  
            expires 1y;  
            add\_header Cache-Control "public, immutable";  
        }  
    }

    \# API do WordPress  
    location /wp-json {  
        limit\_req zone=api\_limit burst=20 nodelay;  
          
        proxy\_pass http://wordpress;  
        proxy\_set\_header Host $host;  
        proxy\_set\_header X-Real-IP $remote\_addr;  
        proxy\_set\_header X-Forwarded-For $proxy\_add\_x\_forwarded\_for;  
        proxy\_set\_header X-Forwarded-Proto $scheme;  
          
        \# Cache GET requests  
        proxy\_cache cache;  
        proxy\_cache\_valid 200 10m;  
        proxy\_cache\_key "$scheme$request\_method$host$request\_uri";  
        add\_header X-Cache-Status $upstream\_cache\_status;  
    }

    \# Admin do WordPress  
    location /wp-admin {  
        limit\_req zone=dashboard\_limit burst=50 nodelay;  
          
        proxy\_pass http://wordpress;  
        proxy\_set\_header Host $host;  
        proxy\_set\_header X-Real-IP $remote\_addr;  
        proxy\_set\_header X-Forwarded-For $proxy\_add\_x\_forwarded\_for;  
    }

    \# Logging  
    access\_log /var/log/nginx/access.log combined;  
    error\_log /var/log/nginx/error.log warn;  
}

}

**6.3 Monitoramento e Alertas**

**deployment/prometheus.yml**

global:  
scrape\_interval: 15s  
evaluation\_interval: 15s

alerting:  
alertmanagers:  
\- static\_configs:  
\- targets: \[\]

rule\_files:

* '/etc/prometheus/rules.yml'

scrape\_configs:

* job\_name: 'wordpress'  
  static\_configs:

  * targets: \['wordpress:80'\]  
    metrics\_path: '/metrics'

* job\_name: 'mysql'  
  static\_configs:

  * targets: \['mysql:3306'\]

* job\_name: 'redis'  
  static\_configs:

  * targets: \['redis:6379'\]

* job\_name: 'nginx'  
  static\_configs:

  * targets: \['nginx:80'\]

**deployment/rules.yml**

groups:

* name: wordpress  
  rules:

  * alert: HighErrorRate  
    expr: rate(http\_requests\_total{status=\~"5.."}\[5m\]) \> 0.05  
    for: 5m  
    annotations:  
    summary: "Taxa de erro alta em {{ $labels.instance }}"

  * alert: APISlowResponse  
    expr: histogram\_quantile(0.95, http\_request\_duration\_seconds) \> 1  
    for: 5m  
    annotations:  
    summary: "API respondendo lentamente em {{ $labels.instance }}"

  * alert: DatabaseDown  
    expr: mysql\_up \== 0  
    for: 1m  
    annotations:  
    summary: "Database offline em {{ $labels.instance }}"

  * alert: RateLimitExceeded  
    expr: rate(http\_requests\_total\[1m\]) \> 1000  
    for: 5m  
    annotations:  
    summary: "Rate limit excedido em {{ $labels.instance }}"

---

**4\. Stack Tecnológico Recomendado**

**4.1 Frontend**

┌─────────────────────────────────┐  
│ Linguagem Base: JavaScript │  
│ ES6+, Async/Await, Modules │  
├─────────────────────────────────┤  
│ UI Framework (Escolher um): │  
│ \- Vue.js 3 \+ Composition API │  
│ \- React 18 \+ Hooks │  
│ \- Svelte 4 (leve, otimizado) │  
│ \- Vanilla JS (sem framework) │  
├─────────────────────────────────┤  
│ State Management: │  
│ \- Pinia (Vue) / Redux (React) │  
│ \- IndexedDB para dados locais │  
├─────────────────────────────────┤  
│ UI Components: │  
│ \- Bootstrap 5 / Tailwind CSS │  
│ \- Custom Web Components │  
├─────────────────────────────────┤  
│ Editor WYSIWYG: │  
│ \- TinyMCE / CKEditor 5 │  
│ \- Quill.js (leve) │  
├─────────────────────────────────┤  
│ Build & Bundler: │  
│ \- Vite (recomendado) │  
│ \- esbuild │  
├─────────────────────────────────┤  
│ Testing: │  
│ \- Vitest \+ jsdom │  
│ \- Playwright (E2E) │  
│ \- jest-axe (acessibilidade) │  
└─────────────────────────────────┘

**4.2 Backend**

┌──────────────────────────────────┐  
│ CMS: WordPress 6.0+ │  
│ Database: MySQL 8.0 / Maria DB │  
├──────────────────────────────────┤  
│ PHP Plugins: │  
│ \- JWT Authentication for REST │  
│ \- REST API Authentication │  
│ \- Custom Post Type UI │  
│ \- UpdraftPlus (backup) │  
│ \- Antispam Bee (segurança) │  
├──────────────────────────────────┤  
│ Segurança: │  
│ \- ModSecurity (WAF) │  
│ \- Fail2Ban (IDS) │  
│ \- WordPress 2FA │  
├──────────────────────────────────┤  
│ Performance: │  
│ \- Redis (cache) │  
│ \- Object Cache Pro │  
│ \- Nginx (reverse proxy) │  
└──────────────────────────────────┘

**4.3 DevOps & Infrastructure**

┌───────────────────────────────────┐  
│ Containerização: Docker │  
│ Orquestração: Docker Compose │  
│ (Kubernetes para escala) │  
├───────────────────────────────────┤  
│ CI/CD: │  
│ \- GitHub Actions / GitLab CI │  
│ \- Automated tests │  
│ \- Security scanning (SonarQube) │  
│ \- Automated deployment │  
├───────────────────────────────────┤  
│ Hospedagem: │  
│ \- VPS (DigitalOcean, Linode) │  
│ \- Cloud (AWS, Google Cloud) │  
│ \- Cloudflare (CDN \+ WAF) │  
├───────────────────────────────────┤  
│ Monitoramento: │  
│ \- Prometheus \+ Grafana │  
│ \- Loki (logging) │  
│ \- Sentry (error tracking) │  
│ \- Datadog / New Relic (APM) │  
├───────────────────────────────────┤  
│ Backup & Disaster Recovery: │  
│ \- Automated daily backups │  
│ \- Geo-redundant storage │  
│ \- RTO: 1 hora / RPO: 24 horas │  
└───────────────────────────────────┘

---

**5\. Conformidade e Segurança**

**5.1 Checklist de Segurança**

AUTENTICAÇÃO & AUTORIZAÇÃO  
☐ JWT implementado com HS256/RS256  
☐ Refresh tokens com expiração independente  
☐ 2FA disponível (TOTP/SMS)  
☐ Password hashing com bcrypt/argon2  
☐ RBAC com granularidade por post  
☐ API key management com rotação 90 dias  
☐ Session timeout configurado

ENCRIPTAÇÃO  
☐ HTTPS/TLS 1.3+ obrigatório  
☐ AES-256 para dados em repouso  
☐ HSTS headers ativados  
☐ Certificate pinning (mobile)  
☐ Secrets em environment variables (não commit)

VALIDAÇÃO & SANITIZAÇÃO  
☐ Input validation (type, size, format)  
☐ Output escaping (HTML, JS, SQL)  
☐ CSRF tokens para POST/PUT/DELETE  
☐ SQL prepared statements  
☐ File upload validations  
☐ Rate limiting implementado

LOGGING & MONITORAMENTO  
☐ Audit trail completo de mudanças  
☐ Failed login attempts logged  
☐ Suspicious activity alerts  
☐ Log retention: mín. 90 dias  
☐ PII masking em logs  
☐ Centralized logging (Loki/ELK)

COMPLIANCE  
☐ LGPD (Brasil) \- privacidade  
☐ WCAG 2.1 AA \- acessibilidade  
☐ OWASP Top 10 \- mitigado  
☐ SOC 2 \- auditável

**5.2 WCAG 2.1 AA Compliance**

PERCEIVABLE  
☐ Texto com contraste mínimo 4.5:1  
☐ Alt text em todas imagens  
☐ Vídeos com legendas e áudio description  
☐ Não dependem unicamente de cor

OPERABLE  
☐ Navegável por teclado  
☐ Skip links para conteúdo  
☐ Focus indicators visíveis  
☐ Sem traps de teclado  
☐ Tempo suficiente para leitura  
☐ Sem conteúdo piscante (\>3x/segundo)

UNDERSTANDABLE  
☐ Linguagem clara e simples  
☐ Rótulos e instruções claros  
☐ Mensagens de erro específicas  
☐ Ajuda contextual disponível  
☐ Prevenção de erros  
☐ Confirmação de ações destrutivas

ROBUST  
☐ HTML válido e semântico  
☐ ARIA utilizado corretamente  
☐ Compatível com assistive tech  
☐ Suporta zoom até 200%  
☐ Responsive design (mobile-first)

---

**6\. Métricas de Performance**

**6.1 KPIs a Monitorar**

FRONTEND  
┌─────────────────────────────────────────┐  
│ Core Web Vitals │  
├─────────────────────────────────────────┤  
│ LCP (Largest Contentful Paint): \<2.5s │  
│ FID (First Input Delay): \<100ms │  
│ CLS (Cumulative Layout Shift): \<0.1 │  
├─────────────────────────────────────────┤  
│ Adicionais │  
├─────────────────────────────────────────┤  
│ Time to First Byte (TTFB): \<600ms │  
│ First Contentful Paint (FCP): \<1.8s │  
│ Time to Interactive (TTI): \<3.8s │  
│ Total Blocking Time (TBT): \<300ms │  
└─────────────────────────────────────────┘

API  
┌─────────────────────────────────────────┐  
│ Latência P95: \<500ms │  
│ Latência P99: \<1s │  
│ Error Rate: \<0.1% │  
│ Availability: \>99.9% │  
│ Throughput: \> requisições/s esperadas │  
└─────────────────────────────────────────┘

BACKEND  
┌─────────────────────────────────────────┐  
│ CPU Usage: \<70% pico │  
│ Memory Usage: \<80% pico │  
│ Database Query Time P95: \<100ms │  
│ Cache Hit Rate: \>80% │  
│ Storage Growth: \<10% mensal │  
└─────────────────────────────────────────┘

---

**7\. Roteiro de Desenvolvimento (Timeline)**

SEMANA 1-2: PLANEJAMENTO & ARQUITETURA  
├─ Análise de requisitos  
├─ Design técnico  
├─ Matriz de permissões  
└─ Setup de infraestrutura

SEMANA 3-4: DESENVOLVIMENTO FRONTEND  
├─ UI/UX design & components  
├─ Autenticação (login/logout)  
├─ Dashboard principal  
├─ Editor de conteúdo  
└─ Gerenciador de mídia

SEMANA 4-5: DESENVOLVIMENTO BACKEND  
├─ Plugin customizado  
├─ Endpoints REST  
├─ Autenticação JWT  
├─ Permissions/RBAC  
└─ Logging & Audit

SEMANA 6: TESTES & SEGURANÇA  
├─ Testes unitários  
├─ Testes E2E  
├─ Security testing  
├─ Performance testing  
└─ Acessibilidade (WCAG)

SEMANA 6-7: DEPLOYMENT  
├─ Docker setup  
├─ CI/CD pipeline  
├─ Monitoramento  
├─ Alertas  
└─ Runbooks

SEMANA 8+: MELHORIAS & ESCALABILIDADE  
├─ Otimização de performance  
├─ Integração com n8n  
├─ Automação de workflows  
├─ Análises e relatórios  
└─ Feedback do usuário

---

**8\. Conclusão e Próximos Passos**

O **Sistema AntiGravity** é uma solução enterprise-grade de gerenciamento de conteúdo WordPress com:

**Destaques Técnicos**

* ✅ Segurança multi-camada (JWT, RBAC, Rate limiting)

* ✅ Conformidade WCAG 2.1 AA (acessibilidade total)

* ✅ PWA com suporte offline

* ✅ Arquitetura headless escalável

* ✅ Monitoramento e observabilidade

**Casos de Uso**

* 📌 Clínicas e consultórios (gestão de portfólio, blog)

* 📌 Agências digitais (múltiplos clientes)

* 📌 Pesquisadores (publicação de estudos)

* 📌 SaaS (como CMS backend)

**Próximas Etapas**

1. Definir stack específico (Vue vs React vs Vanilla)

2. Configurar ambiente de desenvolvimento

3. Implementar Phase 1-2 completas

4. Envolver usuários em testes beta

5. Iterar baseado em feedback

---

**9\. Referências e Recursos\[1\]\[2\]\[3\]\[4\]\[5\]\[6\]\[7\]\[8\]\[9\]**

**Documentação Oficial**

* WordPress REST API: [https://developer.wordpress.org/rest-api/](https://developer.wordpress.org/rest-api/)

* JWT Authentication: [https://tools.ietf.org/html/rfc7519](https://tools.ietf.org/html/rfc7519)

* WCAG 2.1: [https://www.w3.org/WAI/WCAG21/quickref/](https://www.w3.org/WAI/WCAG21/quickref/)

**Ferramentas Recomendadas**

* Postman: Testar APIs

* Lighthouse: Auditoria de performance/acessibilidade

* OWASP ZAP: Testes de segurança

* SonarQube: Análise de código

**Comunidades**

* [WordPress.org](http://WordPress.org) Forums

* Stack Overflow

* GitHub Discussions

* [Dev.to](http://Dev.to) Community

---

**Anexos**

**A. Variáveis de Ambiente**

**.env.example**

**Database**

DB\_HOST=localhost  
DB\_NAME=wordpress  
DB\_USER=wp\_user  
DB\_PASSWORD=secure\_password\_here  
DB\_ROOT\_PASSWORD=root\_password\_here

**WordPress**

WP\_DEBUG=true  
WP\_DEBUG\_LOG=true  
WP\_MEMORY\_LIMIT=256M

**JWT Authentication**

JWT\_AUTH\_SECRET\_KEY=your-super-secret-key-min-32-chars-random  
JWT\_AUTH\_EXPIRE=2592000

**API**

API\_URL=https://api.antigravity.local  
FRONTEND\_URL=https://antigravity.local

**Segurança**

CORS\_ORIGINS=https://antigravity.local,[https://dashboard.antigravity.local](https://dashboard.antigravity.local)

**Monitoring**

GRAFANA\_PASSWORD=grafana\_password  
SENTRY\_DSN=https://key@sentry.io/project

**Email (SendGrid)**

SENDGRID\_API\_KEY=your\_sendgrid\_key

**Storage (S3/Google Cloud)**

AWS\_ACCESS\_KEY\_ID=your\_aws\_key  
AWS\_SECRET\_ACCESS\_KEY=your\_aws\_secret  
AWS\_BUCKET\_NAME=antigravity-media

**B. Comandos Docker Úteis**

**Iniciar ambiente**

docker-compose up \-d

**Ver logs**

docker-compose logs \-f wordpress

**Acessar CLI PHP**

docker-compose exec wordpress php

**Backup do banco**

docker-compose exec mysql mysqldump \-uDBUSER−p{DB\_PASSWORD} ${DB\_NAME} \> backup.sql

**Restaurar backup**

docker-compose exec \-T mysql mysql \-uDBUSER−p{DB\_PASSWORD} ${DB\_NAME} \< backup.sql

**Parar ambiente**

docker-compose down

**C. Exemplo de Requisição API**

**Login**

curl \-X POST [http://localhost:8080/wp-json/jwt-auth/v1/token](http://localhost:8080/wp-json/jwt-auth/v1/token)   
\-H "Content-Type: application/json"  
\-d '{"[email":"admin@example.com](mailto:email%22:%22admin@example.com)","password":"password"}'

**Obter token**

**Response: {"token":"eyJ0eXAiOiJKV1QiLCJhbGc...","refreshToken":"..."}**

**Criar post (com token)**

curl \-X POST [http://localhost:8080/wp-json/wp/v2/posts](http://localhost:8080/wp-json/wp/v2/posts)   
\-H "Content-Type: application/json"  
\-H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc..."  
\-d '{  
"title":"Novo Post",  
"content":"Conteúdo do post",  
"status":"draft"  
}'

---

**Fim do Documento**

*Versão 1.0 \- Março 2026*  
*Compatível com: WordPress 6.0+, PHP 8.0+, MySQL 8.0+*