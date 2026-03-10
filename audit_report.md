# Auditoria do Repositório: NeuroEngine / AntiGravity CMS

## Visão Geral
Este relatório apresenta os resultados de uma auditoria técnica no repositório do projeto NeuroEngine (AntiGravity CMS). A auditoria focou em segurança, arquitetura, qualidade de código e conformidade com as melhores práticas de desenvolvimento web moderno e integrações com IA.

O repositório contém documentação metodológica (`docs/`), um frontend Vanilla JS (`frontend/`) e um plugin WordPress (`wordpress-plugin/`).

## 1. Segurança

### 1.1 Configuração CORS Permissiva (Grau de Severidade: Alto)
- **Local:** `wordpress-plugin/antigravity_cors.php` (linha 29)
- **Descrição:** O plugin WordPress está configurado com `header('Access-Control-Allow-Origin: *');` para origens desconhecidas. Embora exista um comentário alertando sobre o risco em produção, esta configuração permite que qualquer site malicioso interaja com a REST API do WordPress se o usuário estiver autenticado.
- **Recomendação:** Remover o fallback para `*`. A lista de origens permitidas (`$allowed_origins`) deve ser a única fonte de verdade. Para ambientes de produção, utilizar variáveis de ambiente ou configurações no painel do WordPress para definir os domínios autorizados, não código hardcoded.

### 1.2 Credenciais Hardcoded no Frontend (Grau de Severidade: Crítico)
- **Locais:**
  - `frontend/js/api.js` (linhas 4 e 5)
  - `frontend/js/gemini.js` (linha 3)
- **Descrição:** O código frontend possui variáveis de fallback com strings como `"SEU_USUARIO"`, `"SUA_APPLICATION_PASSWORD"` e `"SUA_GEMINI_API_KEY"`. Embora o código tente ler de `CONFIG_LOCAL`, a presença dessas lógicas no frontend (`window.CONFIG_LOCAL`) indica que credenciais sensíveis (Senhas de Aplicação do WP e Chaves de API do Google Gemini) estão sendo enviadas para o navegador do cliente.
- **Recomendação:** O frontend *nunca* deve conhecer as senhas de aplicação do WordPress ou a API Key do Gemini. Toda a comunicação com a IA e com a REST API do WP que exige privilégios administrativos deve passar pelo backend Node.js (`frontend/server.js`), que atuará como um proxy seguro.

## 2. Arquitetura e Estrutura

### 2.1 Dependências e Setup do Backend Incompletos (Grau de Severidade: Médio)
- **Local:** `frontend/`
- **Descrição:** O diretório `frontend/` contém um backend Express (`server.js`), mas o repositório não incluía o arquivo `package.json` original. Isso indica que o ambiente de desenvolvimento não está versionado corretamente, dificultando o setup para novos desenvolvedores. Tivemos que inicializar o `package.json` e instalar pacotes (`express`, `multer`, `cors`, `dotenv`, `@google/generative-ai`) manualmente.
- **Recomendação:** Versionar o `package.json` e o `package-lock.json` no repositório. O diretório `frontend` deveria idealmente ser separado em pastas distintas como `client/` e `server/` ou `api/` para clareza arquitetural, já que atualmente arquivos estáticos (html/css/js) dividem o mesmo espaço físico que o código Node.js.

### 2.2 Duplicação de Lógica de IA (Frontend vs Backend) (Grau de Severidade: Baixo/Médio)
- **Locais:** `frontend/server.js` e `frontend/js/gemini.js`
- **Descrição:** Existe uma clara sobreposição de responsabilidades. O `server.js` possui rotas bem definidas (`/api/chat`, `/api/blueprint`, `/api/audit`) usando a SDK oficial `@google/generative-ai`. No entanto, o arquivo `frontend/js/gemini.js` faz chamadas diretas via `fetch` para a API REST do Google (`https://generativelanguage.googleapis.com/...`).
- **Recomendação:** Centralizar toda a comunicação com a API do Gemini no backend (`server.js`). O frontend deve apenas chamar os endpoints locais (`/api/...`). Isso resolve o problema de segurança 1.2 e facilita a manutenção dos prompts, que atualmente estão espalhados em ambos os lados.

### 2.3 Gestão de Arquivos Sensíveis
- **Local:** `.gitignore`
- **Descrição:** O arquivo `.gitignore` está razoavelmente bem configurado, ignorando `.env`, `node_modules/`, etc. No entanto, é importante garantir que o arquivo de credenciais mencionado (`config.local.js`) não seja commitado acidentalmente.

## 3. Qualidade do Código

### 3.1 Tratamento de Erros Silencioso
- **Local:** `frontend/js/api.js` (ex: linha 22, `return []`)
- **Descrição:** Em várias partes do código, exceções são capturadas e logadas no console, mas o fluxo retorna valores nulos ou arrays vazios sem um feedback claro para a interface do usuário (além de alertas esporádicos ou `console.error`).
- **Recomendação:** Implementar um sistema global de tratamento de erros no frontend, possivelmente utilizando a função `showFeedback` já existente, para exibir mensagens mais amigáveis e evitar estados inconsistentes na UI quando a API do WordPress ou do Gemini falharem.

## Conclusão
O projeto NeuroEngine apresenta uma base sólida e inovadora para criação de landing pages focadas em conversão usando WordPress Headless e IA. No entanto, necessita de correções urgentes focadas em **segurança (exposição de credenciais)** e **padronização arquitetural (separação entre frontend e backend)** antes de ser movido para qualquer ambiente que não seja puramente local. A migração total das chamadas de API para o servidor Node.js resolverá a maioria das vulnerabilidades identificadas.
