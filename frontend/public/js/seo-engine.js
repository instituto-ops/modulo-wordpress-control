/**
 * FASE 6: Integrações Especiais (E-E-A-T)
 * Frontend - Lógica do SEO Engine e Silos
 */

const seoEngine = {
    container: document.getElementById('view-seo'),

    init: function() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="abidos-glass p-6 h-full flex flex-col">
                <div class="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                    <div>
                        <h2 class="text-xl font-semibold text-cyan-400">Auditoria de Silos SEO (E-E-A-T)</h2>
                        <p class="text-sm text-gray-400">Mapeamento de Autoridade e Interlinking Clínico.</p>
                    </div>
                    <button id="btn-scan-seo" class="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded flex items-center transition-colors shadow-lg shadow-cyan-500/20">
                        <i data-lucide="scan" class="w-4 h-4 mr-2"></i> Iniciar Varredura
                    </button>
                </div>

                <div id="seo-results" class="flex-1 overflow-y-auto space-y-4">
                    <div class="flex flex-col items-center justify-center h-full text-gray-500 space-y-4">
                        <i data-lucide="network" class="w-16 h-16 text-white/5"></i>
                        <p>Clique em "Iniciar Varredura" para mapear a estrutura do site.</p>
                    </div>
                </div>
            </div>
        `;

        if (window.lucide) window.lucide.createIcons();

        document.getElementById('btn-scan-seo').addEventListener('click', async () => {
            const btn = document.getElementById('btn-scan-seo');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i data-lucide="loader" class="w-4 h-4 mr-2 animate-spin"></i> Auditando WP...';
            btn.disabled = true;

            const resultsDiv = document.getElementById('seo-results');
            resultsDiv.innerHTML = '<div class="p-8 text-center text-cyan-400 animate-pulse">Estabelecendo conexão com WordPress API...</div>';

            try {
                const response = await fetch('/api/seo/analyze-silos');
                const data = await response.json();

                if (data.success) {
                    this.renderResults(data);
                } else {
                    resultsDiv.innerHTML = `<div class="p-4 bg-red-900/20 border border-red-800 rounded text-red-400">Erro: ${data.message}</div>`;
                }
            } catch (error) {
                console.error('Erro SEO:', error);
                resultsDiv.innerHTML = `<div class="p-4 bg-red-900/20 border border-red-800 rounded text-red-400">Falha de comunicação com o servidor.</div>`;
            } finally {
                btn.innerHTML = originalText;
                btn.disabled = false;
                if (window.lucide) window.lucide.createIcons();
            }
        });
    },

    renderResults: function(data) {
        const resultsDiv = document.getElementById('seo-results');

        let html = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div class="bg-[#0a1128] border border-gray-700 rounded-lg p-4 flex items-center justify-between">
                    <div>
                        <p class="text-sm text-gray-400">Páginas Analisadas</p>
                        <h3 class="text-2xl font-bold text-white">${data.total_pages || 0}</h3>
                    </div>
                    <div class="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/30">
                        <i data-lucide="file-text" class="text-blue-400 w-5 h-5"></i>
                    </div>
                </div>
                <div class="bg-[#0a1128] border border-red-900/50 rounded-lg p-4 flex items-center justify-between">
                    <div>
                        <p class="text-sm text-gray-400">Páginas Órfãs (Sem Links)</p>
                        <h3 class="text-2xl font-bold text-red-400">${data.orphan_pages ? data.orphan_pages.length : 0}</h3>
                    </div>
                    <div class="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/30">
                        <i data-lucide="alert-triangle" class="text-red-400 w-5 h-5"></i>
                    </div>
                </div>
            </div>

            <h3 class="text-lg font-medium text-white mb-3">Recomendações de Linkagem (Silos)</h3>
            <div class="space-y-3">
        `;

        if (data.suggestions && data.suggestions.length > 0) {
            data.suggestions.forEach(sug => {
                html += `
                    <div class="bg-[#0a1128] border border-gray-700 rounded-lg p-4 flex items-start">
                        <div class="mt-1 mr-3 text-cyan-400">
                            <i data-lucide="link" class="w-4 h-4"></i>
                        </div>
                        <div>
                            <p class="text-sm text-gray-300">${sug}</p>
                        </div>
                    </div>
                `;
            });
        } else {
            html += `<p class="text-gray-500 italic text-sm">Nenhuma recomendação no momento.</p>`;
        }

        html += `</div>`;
        resultsDiv.innerHTML = html;
        if (window.lucide) window.lucide.createIcons();
    }
};

document.addEventListener('DOMContentLoaded', () => {
    seoEngine.init();
});
