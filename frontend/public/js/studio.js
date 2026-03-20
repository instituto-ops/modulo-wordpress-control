/**
 * FASE 5: The Cockpit (Frontend & UX)
 * Gestão assíncrona de rascunhos (Mission Control Pipeline)
 */

const studio = {
    form: document.getElementById('form-enqueue'),
    temaInput: document.getElementById('input-tema'),
    avatarInput: document.getElementById('input-avatar'),
    pipelineList: document.getElementById('pipeline-list'),
    queueCount: document.getElementById('queue-count'),
    draftCount: document.getElementById('draft-count'),

    init: function() {
        if (!this.form) return;

        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const tema = this.temaInput.value.trim();
            const avatar = this.avatarInput.value.trim();

            if (!tema) return;

            const submitBtn = this.form.querySelector('button');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<div class="pipeline-spinner mr-2"></div> Iniciando...';
            submitBtn.disabled = true;

            try {
                const response = await fetch('/api/pipeline/enqueue', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ tema, pacienteAvatar: avatar })
                });

                const result = await response.json();

                if (result.success) {
                    this.temaInput.value = '';
                    this.avatarInput.value = '';
                    this.fetchStatus(); // Atualizar lista imediatamente
                } else {
                    alert('Erro ao enfileirar: ' + result.error);
                }
            } catch (error) {
                console.error('Erro de requisição:', error);
                alert('Erro de rede ao contactar servidor.');
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });

        // Polling do status a cada 5 segundos
        setInterval(() => this.fetchStatus(), 5000);
        this.fetchStatus();
    },

    fetchStatus: async function() {
        try {
            const res = await fetch('/api/pipeline/status');
            const data = await res.json();

            // Atualiza Dashboard Counters
            if (this.queueCount) this.queueCount.textContent = data.queue.length;
            if (this.draftCount) this.draftCount.textContent = data.drafts.length;

            this.renderPipeline(data.queue, data.drafts);
        } catch (error) {
            console.error('Erro ao buscar status:', error);
        }
    },

    renderPipeline: function(queue, drafts) {
        if (!this.pipelineList) return;
        this.pipelineList.innerHTML = '';

        if (queue.length === 0 && drafts.length === 0) {
            this.pipelineList.innerHTML = '<p class="text-gray-500 text-sm italic p-4 text-center">Nenhum artigo na fila ou rascunho disponível.</p>';
            return;
        }

        const renderItem = (item, isDraft) => {
            let statusIcon = '';
            let statusText = '';
            let statusColor = '';

            if (isDraft) {
                statusIcon = 'check-circle';
                statusText = 'Pronto para WP';
                statusColor = 'text-green-400';
            } else {
                switch(item.status) {
                    case 'queued':
                        statusIcon = 'clock'; statusText = 'Na Fila'; statusColor = 'text-gray-400'; break;
                    case 'processing':
                        statusIcon = 'loader'; statusText = 'Gerando (Agent)...'; statusColor = 'text-cyan-400 animate-spin'; break;
                    case 'refining':
                        statusIcon = 'refresh-cw'; statusText = 'Auto-corrigindo (Inspetor)'; statusColor = 'text-yellow-400'; break;
                    case 'manual_intervention':
                        statusIcon = 'alert-triangle'; statusText = 'Revisão Manual Necessária'; statusColor = 'text-red-400'; break;
                    default:
                        statusIcon = 'help-circle'; statusText = 'Desconhecido'; statusColor = 'text-gray-400';
                }
            }

            const div = document.createElement('div');
            div.className = 'pipeline-item';
            div.innerHTML = `
                <div class="flex-1">
                    <p class="text-sm font-medium text-white truncate w-48 md:w-full" title="${item.tema}">${item.tema}</p>
                    <div class="flex items-center mt-1">
                        <i data-lucide="${isDraft ? 'check-circle' : 'activity'}" class="w-3 h-3 mr-1 text-gray-500"></i>
                        <span class="text-xs text-gray-500">${isDraft ? 'Aprovado E-E-A-T' : `Tentativa ${item.attempts || 0}/3`}</span>
                    </div>
                </div>
                <div class="flex items-center ${statusColor} text-sm font-medium">
                    <i data-lucide="${statusIcon.replace(' animate-spin', '')}" class="w-4 h-4 mr-1 ${statusIcon.includes('spin') ? 'animate-spin' : ''}"></i>
                    ${statusText}
                </div>
                ${isDraft ? `
                <button class="ml-4 px-3 py-1 bg-green-900/40 border border-green-500/30 text-green-400 rounded hover:bg-green-800/50 text-xs transition-colors">
                    Publicar
                </button>
                ` : ''}
            `;
            this.pipelineList.appendChild(div);
        };

        // Renderiza itens em processo primeiro
        queue.forEach(q => renderItem(q, false));
        // Renderiza aprovados depois
        drafts.forEach(d => renderItem(d, true));

        // Reinicializa os ícones do Lucide para os novos elementos dinâmicos
        if (window.lucide) window.lucide.createIcons();
    }
};

document.addEventListener('DOMContentLoaded', () => {
    studio.init();
});
