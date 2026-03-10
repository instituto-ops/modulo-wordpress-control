const express = require('express');
const multer = require('multer');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: '../.env' }); 
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = 3000; // Unificando na porta 3000 (Frontend + API)

// Configuração de CORS: Como agora operamos na mesma porta, CORS é menos crítico,
// mas mantemos por segurança para acessos via IP ou subdomínios.
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// 1. SERVIR ARQUIVOS ESTÁTICOS (Frontend)
app.use(express.static(path.join(__dirname, 'public')));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Initialize Gemini SDK
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const VISION_MODEL = 'gemini-2.5-flash';

// Configurações WordPress do .env
const WP_URL = (process.env.WP_URL || 'https://hipnolawrence.com/').replace(/\/$/, '');
const WP_API_BASE = `${WP_URL}/wp-json/wp/v2`;
const WP_AUTH = Buffer.from(`${process.env.WP_USERNAME}:${process.env.WP_APP_PASSWORD}`).toString('base64');

// ==============================================================================
// 1. PROXY WORDPRESS (Segurança: Credenciais nunca saem do servidor)
// ==============================================================================

// Helper para chamadas WP
const callWP = async (method, endpoint, data = null, params = {}) => {
    const url = `${WP_API_BASE}${endpoint}`;
    const headers = {
        'Authorization': `Basic ${WP_AUTH}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) NeuroEngine/1.0'
    };

    if (method !== 'GET' && data) {
        headers['Content-Type'] = 'application/json';
    }

    console.log(`📡 [WP PROXY] ${method} ${url} ${params ? JSON.stringify(params) : ''}`);

    return await axios({
        method,
        url,
        data,
        params,
        headers
    });
};

// Endpoints Genéricos (GET, POST, PUT, DELETE)
app.get('/api/wp/:type', async (req, res) => {
    try {
        const response = await callWP('GET', `/${req.params.type}`, null, req.query);
        res.json(response.data);
    } catch (e) { res.status(e.response?.status || 500).json(e.response?.data || {error: e.message}); }
});

app.post('/api/wp/:type', async (req, res) => {
    try {
        const response = await callWP('POST', `/${req.params.type}`, req.body);
        res.json(response.data);
    } catch (e) { res.status(e.response?.status || 500).json(e.response?.data || {error: e.message}); }
});

app.all('/api/wp/:type/:id', async (req, res) => {
    try {
        const { type, id } = req.params;
        const response = await callWP(req.method, `/${type}/${id}`, req.body, req.query);
        res.json(response.data);
    } catch (e) { res.status(e.response?.status || 500).json(e.response?.data || {error: e.message}); }
});

// Endpoints de Configuração AntiGravity
app.get('/api/wp-settings', async (req, res) => {
    try {
        const response = await axios.get(`${WP_URL}/wp-json/antigravity/v1/settings`, {
            headers: { 'Authorization': `Basic ${WP_AUTH}` }
        });
        res.json(response.data);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/wp-settings', async (req, res) => {
    try {
        const response = await axios.post(`${WP_URL}/wp-json/antigravity/v1/settings`, req.body, {
            headers: { 'Authorization': `Basic ${WP_AUTH}`, 'Content-Type': 'application/json' }
        });
        res.json(response.data);
    } catch (e) { res.status(500).json({ error: e.message }); }
});
// Endpoint especial para Upload de Mídia (Multipart/Form-Data)
app.post('/api/wp-upload-media', upload.shared ? upload.single('file') : upload.single('file'), async (req, res) => {
    try {
        if (!req.file) throw new Error("Nenhum arquivo enviado.");

        const formData = new (require('form-data'))();
        formData.append('file', req.file.buffer, {
            filename: req.file.originalname,
            contentType: req.file.mimetype
        });
        formData.append('title', req.body.title || '');
        formData.append('alt_text', req.body.alt_text || '');

        const response = await axios.post(`${WP_API_BASE}/media`, formData, {
            headers: {
                ...formData.getHeaders(),
                'Authorization': `Basic ${WP_AUTH}`
            }
        });
        res.json(response.data);
    } catch (e) {
        console.error("Upload Proxy Error:", e.message);
        res.status(500).json({ error: e.message });
    }
});

// ==============================================================================
// 2. PROXY AI (Gemini)
// ==============================================================================

app.post('/api/ai/generate', async (req, res) => {
    try {
        const { prompt, config } = req.body;
        console.log(`🧠 [AI PROXY] Generate request for prompt prompt: "${prompt.substring(0, 50)}..."`);
        const model = genAI.getGenerativeModel({ model: VISION_MODEL });
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: config || { temperature: 0.7, maxOutputTokens: 1000 }
        });
        const resp = await result.response;
        res.json({ text: resp.text() });
    } catch (e) { 
        console.error("❌ [AI PROXY ERROR]", e.message);
        res.status(500).json({ error: e.message }); 
    }
});

const DOCTORALIA_REVIEWS = `
- Carla (TEA): "Diagnóstico tardio possível pela técnica adequada... melhora significativa na qualidade de vida."
- Y. (Autista): "Acompanhamento fez enorme diferença... hipnose e PNL com empatia e respeito."
- A. M. (Sábio): "Estrutura da minha vida, alguém sábio que me fez enxergar eu mesma."
- R. A. (Ansiedade): "Problema de ansiedade resolvido em algumas sessões. Muito profissional."
- L. F. S.: "Resultados nítidos e precisos. Indico fortemente."
`;

// ==============================================================================
// 3. TABELA DE REVISÃO E AGENTE ABIDOS (HUMAN-IN-THE-LOOP)
// ==============================================================================

const mockDrafts = [
    {
        "draft_id": "RASC-2026-084",
        "tema_foco": "TEA em adultos - Diagnóstico Tardio",
        "conteudo_gerado": "<h1>Diagnóstico de TEA na Vida Adulta em Goiânia</h1>\n<p>O diagnóstico tardio de Transtorno do Espectro Autista (TEA) em adultos é um momento divisor de águas...</p>\n<h2>Identificação da Dor: A Exaustão Constante</h2>\n<p>Muitos adultos passam anos sentindo uma exaustão inexplicável (Burnout Autista)...</p>\n<h3>Como a Avaliação Neuropsicológica Ajuda?</h3>\n<p>Toque aqui para falar comigo no WhatsApp e agendar sua avaliação.</p>",
        "validacoes_automatizadas": {
            "pesquisa_clinica": true,
            "metodo_abidos": true,
            "compliance_etico": true,
            "med_f1_score": 0.98
        },
        "status_atual": "aguardando_psicologo",
        "fontes_rag_utilizadas": [
            "Diretriz CFP Resolução 21/2025",
            "Estudo de caso anonimizado #405"
        ],
        "data_submissao": new Date().toISOString()
    },
    {
        "draft_id": "RASC-2026-085",
        "tema_foco": "Terapia de Casal e Esgotamento",
        "conteudo_gerado": "<h1>Terapia de Casal em Goiânia: Superando o Esgotamento</h1>\n<p>A rotina e o desgaste emocional muitas vezes afastam casais...</p>",
        "validacoes_automatizadas": {
            "pesquisa_clinica": true,
            "metodo_abidos": false,
            "compliance_etico": true,
            "med_f1_score": 0.95
        },
        "status_atual": "aguardando_psicologo",
        "fontes_rag_utilizadas": [
            "Protocolos de Terapia Cognitiva para Casais"
        ],
        "data_submissao": new Date(Date.now() - 86400000).toISOString()
    }
];

app.get('/api/drafts', (req, res) => {
    res.json(mockDrafts);
});

app.post('/api/agents/audit', async (req, res) => {
    try {
        const { content } = req.body;
        console.log(`🔍 [AGENTE ABIDOS] Auditing draft...`);
        
        const prompt = `
        Você é o "Agente Abidos", um Arquiteto de Sistemas e Auditor Sênior Implacável especializado no Método Abidos para clínicas de psicologia em Goiânia.
        Sua função exclusiva é dissecar o rascunho abaixo e garantir que ele segue 100% as diretrizes de SEO, hierarquia semântica e conformidade ética (CFP).
        
        REGRAS DE AUDITORIA:
        1. Regra do H1 Único: Deve haver apenas um título principal (H1) que contém a Palavra-chave exata + Promessa + Localização (Goiânia).
        2. Mapeamento de H2 e H3: Cheque se H2 separa os "Silos" e H3 detalha serviços.
        3. Validação de Copywriting e Conformidade Ética (CFP): Sem depoimentos que quebrem sigilo ou promessas mercadológicas de "cura definitiva. Use Autoridade Acadêmica.
        4. Foco UX/Mobile: CTAs devem incentivar o clique (ex: "Toque aqui para falar comigo").
        
        Rascunho a auditar:
        """${content}"""
        
        MÉTODO DE RESPOSTA (Gere um pequeno relatório visual):
        - Status: (Aprovado / Rejeitado)
        - Nota Abidos: (0 a 100)
        - Análises e Falhas Encontradas: (lista curta em bullet points)
        - Instrução de Correção para a IA Geradora: (Se houver falha)
        `;

        const model = genAI.getGenerativeModel({ model: VISION_MODEL });
        const result = await model.generateContent(prompt);
        const resp = await result.response;
        
        res.json({ report: resp.text() });
    } catch (e) {
        console.error("❌ [AGENTE ABIDOS ERROR]", e.message);
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/chat', upload.single('screenshot'), async (req, res) => {
    try {
        const { message, htmlContext, currentKeyword } = req.body;
        const model = genAI.getGenerativeModel({ model: VISION_MODEL });
        
        let promptText = `
        VOCÊ É JULES, ASSISTENTE ELITE DA CLÍNICA VICTOR LAWRENCE (GOIÂNIA).
        SUA MISSÃO: CRIAR LANDING PAGES DE ALTA CONVERSÃO USANDO O MÉTODO ABIDOS.
        
        REGRAS DE OURO:
        1. ESTRUTURA SEMPRE EM 4 SEÇÕES:
           - Seção 1 (Hero): H1 (Keyword exata + Benefício + Goiânia), Subtítulo, CTA WhatsApp (62982171845).
           - Seção 2 (Jornada/Corpo): H2 (Identificação da Dor), Texto H2 (Serviços), H3 (Quebra de Objeções).
           - Seção 3 (E-E-A-T): H2 (Apresentação), H2 (Ambiente), Prova Social (USE AS REVIEWS ABAIXO).
           - Seção 4 (Retenção): H2 (FAQ), Link Interno estilo "Veja também" para Silos de Conteúdo.
        
        2. PROVA SOCIAL (DOCTORALIA):
        ${DOCTORALIA_REVIEWS}
        
        3. DESIGN: Use Tailwind, cores profissionais (#1e293b, #0ea5e9). Imagens: use tags <img src="URL" alt="SEO Description">.
        
        CONTEXTO ATUAL:
        - Keyword: ${currentKeyword || 'Não especificada'}
        - HTML Atual: ${htmlContext || 'Vazio'}
        - Mensagem do Usuário: ${message}
        
        SE O USUÁRIO PEDIR PARA CRIAR OU GERAR, RETORNE O HTML COMPLETO SEGUINDO O MÉTODO.
        SE O USUÁRIO PEDIR PARA TROCAR IMAGEM, SUGIRA UMA NOVA URL DE IMAGEM OU REMOVA A ATUAL.
        `;
        
        let parts = [{ text: promptText }];
        if (req.file) {
            parts.push({ inlineData: { data: req.file.buffer.toString('base64'), mimeType: req.file.mimetype } });
        }

        const result = await model.generateContent({ contents: [{ role: 'user', parts }] });
        const resp = await result.response;
        res.json({ reply: resp.text() });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/blueprint', async (req, res) => {
    try {
        const { theme } = req.body;
        const model = genAI.getGenerativeModel({ model: VISION_MODEL });
        const prompt = `
        GERE UM BLUEPRINT HTML COMPLETO (4 SEÇÕES ABIDOS) PARA: ${theme}.
        LOCAÇÃO: Goiânia. 
        WHATSAPP: 62982171845.
        REVIEWS: Inclua depoimentos reais da Doctoralia (Carla, Y, etc).
        ESTRUTURA: 
        1. Hero (H1 Estratégico)
        2. Jornada (Dor e Benefícios)
        3. Autoridade (Quem é Victor Lawrence + Clientes)
        4. FAQ + Silos.
        RETORNE APENAS O HTML CRU.
        `;
        const result = await model.generateContent(prompt);
        const resp = await result.response;
        res.json({ html: resp.text().replace(/```html|```/g, '').trim() });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/audit', async (req, res) => {
    try {
        const { html, keyword } = req.body;
        const model = genAI.getGenerativeModel({ model: VISION_MODEL });
        const result = await model.generateContent(`Retorne um JSON array de auditoria SEO para o termo ${keyword}:\n\n${html}`);
        const resp = await result.response;
        res.json({ checklist: JSON.parse(resp.text().replace(/```json|```/g, '').trim()) });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.listen(port, () => {
    console.log(`\n🚀 AntiGravity CMS: Mission Control Ativo!`);
    console.log(`📡 Frontend & API rodando em http://localhost:${port}`);
    console.log(`🔐 Camada de Segurança Proxy: ON`);
});
