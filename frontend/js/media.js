const mediaLibrary = {
    pendingFiles: [],
    currentFile: null,
    usageCache: {}, 
    selectedMedia: null, 

    init() {
        this.bindEvents();
        this.loadLibrary();
    },

    bindEvents() {
        const dropZone = document.getElementById('drop-zone');
        const fileInput = document.getElementById('media-upload-input');

        if (dropZone) {
            dropZone.onclick = (e) => {
                if (e.target.id === 'drop-zone' || e.target.parentElement?.id === 'drop-zone') {
                    fileInput.click();
                }
            };
            dropZone.ondragover = (e) => { e.preventDefault(); dropZone.style.borderColor = 'var(--color-secondary)'; };
            dropZone.ondragleave = () => { dropZone.style.borderColor = 'var(--color-border)'; };
            dropZone.ondrop = (e) => {
                e.preventDefault();
                dropZone.style.borderColor = 'var(--color-border)';
                this.handleFiles(e.dataTransfer.files);
            };
        }
        if (fileInput) fileInput.onchange = (e) => this.handleFiles(e.target.files);
    },

    async loadLibrary() {
        const container = document.getElementById('media-list-container');
        if (!container) return;

        // Não limpamos tudo para evitar o flash irritante se já houver mídias
        if (container.children.length === 0) {
            container.innerHTML = '<p style="text-align: center; grid-column: 1/-1; opacity: 0.5;">Sincronizando...</p>';
        }
        
        try {
            const [media, pages, posts] = await Promise.all([
                wpAPI.fetchMedia(100),
                wpAPI.fetchContent('pages', true),
                wpAPI.fetchContent('posts', true)
            ]);
            
            this.usageCache = {};
            [...pages, ...posts].forEach(item => {
                const content = item.content ? item.content.rendered : "";
                const featuredId = item.featured_media;
                if (Array.isArray(media)) {
                    media.forEach(m => {
                        if (content.includes(m.source_url) || featuredId === m.id) {
                            if (!this.usageCache[m.source_url]) this.usageCache[m.source_url] = [];
                            const title = item.title.rendered || `Conteúdo #${item.id}`;
                            if (!this.usageCache[m.source_url].includes(title)) this.usageCache[m.source_url].push(title);
                        }
                    });
                }
            });

            container.innerHTML = '';
            media.forEach(item => {
                const hasAlt = item.alt_text && item.alt_text.trim().length > 0;
                const altMatch = ["Psicólogo", "TEA", "Goiânia", "Lawrence"].some(k => (item.alt_text||"").toLowerCase().includes(k.toLowerCase()));
                const isSelected = this.selectedMedia && item.id === this.selectedMedia.id;
                
                const card = document.createElement('div');
                card.className = `card media-thumb-card ${isSelected ? 'selected' : ''}`;
                card.style.cssText = `
                    padding: 8px; cursor: pointer; 
                    border: 2px solid ${isSelected ? 'var(--color-secondary)' : (altMatch ? '#22c55e' : (hasAlt ? '#cbd5e1' : '#f43f5e'))};
                    transition: all 0.2s; position: relative; height: 160px;
                    ${isSelected ? 'transform: scale(1.02); box-shadow: 0 0 10px rgba(14, 165, 233, 0.3);' : ''}
                `;
                
                card.onclick = () => this.selectMedia(item);
                
                card.innerHTML = `
                    <div style="position: absolute; top: 4px; right: 4px; z-index: 5;">${altMatch ? '✅' : (hasAlt ? '⚠️' : '🚨')}</div>
                    <img src="${item.source_url}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px;">
                    <div style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.6); color: white; font-size: 9px; padding: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        ${item.title.rendered}
                    </div>
                `;
                container.appendChild(card);
            });

        } catch (error) { console.error(error); }
    },

    selectMedia(item) {
        this.selectedMedia = item;
        const panel = document.getElementById('media-editor-panel');
        const emptyState = document.getElementById('editor-empty-state');
        const activeState = document.getElementById('editor-active-state');
        
        panel.style.display = 'flex'; // Mudado para flex para manter estrutura
        emptyState.style.display = 'none';
        activeState.style.display = 'block';

        document.getElementById('edit-panel-preview').src = item.source_url;
        document.getElementById('edit-panel-title').value = item.title.rendered;
        document.getElementById('edit-panel-alt').value = item.alt_text || '';
        
        const usage = this.usageCache[item.source_url];
        const usageBox = document.getElementById('edit-panel-usage');
        usageBox.innerHTML = usage ? 
            `<small style="color: #0369a1; font-weight: bold;">🔗 Em uso em: ${usage.join(', ')}</small>` : 
            `<small style="color: #9a3412; font-weight: bold;">⚠️ Mídia Órfã (Sem uso detectado)</small>`;

        // Atualiza a galeria visualmente apenas (para mostrar a borda de seleção)
        this.renderGallerySelection();
    },

    renderGallerySelection() {
        // Em vez de recarregar tudo do servidor, apenas atualizamos as bordas no DOM atual
        const cards = document.querySelectorAll('.media-thumb-card');
        // No entanto, para simplicidade e precisão (metadados podem ter mudado), 
        // chamamos loadLibrary mas SEM o flash de loading
        this.loadLibrary();
    },

    async saveMediaPanel() {
        if (!this.selectedMedia) return;
        const title = document.getElementById('edit-panel-title').value;
        const alt = document.getElementById('edit-panel-alt').value;
        
        // Corrigido: Não usar 'event.currentTarget' que pode ser nulo em chamadas async
        const btn = document.querySelector('#editor-active-state .btn-primary');
        const originalText = btn.innerText;
        btn.innerText = "⏳ Salvando..."; btn.disabled = true;

        const result = await wpAPI.updateMedia(this.selectedMedia.id, { title, alt_text: alt });
        if (result) {
            alert("Otimização Abidos Salva!");
            this.loadLibrary();
        }
        btn.innerText = originalText; btn.disabled = false;
    },

    async suggestTitleIA_Panel() {
        if (!this.selectedMedia) return;
        const alt = document.getElementById('edit-panel-alt').value;
        const btn = document.querySelector('button[onclick*="suggestTitleIA_Panel"]');
        const originalText = btn.innerText;
        
        btn.innerText = "⏳..."; btn.disabled = true;
        try {
            const suggestion = await gemini.callAPI(`Atue como Especialista Abidos. Gere um título curto e estratégico (max 40 chars) para imagem com este Alt Text: "${alt}". Retorne apenas o nome limpo.`);
            if (suggestion) {
                document.getElementById('edit-panel-title').value = suggestion.replace(/^["']|["']$/g, '').trim();
            }
        } catch(e) { console.error(e); }
        btn.innerText = originalText; btn.disabled = false;
    },

    async suggestAltIA_Panel() {
        if (!this.selectedMedia) return;
        const title = document.getElementById('edit-panel-title').value;
        const btn = document.querySelector('button[onclick*="suggestAltIA_Panel"]');
        const originalText = btn.innerText;

        btn.innerText = "⏳..."; btn.disabled = true;
        try {
            const suggestion = await gemini.callAPI(`Atue como Especialista Abidos. Gere um Alt Text estratégico (max 120 chars) para a imagem: "${title}". Use 'Psicólogo Victor Lawrence' ou 'Goiânia' se apropriado. Retorne apenas o texto puro.`);
            if (suggestion) {
                document.getElementById('edit-panel-alt').value = suggestion.replace(/^["']|["']$/g, '').trim();
            }
        } catch(e) { console.error(e); }
        btn.innerText = originalText; btn.disabled = false;
    },

    async deleteMediaPanel() {
        if (!this.selectedMedia) return;
        if (confirm(`Excluir permanentemente "${this.selectedMedia.title.rendered}"?`)) {
            const result = await wpAPI.deleteMedia(this.selectedMedia.id);
            if (result) {
                document.getElementById('editor-active-state').style.display = 'none';
                document.getElementById('editor-empty-state').style.display = 'block';
                this.selectedMedia = null;
                this.loadLibrary();
            }
        }
    },

    copyToClipboardPanel() {
        if (this.selectedMedia) {
            navigator.clipboard.writeText(this.selectedMedia.source_url).then(() => alert("URL Copiada!"));
        }
    },

    handleFiles(files) {
        this.pendingFiles = Array.from(files);
        this.showNextFile();
    },

    async showNextFile() {
        if (this.pendingFiles.length === 0) return;
        this.currentFile = this.pendingFiles.shift();
        const modal = document.getElementById('upload-modal');
        document.getElementById('modal-img-preview').src = URL.createObjectURL(this.currentFile);
        document.getElementById('upload-title').value = this.currentFile.name.split('.')[0];
        modal.style.display = 'flex';
        
        const suggestion = await gemini.callAPI(`Gere Alt SEO para imagem: "${this.currentFile.name}".`);
        document.getElementById('upload-alt').value = suggestion ? suggestion.replace(/^["']|["']$/g, '').trim() : "";
    },

    async processUpload() {
        const title = document.getElementById('upload-title').value;
        const alt = document.getElementById('upload-alt').value;
        const result = await wpAPI.uploadMedia(this.currentFile, alt, title);
        if (result) {
            document.getElementById('upload-modal').style.display = 'none';
            this.loadLibrary();
            if (this.pendingFiles.length > 0) this.showNextFile();
        }
    },

    closeModal() {
        document.getElementById('upload-modal').style.display = 'none';
        this.currentFile = null;
    }
};

window.mediaLibrary = mediaLibrary;
document.addEventListener('DOMContentLoaded', () => mediaLibrary.init());
