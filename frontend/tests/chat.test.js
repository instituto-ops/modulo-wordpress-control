const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

describe('chat.js - NeuroEngine Copilot Initialization', () => {
    let dom;
    let window;
    let document;
    let chatApp;

    beforeEach(() => {
        // Setup simple DOM structure required by chat.js
        dom = new JSDOM(`
            <!DOCTYPE html>
            <html>
            <body>
                <div id="live-preview"></div>
                <input id="chat-input" />
                <button id="btn-send-chat"></button>
                <button id="btn-snap-error"></button>
                <select id="ai-studio-keyword"></select>
                <div id="jackal-panel"></div>
                <div id="jackal-buttons" style="display: flex;"></div>
                <div id="blueprint-welcome"></div>
                <div id="block-inserter-menu"></div>
            </body>
            </html>
        `, { runScripts: "dangerously" });

        window = dom.window;
        document = window.document;
        global.document = document;
        global.window = window;
        global.navigator = { clipboard: { writeText: jest.fn() } };

        // Mock window properties
        window.console.log = jest.fn();
        window.alert = jest.fn();
        window.confirm = jest.fn(() => true);
        window.AbidosBlocks = {
            get: jest.fn(),
            getList: jest.fn(() => [])
        };
        window.wpAPI = {
            fetchMedia: jest.fn(),
            fetchContent: jest.fn()
        };

        // Load chat.js into the jsdom context
        const chatJsPath = path.resolve(__dirname, '../public/js/chat.js');
        const chatJsCode = fs.readFileSync(chatJsPath, 'utf8');

        // Evaluate the code within the window context
        const script = document.createElement('script');
        script.textContent = chatJsCode;
        document.body.appendChild(script);

        chatApp = window.chatApp;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should initialize correctly by calling setup methods and logging', () => {
        // Spy on internal setup methods
        const setupEventListenersSpy = jest.spyOn(chatApp, 'setupEventListeners');
        const setupInspectorSpy = jest.spyOn(chatApp, 'setupInspector');
        const setupKeyboardShortcutsSpy = jest.spyOn(chatApp, 'setupKeyboardShortcuts');

        // Execute init
        chatApp.init();

        // Verify sub-methods were called
        expect(setupEventListenersSpy).toHaveBeenCalled();
        expect(setupInspectorSpy).toHaveBeenCalled();
        expect(setupKeyboardShortcutsSpy).toHaveBeenCalled();

        // Verify console.log
        expect(window.console.log).toHaveBeenCalledWith("🧠 NeuroEngine Copilot Initialized");
    });

    it('should attach event listeners to chat controls', () => {
        // Need to test that setupEventListeners properly binds clicks and keypress
        chatApp.init();

        const btnSend = document.getElementById('btn-send-chat');
        const btnSnap = document.getElementById('btn-snap-error');
        const chatInput = document.getElementById('chat-input');

        // Mock sendMessage so we can track it
        const sendMessageSpy = jest.spyOn(chatApp, 'sendMessage').mockImplementation(() => {});

        // Test btnSend click
        btnSend.click();
        expect(sendMessageSpy).toHaveBeenCalledWith(false);
        sendMessageSpy.mockClear();

        // Test btnSnap click
        chatInput.value = "Test snap error";
        btnSnap.click();
        expect(sendMessageSpy).toHaveBeenCalledWith(true);
        sendMessageSpy.mockClear();

        // Test chatInput Enter keypress
        const enterEvent = new window.KeyboardEvent('keypress', { key: 'Enter', bubbles: true });
        chatInput.dispatchEvent(enterEvent);
        expect(sendMessageSpy).toHaveBeenCalledWith(false);
    });

    it('should attach keyboard shortcuts to document', () => {
        chatApp.init();

        // Spy on history actions
        const undoHistorySpy = jest.spyOn(chatApp, 'undoHistory').mockImplementation(() => {});
        const redoHistorySpy = jest.spyOn(chatApp, 'redoHistory').mockImplementation(() => {});
        const deleteSelectedSpy = jest.spyOn(chatApp, 'deleteSelected').mockImplementation(() => {});

        // Mock a selected element for delete test
        chatApp.selectedElement = document.createElement('div');

        // Ensure active element is not input/textarea
        document.body.focus();

        // Trigger Ctrl+Z
        const ctrlZEvent = new window.KeyboardEvent('keydown', { key: 'z', ctrlKey: true, bubbles: true });
        document.dispatchEvent(ctrlZEvent);
        expect(undoHistorySpy).toHaveBeenCalled();

        // Trigger Ctrl+Y
        const ctrlYEvent = new window.KeyboardEvent('keydown', { key: 'y', ctrlKey: true, bubbles: true });
        document.dispatchEvent(ctrlYEvent);
        expect(redoHistorySpy).toHaveBeenCalled();

        // Trigger Delete
        const deleteEvent = new window.KeyboardEvent('keydown', { key: 'Delete', bubbles: true });
        document.dispatchEvent(deleteEvent);
        expect(deleteSelectedSpy).toHaveBeenCalled();
    });

    it('should setup the DOM inspector correctly', () => {
        chatApp.init();

        const preview = document.getElementById('live-preview');

        // Create a valid tag to click
        const pElement = document.createElement('p');
        pElement.textContent = 'Test paragraph';
        preview.appendChild(pElement);

        const showMicroCommandsMenuSpy = jest.spyOn(chatApp, 'showMicroCommandsMenu').mockImplementation(() => {});

        // Click the element
        pElement.click();

        // Check if selectedElement was set and styling applied
        expect(chatApp.selectedElement).toBe(pElement);
        expect(pElement.classList.contains('element-selected')).toBe(true);
        expect(pElement.classList.contains('outline-blue')).toBe(true);
        expect(pElement.style.outline).toMatch(/2px dashed (#3b82f6|rgb\(59, 130, 246\))/i);

        expect(showMicroCommandsMenuSpy).toHaveBeenCalledWith(pElement, 0, 0);
    });
});
