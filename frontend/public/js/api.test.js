const wpAPI = require('./api');

// Store original console.error to avoid spamming test output
const originalConsoleError = console.error;

describe('wpAPI.request proxy fetching', () => {
    beforeEach(() => {
        global.fetch = jest.fn();
        // Mock console.error to prevent expected errors from cluttering the test output
        console.error = jest.fn();
    });

    afterEach(() => {
        jest.resetAllMocks();
        console.error = originalConsoleError;
    });

    test('should return JSON on a successful request', async () => {
        const mockResponse = { data: 'success' };
        global.fetch.mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue(mockResponse)
        });

        const result = await wpAPI.request('/test-endpoint');

        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenCalledWith('/api/test-endpoint', expect.objectContaining({
            headers: { "Content-Type": "application/json" }
        }));
        expect(result).toEqual(mockResponse);
    });

    test('should throw an error with message from errorData.message when response is not ok', async () => {
        global.fetch.mockResolvedValue({
            ok: false,
            status: 400,
            json: jest.fn().mockResolvedValue({ message: 'Validation failed' })
        });

        await expect(wpAPI.request('/bad-endpoint')).rejects.toThrow('Validation failed');
        expect(console.error).toHaveBeenCalledWith('Proxy Request Error (/bad-endpoint):', expect.any(Error));
    });

    test('should throw an error with message from errorData.error when response is not ok and message is missing', async () => {
        global.fetch.mockResolvedValue({
            ok: false,
            status: 401,
            json: jest.fn().mockResolvedValue({ error: 'Unauthorized access' })
        });

        await expect(wpAPI.request('/auth-endpoint')).rejects.toThrow('Unauthorized access');
        expect(console.error).toHaveBeenCalledWith('Proxy Request Error (/auth-endpoint):', expect.any(Error));
    });

    test('should fallback to HTTP status when error body is empty or fails to parse', async () => {
        global.fetch.mockResolvedValue({
            ok: false,
            status: 500,
            json: jest.fn().mockRejectedValue(new Error('Invalid JSON'))
        });

        await expect(wpAPI.request('/crash-endpoint')).rejects.toThrow('HTTP 500');
        expect(console.error).toHaveBeenCalledWith('Proxy Request Error (/crash-endpoint):', expect.any(Error));
    });

    test('should throw an error if fetch fails (e.g. network error)', async () => {
        const networkError = new Error('Network Error');
        global.fetch.mockRejectedValue(networkError);

        await expect(wpAPI.request('/network-endpoint')).rejects.toThrow('Network Error');
        expect(console.error).toHaveBeenCalledWith('Proxy Request Error (/network-endpoint):', networkError);
    });
});
