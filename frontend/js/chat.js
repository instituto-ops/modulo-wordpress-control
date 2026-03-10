document.addEventListener('DOMContentLoaded', () => {
    const chatInput = document.getElementById('chat-input');
    const btnSend = document.getElementById('btn-send-chat');
    const btnSnap = document.getElementById('btn-snap-error');
    const chatHistory = document.getElementById('chat-history');
    const livePreview = document.getElementById('live-preview');

    // Função auxiliar para rolar o chat para o final
    function scrollToBottom() {
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    // Adiciona uma mensagem na tela
    function addMessage(text, isUser = false) {
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
            
            // Formatando blocos de código HTML
            let formattedText = text.replace(/```html([\s\S]*?)```/g, (match, p1) => {
                return `<br><br><div style="background:#1e293b; color:#fbbf24; padding:10px; border-radius:5px; font-family:monospace; font-size:12px; overflow-x:auto;">${p1.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
                <button onclick="injectCode(this)" data-code="${encodeURIComponent(p1)}" style="margin-top:5px; padding:5px; background:#10b981; color:white; border:none; border-radius:4px; cursor:pointer;">Aplicar no Live Preview</button><br><br>`;
            });

            // Formatando markdown básico
            formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            
            msgDiv.innerHTML = `<strong>NeuroEngine:</strong><br>${formattedText}`;
        }
        
        chatHistory.appendChild(msgDiv);
        scrollToBottom();
    }

    // Lida com o envio de mensagem para o Node.js Backend
    async function sendMessage(hasScreenshot = false) {
        const message = chatInput.value.trim();
        if (!message) return;

        chatInput.value = '';
        const btnOriginalText = btnSend.innerHTML;
        
        if (hasScreenshot) {
            addMessage(message + "<br><em>📸 (Anexou Visualização da Tela)</em>", true);
            btnSnap.innerHTML = '⚙️ Processando...';
            btnSnap.disabled = true;
        } else {
            addMessage(message, true);
            btnSend.innerHTML = '⚙️ Processando...';
            btnSend.disabled = true;
        }

        const formData = new FormData();
        formData.append('message', message);
        
        // Manda o context HTML atual do Live Preview para a IA saber o que tem lá
        const currentHtml = livePreview.innerHTML;
        if(currentHtml.trim().length > 0 && !currentHtml.includes('Aparecerá Aqui')) {
            formData.append('htmlContext', currentHtml);
        }

        try {
            if (hasScreenshot && window.html2canvas) {
                const canvas = await html2canvas(livePreview);
                canvas.toBlob(async (blob) => {
                    formData.append('screenshot', blob, 'preview.png');
                    await fetchBackend(formData, btnSnap, '📸 Enviar Visualização p/ IA (Corrigir Layout)');
                });
            } else {
                await fetchBackend(formData, btnSend, 'Enviar Comando');
            }
        } catch (error) {
            console.error(error);
            addMessage("Erro ao conversar com a IA. O servidor Node.js está rodando na porta 3001?", false);
            restoreButtons();
        }
        
        function restoreButtons() {
            btnSend.innerHTML = 'Enviar Comando';
            btnSnap.innerHTML = '📸 Enviar Visualização p/ IA (Corrigir Layout)';
            btnSend.disabled = false;
            btnSnap.disabled = false;
        }
    }

    async function fetchBackend(formData, btnElement, restoreText) {
        try {
            const response = await fetch('http://localhost:3001/api/chat', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            
            if (data.reply) {
                addMessage(data.reply, false);
            } else {
                addMessage("Desculpe, deu um erro interno na IA.", false);
            }
        } catch(e) {
            addMessage("Erro de conexão com o terminal IA (Port 3001).", false);
        }

        btnElement.innerHTML = restoreText;
        btnElement.disabled = false;
        document.getElementById('btn-send-chat').disabled = false;
    }

    // Event Listeners
    btnSend.addEventListener('click', () => sendMessage(false));
    btnSnap.addEventListener('click', () => {
        if (!chatInput.value.trim()) {
            chatInput.value = "Por favor, olhe como a página está ficando. Pode corrigir a formatação?";
        }
        sendMessage(true);
    });
    
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(false);
        }
    });
});

// Adicionada lógica do App do Chat
window.chatApp = {
    currentItemId: null,
    currentType: null,

    async loadList() {
        const typeSelect = document.getElementById('ai-studio-type');
        const itemSelect = document.getElementById('ai-studio-item');
        const loadBtn = document.getElementById('ai-studio-load-btn');
        const type = typeSelect.value;
        
        itemSelect.innerHTML = '<option>Carregando...</option>';
        itemSelect.style.display = 'block';
        loadBtn.style.display = 'none';

        // Usa a api.js já importada na tela
        const data = await wpAPI.fetchContent(type);
        
        if(!data || data.length === 0) {
            itemSelect.innerHTML = '<option>Nenhum item encontrado.</option>';
            return;
        }

        itemSelect.innerHTML = '<option value="">-- Selecione para Editar --</option>';
        data.forEach(item => {
            const title = item.title && item.title.rendered ? item.title.rendered : `Sem Título #${item.id}`;
            itemSelect.innerHTML += `<option value="${item.id}">${title} (ID: ${item.id})</option>`;
        });
        
        loadBtn.style.display = 'block';
    },

    async loadItem() {
        const type = document.getElementById('ai-studio-type').value;
        const id = document.getElementById('ai-studio-item').value;
        if(!id) return;

        const titleSpan = document.getElementById('ai-studio-title');
        titleSpan.innerText = `Baixando dados...`;

        const data = await wpAPI.getContent(type, id);
        if(data) {
            this.currentItemId = id;
            this.currentType = type;
            document.getElementById('live-preview').innerHTML = data.content.rendered;
            titleSpan.innerText = `Editando Rascunho: ${data.title.rendered}`;
            
            // Oculta o campo de título novo se estiver aparecendo
            document.getElementById('ai-studio-new-title').style.display = 'none';
            document.getElementById('ai-studio-suggest-btn').style.display = 'none';
            document.getElementById('ai-studio-preview-btn').style.display = 'block';
            document.getElementById('ai-studio-item').style.display = 'block';
            
            this.updateAbidusScore();

            addMessage(`Acabei de carregar o componente **${data.title.rendered}** na sua tela visual. O que você gostaria de mudar nele?`);
        } else {
            titleSpan.innerText = `Erro ao carregar.`;
        }
    },

    createNew() {
        this.currentItemId = null;
        this.currentType = document.getElementById('ai-studio-type').value;
        
        // UI Adjustments
        document.getElementById('ai-studio-item').style.display = 'none';
        document.getElementById('ai-studio-load-btn').style.display = 'none';
        
        const titleInput = document.getElementById('ai-studio-new-title');
        titleInput.style.display = 'block';
        titleInput.value = "";
        titleInput.focus();
        
        const suggestBtn = document.getElementById('ai-studio-suggest-btn');
        suggestBtn.style.display = 'block';
        
        document.getElementById('live-preview').innerHTML = '<h1 style="color: #1a202c; font-size: 24px; text-align: center; margin-top: 50px; opacity: 0.5;">Comece a escrever seu novo rascunho aqui ou peça para a IA criar algo...</h1>';
        document.getElementById('ai-studio-title').innerText = "Novo Rascunho (" + (this.currentType === 'pages' ? 'Página' : 'Post') + ")";
        
        addMessage(`Ótimo! Vamos criar um novo **${this.currentType === 'pages' ? 'Página' : 'Post'}**. Digite o título no campo acima e use o chat para me dizer o que deseja criar.`);
    },

    async saveToWP() {
        const titleInput = document.getElementById('ai-studio-new-title');
        const isNew = !this.currentItemId;
        const newTitle = titleInput.value.trim();
        const type = document.getElementById('ai-studio-type').value;

        if (isNew && !newTitle) {
            alert("Por favor, digite um título para o novo rascunho.");
            titleInput.focus();
            return;
        }

        const htmlContent = document.getElementById('live-preview').innerHTML;
        const btn = document.querySelector('button[onclick="window.chatApp.saveToWP()"]');
        const originalText = btn.innerText;
        btn.innerText = "Salvando...";
        btn.disabled = true;

        const payload = {
            content: htmlContent,
            status: "draft"
        };

        if (isNew) {
            payload.title = newTitle;
        }

        const result = await wpAPI.saveContent(type, payload, this.currentItemId);
        
        if(result && result.id) {
            this.currentItemId = result.id;
            this.currentType = type;
            titleInput.style.display = 'none';
            document.getElementById('ai-studio-suggest-btn').style.display = 'none';
            document.getElementById('ai-studio-preview-btn').style.display = 'block';
            document.getElementById('ai-studio-title').innerText = `Editando Rascunho: ${result.title.rendered || newTitle}`;
            alert(`Sucesso! ${isNew ? 'Criado e ' : ''}salvo no WordPress como Rascunho (ID: ${result.id}).`);
            
            // Se era novo, volta para o modo edição normal
            if(isNew) {
                // Notifica o usuário
                addMessage(`Rascunho criado com sucesso! Agora você já pode continuar editando ele normalmente.`);
            }
        } else {
            alert("Erro ao salvar no WordPress.");
        }
        
        btn.innerText = originalText;
        btn.disabled = false;
    },

    async suggestTitle() {
        const type = document.getElementById('ai-studio-type').value;
        const titleInput = document.getElementById('ai-studio-new-title');
        
        const prompt = `Atue como um Especialista em SEO Local e Copywriter focado em conversão. 
Sua tarefa é sugerir um título altamente persuasivo para um novo conteúdo de ${type === 'pages' ? 'Página' : 'Post'}.
O foco é Psicoterapia, TEA em Adultos (Autismo Leve), Masking e Burnout Autista.
Use o Método Abidos: Foque na dor, autoridade e localização (Goiânia).

Retorne APENAS uma sugestão de título curta e impactante.`;

        const suggestion = await gemini.callAPI(prompt);
        if(suggestion) {
            titleInput.value = suggestion;
            addMessage(`💡 Sugestão de Título: **"${suggestion}"**. O que achou?`);
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

        // 1. SEO Local
        const hasGoiania = text.toLowerCase().includes('goiânia');
        if (hasGoiania) {
            score += 20;
            document.getElementById('check-seo').innerHTML = '✅ SEO Local: Goiânia detectado';
            document.getElementById('check-seo').style.color = '#059669';
        } else {
            suggestions.push("Adicione 'Goiânia' para melhorar o SEO local.");
            document.getElementById('check-seo').innerHTML = '❌ SEO Local: Menção a Goiânia';
            document.getElementById('check-seo').style.color = '#dc2626';
        }

        // 2. E-E-A-T
        const eatKeywords = ['crp', 'crm', 'psicoterapeuta', 'psicóloga', 'doutor', 'especialista'];
        if (eatKeywords.some(k => text.toLowerCase().includes(k))) {
            score += 20;
            document.getElementById('check-eat').innerHTML = '✅ E-E-A-T: Autoridade Confirmada';
            document.getElementById('check-eat').style.color = '#059669';
        } else {
            suggestions.push("Mencione seu CRP ou especialidade para gerar confiança.");
            document.getElementById('check-eat').innerHTML = '❌ E-E-A-T: Registro Profissional/CRM';
            document.getElementById('check-eat').style.color = '#dc2626';
        }

        // 3. Dor (Neurodivergência)
        const painKeywords = ['tea', 'autismo', 'masking', 'burnout', 'neurodivergente', 'dificuldade', 'sofrimento'];
        if (painKeywords.some(k => text.toLowerCase().includes(k))) {
            score += 20;
            document.getElementById('check-pain').innerHTML = '✅ Copy: Foco na Dor validado';
            document.getElementById('check-pain').style.color = '#059669';
        } else {
            suggestions.push("Foque mais na dor do autismo leve/masking.");
            document.getElementById('check-pain').innerHTML = '❌ Copy: Foco na Dor (Neurodivergência)';
            document.getElementById('check-pain').style.color = '#dc2626';
        }

        // 4. CTA / Conversão
        if (html.toLowerCase().includes('href') && (html.toLowerCase().includes('agende') || html.toLowerCase().includes('whatsapp') || html.toLowerCase().includes('contato'))) {
            score += 20;
            document.getElementById('check-cta').innerHTML = '✅ Conversão: CTA detectado';
            document.getElementById('check-cta').style.color = '#059669';
        } else {
            suggestions.push("Falta um botão de agendamento claro.");
            document.getElementById('check-cta').innerHTML = '❌ Conversão: Botão de Agendamento';
            document.getElementById('check-cta').style.color = '#dc2626';
        }

        // 5. Keyword no H1
        const h1 = document.querySelector('#live-preview h1');
        if (h1 && (h1.innerText.toLowerCase().includes('autismo') || h1.innerText.toLowerCase().includes('tea') || h1.innerText.toLowerCase().includes('terapia'))) {
            score += 20;
            document.getElementById('check-keyword').innerHTML = '✅ Palavra-Chave no H1';
            document.getElementById('check-keyword').style.color = '#059669';
        } else {
            suggestions.push("Coloque a palavra-chave principal no título (H1).");
            document.getElementById('check-keyword').innerHTML = '❌ Palavra-Chave Principal no H1';
            document.getElementById('check-keyword').style.color = '#dc2626';
        }

        // Atualiza Barra e Texto
        document.getElementById('abidus-progress').style.width = score + '%';
        document.getElementById('abidus-percentage').innerText = score + '%';
        const suggestionText = score === 100 ? "🚀 Conteúdo 100% otimizado!" : "💡 Falta: " + (suggestions[0] || "");
        document.getElementById('abidus-suggestion').innerText = suggestionText;
    },

    previewDraft() {
        if (!this.currentItemId) return alert("Salve o rascunho primeiro para visualizar.");
        
        // Constrói URL de Preview do WordPress
        // A URL base está no wpAPI.url (removemos o /wp-json/wp/v2)
        const baseUrl = wpAPI.url.replace('/wp-json/wp/v2', '');
        const previewUrl = `${baseUrl}/?p=${this.currentItemId}&preview=true`;
        window.open(previewUrl, '_blank');
    }
};

// Injeta código e atualiza checklist
window.injectCode = function(btn) {
    const code = decodeURIComponent(btn.getAttribute('data-code'));
    const preview = document.getElementById('live-preview');
    if (preview) {
        preview.innerHTML = code;
        window.chatApp.updateAbidusScore();
        
        // Feedback visual no chat
        const status = document.createElement('div');
        status.style.fontSize = '10px';
        status.style.color = '#10b981';
        status.style.marginTop = '2px';
        status.innerText = '✅ Aplicado ao Canvas!';
        btn.parentNode.appendChild(status);
        btn.style.opacity = '0.5';
        btn.disabled = true;
    }
};

// Start system
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
