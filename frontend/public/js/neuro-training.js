window.neuroTraining = {
    mediaRecorder: null,
    audioChunks: [],
    isRecording: false,
    visualizerInterval: null,

    async init() {
        console.log("🧠 Neuro-Training: Voice-to-Logic Engine Ready.");
        this.setupListeners();
        await this.loadMemory();
    },

    setupListeners() {
        const btn = document.getElementById('btn-start-voice');
        if (btn) btn.addEventListener('click', () => this.toggleRecording());
    },

    async toggleRecording() {
        if (this.isRecording) {
            this.stopRecording();
        } else {
            await this.startRecording();
        }
    },

    async startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(stream);
            this.audioChunks = [];
            this.isRecording = true;

            const btn = document.getElementById('btn-start-voice');
            btn.innerText = "🛑 PARAR ENTREVISTA";
            btn.style.background = "#ef4444";
            btn.classList.add('animate-pulse');

            this.startVisualizer();

            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };

            this.mediaRecorder.onstop = async () => {
                await this.processAudio();
            };

            this.mediaRecorder.start();
        } catch (err) {
            console.error("Erro ao acessar microfone:", err);
            alert("Erro ao acessar microfone. Verifique as permissões.");
        }
    },

    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
            this.stopVisualizer();

            const btn = document.getElementById('btn-start-voice');
            btn.innerText = "INICIAR ENTREVISTA";
            btn.style.background = "#6366f1";
            btn.classList.remove('animate-pulse');
        }
    },

    startVisualizer() {
        const bars = document.querySelectorAll('.pulse-bar');
        this.visualizerInterval = setInterval(() => {
            bars.forEach(bar => {
                const height = Math.floor(Math.random() * 60) + 10;
                bar.style.height = `${height}px`;
            });
        }, 100);
    },

    stopVisualizer() {
        clearInterval(this.visualizerInterval);
        const bars = document.querySelectorAll('.pulse-bar');
        bars.forEach(bar => bar.style.height = '10px');
    },

    async processAudio() {
        const status = document.getElementById('nt-extraction-status');
        status.innerHTML = "⏳ Transcrevendo e extraindo DNA clínico...";

        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('audio', audioBlob);

        try {
            const response = await fetch('/api/neuro-training/analyze-dna', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            if (data.success) {
                status.innerHTML = "✅ DNA Extraído com sucesso!";
                await this.loadMemory(); // Refresh rules list
            } else {
                status.innerHTML = `❌ Erro: ${data.error}`;
            }
        } catch (err) {
            console.error(err);
            status.innerHTML = "❌ Falha na conexão com Mission Control.";
        }
    },

    async loadMemory() {
        try {
            const response = await fetch('/api/neuro-training/memory');
            const data = await response.json();
            this.renderRules(data.style_rules || []);
            this.renderHistory(data.insights_history || []);
            
            const updateSpan = document.getElementById('memory-last-update');
            if (updateSpan && data.last_update) {
                updateSpan.innerText = new Date(data.last_update).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }
        } catch (err) {
            console.error("Falha ao carregar memória:", err);
        }
    },

    renderRules(rules) {
        const feed = document.getElementById('rules-feed');
        if (!feed) return;

        if (rules.length === 0) {
            feed.innerHTML = '<p style="color: #64748b; font-size: 13px; text-align: center; margin-top: 40px;">Buscando regras aprendidas...</p>';
            return;
        }

        feed.innerHTML = rules.map((r, i) => `
            <div class="card" style="background: white; border: 1px solid #e2e8f0; border-left: 4px solid #2dd4bf; padding: 15px; margin-bottom: 5px; animation: slideIn 0.3s ease;">
                <p style="text-transform: uppercase; font-size: 9px; font-weight: 900; color: #0d9488; margin-bottom: 5px; letter-spacing: 1px;">${r.categoria || 'EXTRAÇÃO'}</p>
                <p style="font-size: 13px; color: #334155; line-height: 1.5; margin: 0;">${r.regra || r}</p>
            </div>
        `).join('');
    },

    renderHistory(history) {
        const library = document.getElementById('neuro-insights-library');
        const list = document.getElementById('neuro-insights-history-list');
        if (!library || !list) return;

        if (history.length > 0) {
            library.style.display = 'block';
            list.innerHTML = history.map(h => `
                <div style="padding: 10px; border-bottom: 1px solid #f1f5f9;">
                    <p style="font-size: 12px; color: #64748b; line-height: 1.4; margin: 0;">${h.text}</p>
                </div>
            `).join('');
        }
    },

    toggleHistory() {
        const list = document.getElementById('neuro-insights-history-list');
        const btn = document.getElementById('btn-toggle-history');
        if (list.style.maxHeight === 'none') {
            list.style.maxHeight = '250px';
            btn.innerText = 'Ver Tudo';
        } else {
            list.style.maxHeight = 'none';
            btn.innerText = 'Recolher';
        }
    },

    async handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const status = document.getElementById('nt-extraction-status');
        status.innerHTML = `⏳ Processando documento técnico: ${file.name}...`;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/neuro-training/parse', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            if (data.success) {
                status.innerHTML = `✅ Lastro extraído de <b>${file.name}</b>. Analisando DNA...`;
                // Aqui poderíamos chamar uma API de ingestão de documento se necessário
            }
        } catch (e) {
            console.error(e);
            status.innerHTML = "❌ Erro ao processar documento.";
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    if (window.neuroTraining) window.neuroTraining.init();
});
