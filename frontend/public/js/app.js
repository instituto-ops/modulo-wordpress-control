/**
 * FASE 5: The Cockpit (Frontend & UX)
 * Aplicação Base (Módulo de navegação e estado)
 */

const app = {
    views: ['dashboard', 'studio', 'settings', 'seo', 'growth'],

    navigate: function(viewId) {
        document.dispatchEvent(new CustomEvent('viewChanged', { detail: viewId }));

        if (!this.views.includes(viewId)) return;

        // Ocultar todas
        this.views.forEach(v => {
            const el = document.getElementById(`view-${v}`);
            if (el) el.classList.add('hidden');
        });

        // Mostrar a view solicitada
        const targetView = document.getElementById(`view-${viewId}`);
        if (targetView) {
            targetView.classList.remove('hidden');
            targetView.classList.add('active', 'reveal-animation');

            // Re-trigger animação
            targetView.style.animation = 'none';
            targetView.offsetHeight; /* trigger reflow */
            targetView.style.animation = null;
        }

        // Atualizar título
        const titleEl = document.getElementById('page-title');
        const titles = {
            'dashboard': 'Mission Control',
            'studio': 'Estúdio de Criação E-E-A-T',
            'settings': 'Identidade Clínica (Reverse Prompting)',
            'seo': 'Análise de Silos e Autoridade',
            'growth': 'Growth OS (Marketing & Ads)'
        };
        titleEl.textContent = titles[viewId] || 'NeuroEngine';

        // Atualizar menu ativo
        document.querySelectorAll('.nav-item').forEach(el => {
            el.classList.remove('active');
            // Busca o onclick que contenha a string do view
            if (el.getAttribute('onclick') && el.getAttribute('onclick').includes(viewId)) {
                el.classList.add('active');
            }
        });
    },

    init: function() {
        this.navigate('dashboard');
        console.log("NeuroEngine Base App Initialized.");
    }
};

document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
