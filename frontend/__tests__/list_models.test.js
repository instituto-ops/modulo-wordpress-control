const https = require('https');

describe('list_models.js', () => {
    let originalConsoleLog;
    let originalConsoleError;

    beforeEach(() => {
        jest.resetModules();
        originalConsoleLog = console.log;
        originalConsoleError = console.error;
        console.log = jest.fn();
        console.error = jest.fn();
        process.env.GEMINI_API_KEY = 'test_key';

        jest.mock('https', () => ({
            get: jest.fn()
        }));
    });

    afterEach(() => {
        console.log = originalConsoleLog;
        console.error = originalConsoleError;
        jest.unmock('https');
        delete process.env.GEMINI_API_KEY;
    });

    it('should successfully fetch and log available models', () => {
        const mockHttps = require('https');

        // Setup mock req and res
        const mockReqHandlers = {};
        const mockReq = {
            on: jest.fn((event, cb) => {
                mockReqHandlers[event] = cb;
                return mockReq; // allow chaining like .on('error')
            })
        };
        const mockResHandlers = {};
        const mockRes = {
            on: jest.fn((event, cb) => {
                mockResHandlers[event] = cb;
            })
        };

        mockHttps.get.mockImplementation((url, callback) => {
            expect(url).toBe('https://generativelanguage.googleapis.com/v1beta/models?key=test_key');
            callback(mockRes);
            return mockReq;
        });

        // Require script (executes immediately)
        require('../list_models.js');

        // Simulate data event
        expect(mockResHandlers.data).toBeDefined();
        mockResHandlers.data(JSON.stringify({
            models: [
                { name: 'models/gemini-1.5-flash' },
                { name: 'models/gemini-1.5-pro' }
            ]
        }));

        // Simulate end event
        expect(mockResHandlers.end).toBeDefined();
        mockResHandlers.end();

        expect(console.log).toHaveBeenCalledWith("AVAILABLE MODELS:", "gemini-1.5-flash, gemini-1.5-pro");
    });

    it('should handle JSON parse error on malformed response', () => {
        const mockHttps = require('https');

        const mockReqHandlers = {};
        const mockReq = {
            on: jest.fn((event, cb) => {
                mockReqHandlers[event] = cb;
                return mockReq;
            })
        };
        const mockResHandlers = {};
        const mockRes = {
            on: jest.fn((event, cb) => {
                mockResHandlers[event] = cb;
            })
        };

        mockHttps.get.mockImplementation((url, callback) => {
            callback(mockRes);
            return mockReq;
        });

        require('../list_models.js');

        // Provide invalid JSON to trigger catch block
        mockResHandlers.data('invalid json');
        mockResHandlers.end();

        // The script logs the raw data if JSON parsing fails
        expect(console.log).toHaveBeenCalledWith('invalid json');
    });

    it('should handle request error', () => {
        const mockHttps = require('https');

        const mockReqHandlers = {};
        const mockReq = {
            on: jest.fn((event, cb) => {
                mockReqHandlers[event] = cb;
                return mockReq;
            })
        };

        mockHttps.get.mockImplementation((url, callback) => {
            return mockReq;
        });

        require('../list_models.js');

        const testError = new Error('Network error');
        mockReqHandlers.error(testError);

        expect(console.error).toHaveBeenCalledWith(testError);
    });
});
