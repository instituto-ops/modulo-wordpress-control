/**
 * FASE 8: Growth & Marketing Module
 * Funções do Dashboard de Crescimento
 */

const growthEngine = {
    container: document.getElementById('view-growth'),

    init: function() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="abidos-glass p-6 h-full flex flex-col space-y-6">
                <div class="flex justify-between items-center mb-2 border-b border-white/10 pb-4">
                    <div>
                        <h2 class="text-xl font-semibold text-cyan-400">Motor de Crescimento (Growth OS)</h2>
                        <p class="text-sm text-gray-400">Ads, Feedback Clínico e IA de WhatsApp.</p>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto scrollbar-hide pb-10">

                    <!-- Feedback Clínico -->
                    <div class="bg-[#0a1128] border border-gray-700 rounded-lg p-5">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-white font-medium">Ciclo de Conteúdo (Reels)</h3>
                            <button id="btn-suggest-reels" class="text-xs bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded transition">Sugerir Pautas</button>
                        </div>
                        <p class="text-xs text-gray-400 mb-3">Baseado nas palavras-chave anonimizadas das últimas sessões.</p>
                        <div id="reels-suggestions" class="space-y-3">
                            <p class="text-gray-500 text-sm italic">Clique para gerar ideias baseadas nas dores dos pacientes.</p>
                        </div>
                    </div>

                    <!-- SEO Semântico via Chat -->
                    <div class="bg-[#0a1128] border border-gray-700 rounded-lg p-5">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-white font-medium">SEO Semântico Baseado no Bot</h3>
                            <button id="btn-suggest-articles" class="text-xs bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded transition">Sugerir Artigos</button>
                        </div>
                        <p class="text-xs text-gray-400 mb-3">Títulos baseados nas dúvidas exatas deixadas no chat do site.</p>
                        <div id="article-suggestions" class="space-y-3">
                            <p class="text-gray-500 text-sm italic">Nenhuma dúvida logada ainda. Simule enviando dúvidas pro bot.</p>
                        </div>
                    </div>

                    <!-- Teste IA WhatsApp Triage -->
                    <div class="bg-[#0a1128] border border-gray-700 rounded-lg p-5 md:col-span-2">
                        <h3 class="text-white font-medium mb-2">Simulador IA WhatsApp (Triagem Ericksoniana)</h3>
                        <p class="text-xs text-gray-400 mb-4">Teste o tom de voz do bot de triagem do Dr. Victor.</p>
                        <div class="flex space-x-2">
                            <input type="text" id="wp-msg-input" class="flex-1 bg-[#05080f] border border-gray-600 rounded p-2 text-white text-sm" placeholder="Ex: Oi, vi o anúncio e sofro de muita ansiedade...">
                            <button id="btn-test-whatsapp" class="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded text-sm transition flex items-center">
                                <i data-lucide="message-circle" class="w-4 h-4 mr-1"></i> Simular Lead
                            </button>
                        </div>
                        <div id="wp-response-box" class="mt-4 hidden">
                            <div class="bg-green-900/20 border border-green-800/50 rounded p-3 text-green-100 text-sm">
                                <strong>Voz da Clínica:</strong> <span id="wp-response-text">...</span>
                            </div>
                        </div>
                    </div>

                    <!-- Ads Dashboard Mock -->
                    <div class="bg-[#0a1128] border border-gray-700 rounded-lg p-5 md:col-span-2 flex items-center justify-between opacity-70">
                        <div>
                            <h3 class="text-white font-medium">Dashboard Google Ads & Landing Pages</h3>
                            <p class="text-xs text-gray-400">Em breve: Integração direta com UTMs para alterar a página de destino (TEA vs Hipnose).</p>
                        </div>
                        <i data-lucide="bar-chart-2" class="w-8 h-8 text-gray-500"></i>
                    </div>

                </div>
            </div>
        `;

        if (window.lucide) window.lucide.createIcons();
        this.bindEvents();
    },

    bindEvents: function() {
        // Simular injeção de keywords anonimizadas pro teste
        fetch('/api/clinical-feedback', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ keywords: ["burnout", "ansiedade", "insônia", "burnout"] })
        });

        // Simular injeção de dúvida no bot
        fetch('/api/seo/log-doubt', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ doubt: "como saber se sou autista depois de adulto" })
        });

        // Reels Suggestions
        document.getElementById('btn-suggest-reels').addEventListener('click', async (e) => {
            const btn = e.target;
            btn.innerText = 'Processando...';
            btn.disabled = true;

            try {
                const res = await fetch('/api/content-suggestions');
                const data = await res.json();
                const container = document.getElementById('reels-suggestions');
                container.innerHTML = '';

                if (data.suggestions && data.suggestions.length > 0) {
                    data.suggestions.forEach(s => {
                        container.innerHTML += `
                            <div class="bg-[#05080f] p-3 rounded border border-gray-800">
                                <h4 class="text-cyan-400 text-sm font-semibold">${s.title || s.titulo}</h4>
                                <p class="text-xs text-gray-300 mt-1">${s.script_idea || s.ideia}</p>
                                <p class="text-xs text-blue-400 mt-2 font-medium">CTA: ${s.cta || s.chamada}</p>
                            </div>
                        `;
                    });
                } else {
                    container.innerHTML = '<p class="text-sm text-gray-400">Sem dados suficientes.</p>';
                }
            } catch (err) {
                console.error(err);
            } finally {
                btn.innerText = 'Sugerir Pautas';
                btn.disabled = false;
            }
        });

        // Article Suggestions
        document.getElementById('btn-suggest-articles').addEventListener('click', async (e) => {
            const btn = e.target;
            btn.innerText = 'Processando...';
            btn.disabled = true;

            try {
                const res = await fetch('/api/seo/semantic-article-suggestions');
                const data = await res.json();
                const container = document.getElementById('article-suggestions');
                container.innerHTML = '';

                if (data.articles && data.articles.length > 0) {
                    data.articles.forEach(a => {
                        container.innerHTML += `
                            <div class="bg-[#05080f] p-3 rounded border border-gray-800">
                                <h4 class="text-green-400 text-sm font-semibold">${a.title || a.titulo}</h4>
                                <p class="text-xs text-gray-400 mt-1"><span class="font-bold">Foco SEO:</span> ${a.target_keyword || a.keyword}</p>
                                <p class="text-xs text-gray-300 mt-1">Por que? ${a.rationale || a.motivo}</p>
                            </div>
                        `;
                    });
                } else {
                    container.innerHTML = '<p class="text-sm text-gray-400">Sem dados suficientes do bot.</p>';
                }
            } catch (err) {
                console.error(err);
            } finally {
                btn.innerText = 'Sugerir Artigos';
                btn.disabled = false;
            }
        });

        // WhatsApp Triage Simulator
        document.getElementById('btn-test-whatsapp').addEventListener('click', async (e) => {
            const btn = e.currentTarget;
            const input = document.getElementById('wp-msg-input');
            const responseBox = document.getElementById('wp-response-box');
            const responseText = document.getElementById('wp-response-text');

            if (!input.value.trim()) return;

            btn.innerHTML = '<i data-lucide="loader" class="w-4 h-4 mr-1 animate-spin"></i> Digitando...';
            btn.disabled = true;
            if (window.lucide) window.lucide.createIcons();

            try {
                const res = await fetch('/api/whatsapp/triage', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ message: input.value.trim() })
                });
                const data = await res.json();

                responseBox.classList.remove('hidden');
                responseText.innerText = data.response || data.error;

            } catch (err) {
                console.error(err);
                responseBox.classList.remove('hidden');
                responseText.innerText = "Falha ao contactar a IA de Triagem.";
            } finally {
                btn.innerHTML = '<i data-lucide="message-circle" class="w-4 h-4 mr-1"></i> Simular Lead';
                btn.disabled = false;
                if (window.lucide) window.lucide.createIcons();
            }
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // Adicionar listener para view growth
    document.addEventListener('viewChanged', (e) => {
        if(e.detail === 'growth') growthEngine.init();
    });
});
