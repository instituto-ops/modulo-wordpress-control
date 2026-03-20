/**
 * FASE 5: The Cockpit (Frontend & UX)
 * Interface de comando vertical com a IA (Treinamento de Estilo)
 */

const chat = {
    form: document.getElementById('form-chat'),
    input: document.getElementById('chat-input'),
    messagesContainer: document.getElementById('chat-messages'),

    init: function() {
        if (!this.form) return;

        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const text = this.input.value.trim();
            if (!text) return;

            // Adiciona mensagem do usuário
            this.addMessage(text, 'user');
            this.input.value = '';

            // Mostrar loader
            const loaderId = this.addLoader();

            try {
                const response = await fetch('/api/agents/learn-style', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ textoOriginal: text })
                });

                const result = await response.json();

                // Remove loader
                this.removeLoader(loaderId);

                if (result.success) {
                    let msg = `Análise concluída. DNA linguístico atualizado.`;
                    if (result.regras_adicionadas && result.regras_adicionadas.length > 0) {
                        msg += `<br>Novas regras identificadas:<br><ul class="list-disc pl-5 mt-2 space-y-1">`;
                        result.regras_adicionadas.forEach(r => msg += `<li>${r}</li>`);
                        msg += `</ul>`;
                    } else {
                        msg += `<br>O texto adere ao estilo atual, nenhuma regra nova adicionada.`;
                    }
                    this.addMessage(msg, 'bot');
                } else {
                    this.addMessage('Erro na análise: ' + result.error, 'error');
                }
            } catch (error) {
                console.error('Erro de requisição (Chat):', error);
                this.removeLoader(loaderId);
                this.addMessage('Falha de conexão com a NeuroEngine.', 'error');
            }
        });

        // Auto-resize do textarea
        this.input.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });

        // Submeter com Enter (sem shift)
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.form.dispatchEvent(new Event('submit'));
            }
        });
    },

    addMessage: function(html, type) {
        const div = document.createElement('div');
        div.className = `flex items-start ${type === 'user' ? 'justify-end' : ''}`;

        let iconHtml = '';
        let bgClass = '';

        if (type === 'bot') {
            iconHtml = `<div class="w-8 h-8 rounded-full bg-cyan-900/50 flex items-center justify-center border border-cyan-400/30 flex-shrink-0 mr-3">
                            <i data-lucide="bot" class="w-4 h-4 text-cyan-400"></i>
                        </div>`;
            bgClass = 'bg-[#0a1128] border border-gray-700';
        } else if (type === 'error') {
             iconHtml = `<div class="w-8 h-8 rounded-full bg-red-900/50 flex items-center justify-center border border-red-400/30 flex-shrink-0 mr-3">
                            <i data-lucide="alert-triangle" class="w-4 h-4 text-red-400"></i>
                        </div>`;
            bgClass = 'bg-red-900/20 border border-red-800/50 text-red-200';
        } else {
            bgClass = 'bg-cyan-900/40 border border-cyan-700/50 text-cyan-50 ml-12';
        }

        div.innerHTML = `
            ${type !== 'user' ? iconHtml : ''}
            <div class="${bgClass} rounded-lg p-3 max-w-[80%] text-sm shadow-md">
                ${html}
            </div>
        `;

        this.messagesContainer.appendChild(div);
        this.scrollToBottom();

        if (window.lucide) window.lucide.createIcons();
    },

    addLoader: function() {
        const id = 'loader-' + Date.now();
        const div = document.createElement('div');
        div.id = id;
        div.className = 'flex items-start';
        div.innerHTML = `
            <div class="w-8 h-8 rounded-full bg-cyan-900/50 flex items-center justify-center border border-cyan-400/30 flex-shrink-0 mr-3">
                <i data-lucide="bot" class="w-4 h-4 text-cyan-400 animate-pulse"></i>
            </div>
            <div class="bg-[#0a1128] border border-gray-700 rounded-lg p-3 text-sm flex space-x-2 items-center">
                <div class="w-2 h-2 rounded-full bg-cyan-500 animate-bounce" style="animation-delay: 0ms"></div>
                <div class="w-2 h-2 rounded-full bg-cyan-500 animate-bounce" style="animation-delay: 150ms"></div>
                <div class="w-2 h-2 rounded-full bg-cyan-500 animate-bounce" style="animation-delay: 300ms"></div>
                <span class="text-cyan-400/70 ml-2 text-xs">Analisando DNA...</span>
            </div>
        `;
        this.messagesContainer.appendChild(div);
        this.scrollToBottom();
        if (window.lucide) window.lucide.createIcons();
        return id;
    },

    removeLoader: function(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    },

    scrollToBottom: function() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    chat.init();
});
