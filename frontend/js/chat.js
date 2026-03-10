/**
 * NeuroEngine Copilot - Core Logic
 * Handles Chat, AI Studio, WP Integration and Method Abidos analysis.
 */

window.chatApp = {
    currentItemId: null,
    currentType: null,
    selectedElement: null,
    // [NOVO] Dados de Autoridade do Dr. Victor Lawrence (E-E-A-T)
    authorityContext: {
        name: "Victor Lawrence Bernardes Santana",
        crp: "09/012681",
        title: "Mestrando em Ciências da Saúde (UFU)",
        institution: "Instituto Lawrence de Hipnose Clínica",
        socials: {
            instagram: "https://www.instagram.com/hipnolawrence",
            doctoralia: "https://www.doctoralia.com.br/victor-lawrence-bernardes-santana/psicologo-terapeuta-complementar/goiania",
            whatsapp: "62 98217-1845"
        }
    },

    init() {
        this.setupEventListeners();
        this.setupInspector();
        console.log("🧠 NeuroEngine Copilot Initialized");
    },

    setupEventListeners() {
        const chatInput = document.getElementById('chat-input');
        const btnSend = document.getElementById('btn-send-chat');
        const btnSnap = document.getElementById('btn-snap-error');

        btnSend.addEventListener('click', () => this.sendMessage(false));
        btnSnap.addEventListener('click', () => {
            if (!chatInput.value.trim()) {
                chatInput.value = "Por favor, olhe como a página está ficando. Pode corrigir a formatação?";
            }
            this.sendMessage(true);
        });

        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage(false);
            }
        });
    },

    setupInspector() {
        const preview = document.getElementById('live-preview');
        preview.addEventListener('click', (e) => {
            // Se clicar em um elemento, seleciona-o para ajuste fino
            e.preventDefault();
            e.stopPropagation();

            // Limpa seleção anterior
            if (this.selectedElement) {
                this.selectedElement.classList.remove('element-selected');
            }

            this.selectedElement = e.target;
            this.selectedElement.classList.add('element-selected');

            const tagName = this.selectedElement.tagName.toLowerCase();
            this.addMessage(`🎯 Elemento **${tagName}** selecionado. Peça no chat para mudar cor, fonte ou texto dele.`);
        });
    },

    addMessage(text, isUser = false) {
        const chatHistory = document.getElementById('chat-history');
        const msgDiv = document.createElement('div');
        msgDiv.style.padding = '10px 15px';
        msgDiv.style.borderRadius = isUser ? '10px 10px 0 10px' : '10px 10px 10px 0';
        msgDiv.style.alignSelf = isUser ? 'flex-end' : 'flex-start';
        msgDiv.style.maxWidth = '85%';
        msgDiv.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
        
        if (isUser) {
            msgDiv.style.background = '#1e293b';
            msgDiv.style.color = 'white';
            msgDiv.innerHTML = `<strong>Você:</strong><br>${text.replace(/\n/g, '<br>')}`;
        } else {
            msgDiv.style.background = '#e0f2fe';
            msgDiv.style.color = '#0369a1';
            
            // Formatando blocos de código HTML (Refatorado para Injeção Não-Destrutiva)
            let formattedText = text.replace(/```html([\s\S]*?)```/g, (match, p1) => {
                return `<br><br><div style="background:#1e293b; color:#fbbf24; padding:10px; border-radius:5px; font-family:monospace; font-size:12px; overflow-x:auto;">${p1.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
                <div style="margin-top:8px; display:flex; gap:5px; align-items:center;">
                    <select class="injection-mode" style="padding:4px; font-size:11px; border-radius:4px; border:1px solid #cbd5e1;">
                        <option value="append">➕ Adicionar ao Final</option>
                        <option value="prepend">🔙 Adicionar ao Início</option>
                        <option value="replace">🔄 Substituir Tudo</option>
                    </select>
                    <button onclick="window.injectCode(this)" data-code="${encodeURIComponent(p1)}" style="padding:5px 12px; background:#6366f1; color:white; border:none; border-radius:4px; cursor:pointer; font-size:11px; font-weight:bold;">⚡ Aplicar no Canvas</button>
                </div><br><br>`;
            });

            // Formatando markdown básico
            formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            msgDiv.innerHTML = `<strong>NeuroEngine:</strong><br>${formattedText}`;
        }
        
        chatHistory.appendChild(msgDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    },

    async sendMessage(hasScreenshot = false) {
        const chatInput = document.getElementById('chat-input');
        const btnSend = document.getElementById('btn-send-chat');
        const btnSnap = document.getElementById('btn-snap-error');
        const livePreview = document.getElementById('live-preview');
        const keyword = document.getElementById('ai-studio-keyword').value;

        const message = chatInput.value.trim();
        if (!message) return;

        chatInput.value = '';
        
        // [NOVO] Injeção de Contexto de SEO Dinâmico
        const seoContext = document.getElementById('seo-context').value;
        let enhancedMessage = message;
        if (seoContext) {
            enhancedMessage += `\n\n[INSTRUÇÃO DE SEO OCULTA]: Certifique-se de usar a palavra-chave "${seoContext}" nas tags H1, H2 ou no primeiro parágrafo gerado. Foco em conversão clínica.`;
        }

        if (hasScreenshot) {
            this.addMessage(message + "<br><em>📸 (Anexou Visualização da Tela)</em>", true);
            btnSnap.innerHTML = '⚙️ Processando...';
            btnSnap.disabled = true;
        } else {
            this.addMessage(message, true);
            btnSend.innerHTML = '⚙️ Processando...';
            btnSend.disabled = true;
        }

        const formData = new FormData();
        
        // CONSTRUÇÃO DO PROMPT COM CONTEXTO
        let promptContext = enhancedMessage;
        
        // 1. Contexto de Keyword SEO
        if (keyword) {
            promptContext += `\n\n[FOCO SEO]: A keyword prioritária é "${keyword}". Use-a estrategicamente conforme o Método Abidos.`;
        }

        // 1.1 Contexto de Autoridade (E-E-A-T / Psicólogo Victor Lawrence)
        promptContext += `\n\n[DADOS DO ESPECIALISTA]: Nome: ${this.authorityContext.name}, CRP: ${this.authorityContext.crp}, Titulação: ${this.authorityContext.title}, Clínica: ${this.authorityContext.institution}. 
        Tratamento Profissional: Utilize sempre "Psicólogo Victor Lawrence" em vez de "Dr.".
        Linkagem Interna: Sempre cite a home www.hipnolawrence.com.
        WhatsApp: ${this.authorityContext.socials.whatsapp}.
        IMPORTANTE: Sempre inclua o CRP próximo ao nome do especialista em seções de autoridade.`;

        // 2. Contexto de Ajuste Fino (Elemento Selecionado)
        if (this.selectedElement) {
            const elHtml = this.selectedElement.outerHTML;
            promptContext += `\n\n[AJUSTE FINO]: O usuário selecionou este elemento: \n${elHtml}\nAltere apenas este elemento ou o bloco sugerido.`;
        }

        formData.append('message', promptContext);
        
        // 3. Contexto da Página Inteira
        const currentHtml = livePreview.innerHTML;
        if(currentHtml.trim().length > 0 && !currentHtml.includes('Crie algo novo')) {
            formData.append('htmlContext', currentHtml);
        }

        try {
            if (hasScreenshot && window.html2canvas) {
                const canvas = await html2canvas(livePreview);
                const blob = await new Promise(resolve => canvas.toBlob(resolve));
                formData.append('screenshot', blob, 'preview.png');
            }
            
            const response = await fetch('http://localhost:3001/api/chat', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            
            if (data.reply) {
                this.addMessage(data.reply, false);
            } else {
                this.addMessage("Desculpe, deu um erro interno na IA.", false);
            }
        } catch (error) {
            console.error(error);
            this.addMessage("Erro de conexão com o terminal IA (Port 3001).", false);
        } finally {
            btnSend.innerHTML = 'Enviar Comando';
            btnSnap.innerHTML = '📸 Enviar Visualização p/ IA';
            btnSend.disabled = false;
            btnSnap.disabled = false;
        }
    },

    // --- WP INTEGRATION ---

    async loadList() {
        const typeSelect = document.getElementById('ai-studio-type');
        const itemSelect = document.getElementById('ai-studio-item');
        const type = typeSelect.value;
        
        itemSelect.innerHTML = '<option>Carregando...</option>';
        itemSelect.style.display = 'block';

        const data = await wpAPI.fetchContent(type);
        
        if(!data || data.length === 0) {
            itemSelect.innerHTML = '<option>Nenhum item encontrado.</option>';
            return;
        }

        itemSelect.innerHTML = '<option value="">-- Selecione para Editar --</option>';
        data.forEach(item => {
            const title = item.title && item.title.rendered ? item.title.rendered : `Sem Título #${item.id}`;
            itemSelect.innerHTML += `<option value="${item.id}">${title}</option>`;
        });
        
        document.getElementById('ai-studio-load-btn')?.remove(); // Not needed if we use onchange or separate btn
        // Let's keep a Load Button for safety
        const existingBtn = document.getElementById('ai-studio-load-btn');
        if(!existingBtn) {
            const btn = document.createElement('button');
            btn.id = 'ai-studio-load-btn';
            btn.className = 'btn btn-primary';
            btn.style.padding = '5px 10px';
            btn.innerText = '📥 Carregar';
            btn.onclick = () => this.loadItem();
            itemSelect.after(btn);
        }
    },

    async loadItem() {
        const type = document.getElementById('ai-studio-type').value;
        const id = document.getElementById('ai-studio-item').value;
        if(!id) return;

        const titleSpan = document.getElementById('ai-studio-title');
        titleSpan.innerText = `Baixando...`;

        const data = await wpAPI.getContent(type, id);
        if(data) {
            this.currentItemId = id;
            this.currentType = type;
            document.getElementById('live-preview').innerHTML = data.content.rendered;
            titleSpan.innerText = `Editando: ${data.title.rendered}`;
            
        document.getElementById('ai-studio-new-title').style.display = 'none';
        document.getElementById('ai-studio-accept-btn').style.display = 'none';
        document.getElementById('ai-studio-suggest-btn').style.display = 'none';
        document.getElementById('ai-studio-preview-btn').style.display = 'block';
            document.getElementById('ai-studio-item').style.display = 'block';
            
            this.updateAbidusScore();
            this.addMessage(`Carreguei **${data.title.rendered}**. O que deseja ajustar?`);
        }
    },

    createNew() {
        this.currentItemId = null;
        this.currentType = document.getElementById('ai-studio-type').value;
        
        document.getElementById('ai-studio-item').style.display = 'none';
        const titleInput = document.getElementById('ai-studio-new-title');
        titleInput.style.display = 'block';
        titleInput.value = "";
        titleInput.focus();
        
        document.getElementById('ai-studio-accept-btn').style.display = 'block';
        document.getElementById('ai-studio-suggest-btn').style.display = 'block';
        document.getElementById('live-preview').innerHTML = '<h1 style="color: #1a202c; font-size: 24px; text-align: center; margin-top: 50px; opacity: 0.5;">Comece a escrever seu novo rascunho ou peça para a IA...</h1>';
        document.getElementById('ai-studio-title').innerText = "Novo Rascunho";
        
        this.addMessage(`Pronto! Digite o título, clique em ✅ para confirmar e use os botões de prompts rápidos para começar.`);
    },

    acceptTitle() {
        const title = document.getElementById('ai-studio-new-title').value.trim();
        if(!title) return alert("Digite o título primeiro.");
        this.addMessage(`Título **"${title}"** aceito! Vou usá-lo como base para os comandos.`);
        document.getElementById('ai-studio-title').innerText = `Rascunho: ${title}`;
    },

    async saveToWP() {
        const titleInput = document.getElementById('ai-studio-new-title');
        const isNew = !this.currentItemId;
        const newTitle = titleInput.value.trim();
        const type = document.getElementById('ai-studio-type').value;

        if (isNew && !newTitle) return alert("Digite um título.");

        const htmlContent = document.getElementById('live-preview').innerHTML;
        const slug = document.getElementById('seo-slug').value.trim();
        
        const payload = { 
            content: htmlContent, 
            status: "draft" 
        };

        if (isNew) payload.title = newTitle;
        if (slug) payload.slug = slug;

        const result = await wpAPI.saveContent(type, payload, this.currentItemId);
        
        if(result && result.id) {
            this.currentItemId = result.id;
            this.currentType = type;
            titleInput.style.display = 'none';
            document.getElementById('ai-studio-suggest-btn').style.display = 'none';
            document.getElementById('ai-studio-preview-btn').style.display = 'block';
            document.getElementById('ai-studio-title').innerText = `Rascunho: ${result.title.rendered || newTitle}`;
            alert("Rascunho salvo!");
        }
    },

    // --- ANALYTICS & TOOLS ---

    async suggestTitle() {
        const type = document.getElementById('ai-studio-type').value;
        const keyword = document.getElementById('ai-studio-keyword').value || "TEA em Adultos";
        
        const prompt = `Atue como um Especialista em Copywriting de Conversão (Método Abidos).
Sua tarefa é sugerir EXATAMENTE UM (1) título de impacto para um(a) ${type === 'pages' ? 'Página' : 'Post'}.
O foco deve ser a keyword: "${keyword}".
REGRAS CRÍTICAS:
1. NÃO use a palavra "Abidos" no título. Ela é apenas a sua metodologia interna.
2. O título deve focar na DOR do paciente (TEA, Mascaramento, Burnout ou Suspeita).
3. Deve incluir autoridade (especialista, instituto) ou localização (Goiânia) se couber.
4. O resultado deve ser direto, curto e persuasivo.
5. RETORNE APENAS O TEXTO DO TÍTULO, sem comentários, explicações ou listas.`;

        const suggestion = await gemini.callAPI(prompt);
        if(suggestion) {
            // Limpa qualquer aspa ou prefixo que a IA possa ter colocado
            const cleanTitle = suggestion.replace(/^["']|["']$/g, '').trim();
            document.getElementById('ai-studio-new-title').value = cleanTitle;
            this.addMessage(`💡 Sugestão de Título: **"${cleanTitle}"**`);
        }
    },

    toggleChecklist() {
        const panel = document.getElementById('abidus-checklist-panel');
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    },

    updateAbidusScore() {
        const html = document.getElementById('live-preview').innerHTML;
        const text = document.getElementById('live-preview').innerText;
        let score = 0;
        let suggestions = [];

        const checks = {
            'check-seo': text.toLowerCase().includes('goiânia'),
            'check-eat': ['crp', 'crm', 'psicó', 'especialista'].some(k => text.toLowerCase().includes(k)),
            'check-pain': ['tea', 'autismo', 'masking', 'burnout'].some(k => text.toLowerCase().includes(k)),
            'check-cta': html.toLowerCase().includes('href') && (html.toLowerCase().includes('whatsapp') || html.toLowerCase().includes('agende')),
            'check-keyword': html.toLowerCase().includes('hipnolawrence.com')
        };

        // Custom label for checklist items to show what they are
        const labels = {
            'check-seo': 'SEO Local (Goiânia)',
            'check-eat': 'Autoridade (E-E-A-T)',
            'check-pain': 'Foco na Dor (TEA/Adulto)',
            'check-cta': 'Conversão (WhatsApp)',
            'check-keyword': 'Link Interno (Home)'
        };

        Object.keys(checks).forEach(id => {
            const el = document.getElementById(id);
            if(el) {
                if(checks[id]) {
                    score += 20;
                    el.style.color = '#059669';
                    el.innerHTML = `✅ ${labels[id]}`;
                } else {
                    el.style.color = '#dc2626';
                    el.innerHTML = `❌ ${labels[id]}`;
                }
            }
        });

        document.getElementById('abidus-progress').style.width = score + '%';
        document.getElementById('abidus-percentage').innerText = score + '%';
    },

    runQuickPrompt(type) {
        const keyword = document.getElementById('ai-studio-keyword').value || "TEA em Adultos";
        const title = document.getElementById('ai-studio-new-title').value || "Psicoterapia Especializada";
        const prompts = {
            full: `Crie um conteúdo COMPLETO seguindo a ARQUITETURA OBRIGATÓRIA LAWRENCE para o Título: "${title}". Use a keyword "${keyword}". 
ORDEM DE CONSTRUÇÃO:
1. Seção Hero: H1 (Forte + Goiânia), subtítulo acolhedor e botão WhatsApp.
2. Jornada do Paciente: H2 Identificação da Dor (Empatia profunda), H2 Benefícios Clínicos, H3 Quebra de Objeções/FAQ sutil.
3. Autoridade: H2 Sobre o Especialista (Dr. Victor Lawrence, Bio, CRP, espaço para foto), H2 Infraestrutura/Ambiente.
4. Retenção: H2 FAQ Accordion, Linkagem Interna linkando para www.hipnolawrence.com.
Regras: NUNCA cite a palavra Abidos. Use tom empático-clínico. Localização: Goiânia.`,
            hero: `Crie uma dobra Hero (Header) focada em conversão para "${keyword}". Regra: Título de impacto focado na dor do paciente, subtexto de autoridade e um botão de CTA para WhatsApp em Goiânia. NUNCA use a palavra Abidos no texto. OBRIGATÓRIO: Inclua um link orgânico para a home em www.hipnolawrence.com.`,
            social: `Gere uma seção de depoimentos de pacientes adultos com TEA. Use um design limpo e inclua um link sutil para 'Conhecer nossa história' levando a www.hipnolawrence.com. NUNCA cite a palavra Abidos.`,
            faq: `Crie um FAQ quebra-objeções focado em TEA Adulto e Hipnose. As respostas devem ser acolhedoras e citar a página inicial www.hipnolawrence.com para mais detalhes sobre a clínica.`,
            eeat: `Crie uma seção 'Sobre o Especialista' focada no Dr. Victor Lawrence, CRM/CRP e especialidade em Autismo Feminino. Inclua um botão 'Voltar para a Home' para www.hipnolawrence.com.`,
            cta: `Crie um botão flutuante de WhatsApp animado e um link de rodapé contextualizado para www.hipnolawrence.com.`
        };
        const input = document.getElementById('chat-input');
        input.value = prompts[type];
        this.sendMessage();
    },

    // [NOVO] Handler para os novos botões do Painel Abidos
    runAbidusShortcut(type) {
        const input = document.getElementById('chat-input');
        const shortcuts = {
            hero: "Gere uma seção Hero (Cabeçalho) HTML/Tailwind focada em conversão (Método Abidos: Promessa Clara no H1, Sub-headline atacando a dor principal, e um Botão de CTA grande para WhatsApp). Não inclua header/footer, apenas a seção.",
            social: "Gere uma seção de Prova Social seguindo boas práticas de UI para terapeutas, com cards de depoimentos impactantes e design limpo.",
            faq: "Gere um componente de FAQ em Accordion (HTML/JS) focado em quebrar as principais objeções de pacientes de TEA Adulto ou Hipnose Clínica."
        };
        
        if (shortcuts[type]) {
            input.value = shortcuts[type];
            this.sendMessage();
        }
    },

    async analyzeConversion() {
        this.addMessage("⚙️ Iniciando Auditoria Abidos CRO...", false);
        const html = document.getElementById('live-preview').innerHTML;
        const prompt = `Analise este HTML sob a ótica do Método Abidos (Conversão em Saúde). CRITIQUE: Contraste de botões, clareza da promessa e E-E-A-T. Aponte 3 melhorias código:\n\n${html}`;
        const critique = await gemini.callAPI(prompt);
        if(critique) this.addMessage(`🔍 **Crítica CRO:**\n\n${critique}`);
    },

    previewDraft() {
        if (!this.currentItemId) return alert("Salve primeiro.");
        const baseUrl = wpAPI.url.replace('/wp-json/wp/v2', '');
        window.open(`${baseUrl}/?p=${this.currentItemId}&preview=true`, '_blank');
    },

    toggleSettings() {
        const panel = document.getElementById('ai-studio-settings-panel');
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        this.addMessage("⚙️ Painel de Configurações SEO aberto. Você pode definir a URL, Título SEO e Meta Description aqui.");
    },

    async generateSEOMeta() {
        const title = document.getElementById('ai-studio-new-title').value || "Psicoterapia em Goiânia";
        const keyword = document.getElementById('ai-studio-keyword').value || "Autismo Adulto";
        
        this.addMessage("⚙️ Gerando configurações de SEO otimizadas...");

        const prompt = `Atue como um Especialista em SEO Técnico e Copywriter.
Sugerir configurações de SEO para o conteúdo: "${title}" com a keyword foco "${keyword}".
REGRAS:
1. URL (Slug): Silo geolocalizado, curta e sem acentos (ex: terapia-ansiedade-em-goiania).
2. Título SEO: Keyword nos primeiros 50 caracteres (total 50-60 carac.).
3. Meta Description: 150-160 caracteres, persuasiva, com a keyword e um CTA implícito.

RETORNE APENAS UM JSON no formato exato:
{
  "slug": "url-aqui",
  "seoTitle": "Título SEO aqui",
  "metaDesc": "Descrição aqui"
}`;

        const response = await gemini.callAPI(prompt);
        if (response) {
            try {
                // Tenta extrair JSON do texto (limpa ```json se a IA colocar)
                const jsonStr = response.replace(/```json|```/g, '').trim();
                const meta = JSON.parse(jsonStr);
                
                document.getElementById('seo-slug').value = meta.slug;
                document.getElementById('seo-title-tag').value = meta.seoTitle;
                document.getElementById('seo-meta-desc').value = meta.metaDesc;
                
                this.addMessage("✅ Configurações SEO geradas com sucesso! Verifique os campos no painel de Configurações.");
            } catch (e) {
                console.error("Erro ao processar JSON de SEO", e);
                this.addMessage("❌ Erro ao formatar sugestão de SEO. Tente novamente ou use o título sugerido.");
            }
        }
    },

    // [NOVO] Análise de Necessidades de Mídia via IA (Abidos Method)
    async analyzeMediaNeeds() {
        const html = document.getElementById('live-preview').innerHTML;
        const panel = document.getElementById('media-needs-panel');
        const list = document.getElementById('media-needs-list');
        
        if (html.includes('Crie algo novo')) {
            return this.addMessage("⚠️ Crie ou carregue algum conteúdo antes de planejar a mídia.");
        }

        this.addMessage("⚙️ NeuroEngine está mapeando oportunidades visuais no seu texto...");
        panel.style.display = 'block';
        list.innerHTML = '<p style="font-size:11px; color:#64748b;">Analisando estrutura de conversão...</p>';

        const prompt = `Atue como um Diretor de Arte e Especialista em Conversão (Método Abidos).
Analise o conteúdo HTML abaixo e identifique 3 pontos onde uma imagem aumentaria a conversão ou autoridade.
Para cada ponto, defina uma "Necessidade".

RETORNE APENAS UM JSON no formato de array:
[
  {"need": "Imagem do Consultório Goiânia", "reason": "Aumentar E-E-A-T e confiança no ambiente físico."},
  {"need": "Foto do Dr. Lawrence sorrindo", "reason": "Gerar conexão humana na seção de autoridade."},
  {"need": "Ilustração de TEA Adulto", "reason": "Representação visual da dor do Mascaramento."}
]

HTML: \n${html}`;

        const response = await gemini.callAPI(prompt);
        if (response) {
            try {
                const jsonStr = response.replace(/```json|```/g, '').trim();
                const needs = JSON.parse(jsonStr);
                list.innerHTML = '';
                
                needs.forEach(n => {
                    const row = document.createElement('div');
                    row.style.display = 'flex';
                    row.style.justifyContent = 'space-between';
                    row.style.alignItems = 'center';
                    row.style.background = '#f9fafb';
                    row.style.padding = '8px';
                    row.style.borderRadius = '5px';
                    row.style.border = '1px solid #e2e8f0';
                    
                    row.innerHTML = `
                        <div style="flex:1;">
                            <p style="font-size:12px; font-weight:bold; margin:0;">${n.need}</p>
                            <p style="font-size:10px; color:#64748b; margin:0;">${n.reason}</p>
                        </div>
                        <div style="display:flex; gap:5px;">
                            <button class="btn btn-secondary" style="font-size:10px; padding:3px 8px;" onclick="document.querySelector('[data-target=&quot;media-library&quot;]').click()">📂 Selecionar</button>
                            <button class="btn btn-primary" style="font-size:10px; padding:3px 8px; background:#6366f1;" onclick="window.chatApp.suggestBestMedia('${n.need.replace(/'/g, "\\'")}')">🪄 Sugestão IA</button>
                        </div>
                    `;
                    list.appendChild(row);
                });
            } catch (e) {
                list.innerHTML = '<p style="color:red; font-size:11px;">Erro ao mapear mídia. Tente novamente.</p>';
            }
        }
    },

    // [NOVO] Sugestão Inteligente de Mídia do Banco de Dados
    async suggestBestMedia(needText) {
        this.addMessage(`🪄 Buscando a melhor imagem para: **"${needText}"** no seu acervo WP...`);
        
        // 1. Busca lista de mídia atual do WP
        const mediaList = await wpAPI.fetchMedia();
        if (!mediaList || mediaList.length === 0) {
            return this.addMessage("❌ Sua biblioteca WP está vazia. Faça upload de imagens primeiro.");
        }

        // 2. Prepara mini-catálogo para a IA
        const catalog = mediaList.map(m => ({
            id: m.id,
            title: m.title.rendered,
            alt: m.alt_text,
            url: m.source_url
        }));

        const prompt = `Atue como Bibliotecário Estratégico do Método Abidos.
O usuário precisa de uma imagem para o seguinte objetivo: "${needText}".

Temos o seguinte acervo de mídia (ID, Título, Alt Text, URL):
${JSON.stringify(catalog)}

REGRAS:
1. Escolha a imagem que melhor se adapta à necessidade.
2. Priorize imagens com Alt Text que combine com o objetivo.
3. Se nenhuma for perfeita, escolha a "menos pior" ou mais genérica/clínica.
4. RETORNE APENAS O JSON da imagem escolhida (exatamente como fornecido no catálogo).

RETORNE APENAS O JSON, sem comentários.`;

        const response = await gemini.callAPI(prompt);
        if (response) {
            try {
                const jsonStr = response.replace(/```json|```/g, '').trim();
                const selected = JSON.parse(jsonStr);
                
                this.addMessage(`✅ **Sugestão Encontrada!**\n\nA IA escolheu: **"${selected.title}"**.\nAlt Text: *${selected.alt || 'Nenhum'}*`);
                
                // Feedback visual no chat com a imagem
                this.addMessage(`<img src="${selected.url}" style="width:100px; height:60px; object-fit:cover; border-radius:4px; border:2px solid #6366f1;"><br>
                <button class="btn" style="background:#6366f1; color:white; font-size:11px; padding:4px 10px;" onclick="navigator.clipboard.writeText('${selected.url}'); alert('URL Copiada! Basta colar no seu HTML.')">📋 Copiar Link da Imagem</button>`);
                
            } catch (e) {
                console.error("Erro ao processar sugestão de mídia", e);
                this.addMessage("❌ A IA não conseguiu decidir. Tente abrir a Biblioteca de Mídia e escolher manualmente.");
            }
        }
    }
};

// Global Helpers (Refatorado para suportar Append-Only)
window.injectCode = function(btn) {
    const code = decodeURIComponent(btn.getAttribute('data-code'));
    const preview = document.getElementById('live-preview');
    const modeSelect = btn.parentElement.querySelector('.injection-mode');
    const mode = modeSelect ? modeSelect.value : 'replace';

    // Se o preview tiver o texto placeholder, limpa antes de injetar
    if (preview.innerText.includes('Crie algo novo') || preview.innerText.includes('Comece a escrever')) {
        preview.innerHTML = '';
    }

    if (mode === 'append') {
        preview.insertAdjacentHTML('beforeend', code);
    } else if (mode === 'prepend') {
        preview.insertAdjacentHTML('afterbegin', code);
    } else {
        preview.innerHTML = code;
    }

    window.chatApp.updateAbidusScore();
};

document.addEventListener('DOMContentLoaded', () => window.chatApp.init());
