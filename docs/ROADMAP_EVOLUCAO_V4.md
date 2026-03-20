# 🗺️ Roadmap de Evolução: Mission Control V4 (Pós-Relatório Mestre)

Com base no **Relatório Mestre (Protocolo Abidos v3.2)**, identifiquei os "Gaps" técnicos entre a visão idealizada e a implementação atual. Este documento serve como o backlog imediato para atingirmos a maturidade total do sistema.

---

## ⚡ 1. Resumo do Gap Analysis

| Funcionalidade | Estado Atual | Status | Prioridade |
| :--- | :--- | :---: | :---: |
| **Linha de Montagem QA** | Implementada com 3 Inspetores (Abidos/Clinico/Design) | ✅ | - |
| **Geração de Cluster (Silo)** | UI gera apenas 1 item por vez. Falta automação 1 Hub + 5 Spokes. | ❌ | **CRÍTICA** |
| **Gemini Live (Voice-to-Voice)** | Usa transcrição STT simples. Falta WebSocket Multimodal. | ❌ | **ALTA** |
| **Extrator de DNA Automático** | Salva regras via áudio/upload, mas não via "diff" manual no canvas. | ⚠️ | **MÉDIA** |
| **Integração WPCodeBox 2** | Publica via REST API padrão (Pages/Posts). | ❌ | **MÉDIA** |
| **RAG Acadêmico (Assets)** | Assets estão no prompt, mas falta busca vetorial dinâmica. | ⚠️ | **BAIXA** |

---

## 🛠️ 2. Próximos Passos (Plano de Ação)

### 🚀 Fase A: Engenharia de Silos (Cluster Generation)
*   **Backend:** Criar endpoint `/api/blueprint/cluster` que orquestre a criação de 6 rascunhos encadeados com linkagem interna automática.
*   **Frontend:** Adicionar switch no chat do AI Studio: `[ ] Modo Cluster (Hub + 5 Articles)`.

### 🎙️ Fase B: Neuro-Training Live (Gemini Realtime)
*   **Infra:** Implementar WebSocket no `server.js` para conectar com o `google.generativeai.LiveAPI`.
*   **UI:** Atualizar a aba Neuro-Training para suportar áudio bidirecional sem necessidade de clicar para enviar.

### 🧬 Fase C: Auto-DNA (Aprendizado Passivo)
*   **Lógica:** Implementar uma função no frontend que, ao clicar em "Salvar Item", compare o HTML original da IA com a versão final editada pelo Dr. Victor.
*   **Processamento:** O backend analisa esse diff via Agente Flash e deduz novas regras de estilo para o `estilo_victor.json` sem intervenção humana.

### 🔌 Fase D: Headless Deployment (WPCodeBox)
*   **Bridge:** Criar um endpoint de proxy para o plugin WPCodeBox 2 (ou similar) para injetar CSS Tailwind compilado e HTML bruto, ignorando as restrições do editor Gutenberg.

---

> [!IMPORTANT]
> A prioridade imediata é a **Geração de Clusters**. É o que permitirá ao Dr. Victor dominar nichos inteiros de busca (ex: "Hipnose em Goiânia") com um único comando de voz, criando toda a rede de conteúdo de uma vez.
