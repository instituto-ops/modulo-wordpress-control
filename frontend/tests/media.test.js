const fs = require('fs');
const path = require('path');

// Mock wpAPI and gemini BEFORE importing mediaLibrary
global.wpAPI = {
    fetchMedia: jest.fn().mockResolvedValue([]),
    fetchContent: jest.fn().mockResolvedValue([]),
    updateMediaSEO: jest.fn().mockResolvedValue(true),
    updateMedia: jest.fn().mockResolvedValue(true),
    deleteMedia: jest.fn().mockResolvedValue(true),
    uploadMedia: jest.fn().mockResolvedValue(true),
};
global.gemini = {
    callAPI: jest.fn().mockResolvedValue('{"title": "Test Title", "alt_text": "Test Alt"}')
};

const mediaLibrary = require('../public/js/media.js');

describe('Media Library Initialization', () => {
    beforeEach(() => {
        // Reset the DOM
        document.body.innerHTML = `
            <div id="drop-zone"></div>
            <input type="file" id="media-upload-input" />
            <div id="media-list-container"></div>
            <div id="media-editor-panel" style="display: none;"></div>
            <div id="editor-empty-state"></div>
            <div id="editor-active-state" style="display: none;">
                <button class="btn-primary">Save</button>
            </div>
            <img id="edit-panel-preview" />
            <input id="edit-panel-title" />
            <input id="edit-panel-alt" />
            <div id="edit-panel-usage"></div>
            <div id="upload-modal" style="display: none;"></div>
            <img id="modal-img-preview" />
            <input id="upload-title" />
            <input id="upload-alt" />
            <button id="btn-analyze-media-demand">Analizar</button>
            <div id="media-planning-result"></div>
        `;

        // Reset all mocks
        jest.clearAllMocks();

        // Reset mediaLibrary state
        mediaLibrary.pendingFiles = [];
        mediaLibrary.currentFile = null;
        mediaLibrary.usageCache = {};
        mediaLibrary.selectedMedia = null;
    });

    describe('init() and bindEvents()', () => {
        test('init calls bindEvents and loadLibrary', () => {
            const bindEventsSpy = jest.spyOn(mediaLibrary, 'bindEvents');
            const loadLibrarySpy = jest.spyOn(mediaLibrary, 'loadLibrary').mockImplementation(() => Promise.resolve());

            mediaLibrary.init();

            expect(bindEventsSpy).toHaveBeenCalled();
            expect(loadLibrarySpy).toHaveBeenCalled();

            bindEventsSpy.mockRestore();
            loadLibrarySpy.mockRestore();
        });

        test('bindEvents attaches click event to drop-zone', () => {
            mediaLibrary.bindEvents();

            const dropZone = document.getElementById('drop-zone');
            const fileInput = document.getElementById('media-upload-input');

            const fileInputClickSpy = jest.spyOn(fileInput, 'click');

            // Simulate click on drop-zone itself
            const event = new MouseEvent('click', { bubbles: true });
            Object.defineProperty(event, 'target', { value: dropZone });
            dropZone.dispatchEvent(event);

            expect(fileInputClickSpy).toHaveBeenCalled();

            fileInputClickSpy.mockRestore();
        });

        test('bindEvents handles drag events on drop-zone', () => {
            mediaLibrary.bindEvents();

            const dropZone = document.getElementById('drop-zone');

            // dragover
            const dragOverEvent = new Event('dragover');
            dragOverEvent.preventDefault = jest.fn();
            dropZone.dispatchEvent(dragOverEvent);
            expect(dragOverEvent.preventDefault).toHaveBeenCalled();
            expect(dropZone.style.borderColor).toBe('var(--color-secondary)');

            // dragleave
            const dragLeaveEvent = new Event('dragleave');
            dropZone.dispatchEvent(dragLeaveEvent);
            expect(dropZone.style.borderColor).toBe('var(--color-border)');

            // drop
            const dropEvent = new Event('drop');
            dropEvent.preventDefault = jest.fn();
            dropEvent.dataTransfer = { files: [{ name: 'test.jpg' }] };

            const handleFilesSpy = jest.spyOn(mediaLibrary, 'handleFiles').mockImplementation(() => {});

            dropZone.dispatchEvent(dropEvent);

            expect(dropEvent.preventDefault).toHaveBeenCalled();
            expect(dropZone.style.borderColor).toBe('var(--color-border)');
            expect(handleFilesSpy).toHaveBeenCalledWith(dropEvent.dataTransfer.files);

            handleFilesSpy.mockRestore();
        });

        test('bindEvents attaches change event to file input', () => {
            mediaLibrary.bindEvents();

            const fileInput = document.getElementById('media-upload-input');

            const changeEvent = new Event('change');
            Object.defineProperty(changeEvent, 'target', { value: { files: [{ name: 'test.png' }] } });

            const handleFilesSpy = jest.spyOn(mediaLibrary, 'handleFiles').mockImplementation(() => {});

            fileInput.dispatchEvent(changeEvent);

            expect(handleFilesSpy).toHaveBeenCalledWith(changeEvent.target.files);

            handleFilesSpy.mockRestore();
        });

        test('bindEvents does not throw if elements are missing', () => {
            document.body.innerHTML = ''; // Clear elements

            expect(() => mediaLibrary.bindEvents()).not.toThrow();
        });
    });

    describe('loadLibrary()', () => {
        test('loadLibrary does nothing if container is missing', async () => {
            document.body.innerHTML = '';
            await mediaLibrary.loadLibrary();
            expect(global.wpAPI.fetchMedia).not.toHaveBeenCalled();
        });

        test('loadLibrary displays syncing message when container is empty', async () => {
            const container = document.getElementById('media-list-container');
            const fetchMediaPromise = new Promise(resolve => setTimeout(() => resolve([]), 50));
            global.wpAPI.fetchMedia.mockReturnValue(fetchMediaPromise);

            const loadPromise = mediaLibrary.loadLibrary();
            expect(container.innerHTML).toContain('Sincronizando...');

            await loadPromise;
        });

        test('loadLibrary handles WP fetch errors gracefully', async () => {
            global.wpAPI.fetchMedia.mockRejectedValue(new Error('Network error'));
            const renderLocalIconsSpy = jest.spyOn(mediaLibrary, 'renderLocalIcons');

            // Should suppress error and render local icons
            await expect(mediaLibrary.loadLibrary()).resolves.not.toThrow();
            expect(renderLocalIconsSpy).toHaveBeenCalled();

            renderLocalIconsSpy.mockRestore();
        });

        test('loadLibrary populates usage cache correctly', async () => {
            const media = [{ id: 1, source_url: '/img/1.jpg', title: { rendered: 'Img 1' }, alt_text: 'Alt' }];
            const pages = [{ id: 10, title: { rendered: 'Page 1' }, content: { rendered: '<img src="/img/1.jpg">' }, featured_media: 0 }];
            const posts = [{ id: 20, title: { rendered: 'Post 1' }, content: { rendered: 'text' }, featured_media: 1 }];

            global.wpAPI.fetchMedia.mockResolvedValue(media);
            global.wpAPI.fetchContent.mockImplementation((type) => {
                if (type === 'pages') return Promise.resolve(pages);
                if (type === 'posts') return Promise.resolve(posts);
                return Promise.resolve([]);
            });

            await mediaLibrary.loadLibrary();

            expect(mediaLibrary.usageCache['/img/1.jpg']).toEqual(['Page 1', 'Post 1']);
        });

        test('loadLibrary renders media cards with correct styling', async () => {
            const media = [
                { id: 1, source_url: '/img/1.jpg', title: { rendered: 'Good Title' }, alt_text: 'Good Alt Text' },
                { id: 2, source_url: '/img/2.jpg', title: { rendered: '2.jpg' }, alt_text: '' }, // Needs SEO
                { id: 3, source_url: '/img/3.jpg', title: { rendered: 'Psicólogo' }, alt_text: 'Psicólogo' }, // Match keywords
            ];
            global.wpAPI.fetchMedia.mockResolvedValue(media);
            global.wpAPI.fetchContent.mockResolvedValue([]);

            await mediaLibrary.loadLibrary();

            const container = document.getElementById('media-list-container');

            // Check cards (plus 15 local icons)
            expect(container.children.length).toBeGreaterThan(media.length);

            // Check specific cards
            const card1 = document.getElementById('media-card-1');
            const card2 = document.getElementById('media-card-2');
            const card3 = document.getElementById('media-card-3');

            expect(card1).toBeTruthy();
            expect(card1.style.borderColor).toBe('rgb(203, 213, 225)'); // #cbd5e1 (hasAlt && !needsSEO)
            expect(card1.innerHTML).toContain('⚠️');

            expect(card2).toBeTruthy();
            expect(card2.style.borderColor).toBe('rgb(244, 63, 94)'); // #f43f5e (needsSEO)
            expect(card2.innerHTML).toContain('Corrigir SEO (IA)');

            expect(card3).toBeTruthy();
            expect(card3.style.borderColor).toBe('rgb(34, 197, 94)'); // #22c55e (altMatch)
            expect(card3.innerHTML).toContain('✅');
        });
    });

    describe('fixSEO()', () => {
        test('fixSEO updates button state and calls API', async () => {
            const btn = document.createElement('button');
            btn.id = 'btn-fix-1';
            document.body.appendChild(btn);

            const loadLibrarySpy = jest.spyOn(mediaLibrary, 'loadLibrary').mockImplementation(() => Promise.resolve());

            await mediaLibrary.fixSEO(1, 'http://example.com/img.jpg');

            expect(global.gemini.callAPI).toHaveBeenCalled();
            expect(global.wpAPI.updateMediaSEO).toHaveBeenCalledWith(1, 'Test Title', 'Test Alt');
            expect(btn.innerHTML).toBe('✅ Otimizado');
            expect(btn.style.background).toBe('rgb(16, 185, 129)'); // #10b981

            loadLibrarySpy.mockRestore();
        });

        test('fixSEO handles invalid JSON from AI', async () => {
            const btn = document.createElement('button');
            btn.id = 'btn-fix-1';
            document.body.appendChild(btn);

            global.gemini.callAPI.mockResolvedValueOnce('invalid json');
            const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

            await mediaLibrary.fixSEO(1, 'http://example.com/img.jpg');

            expect(btn.innerHTML).toBe('⚠️ Erro IA');
            expect(btn.style.background).toBe('rgb(239, 68, 68)'); // #ef4444
            expect(alertSpy).toHaveBeenCalled();

            alertSpy.mockRestore();
        });
    });
});
