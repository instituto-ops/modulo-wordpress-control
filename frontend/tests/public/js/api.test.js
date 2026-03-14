/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

describe('wpAPI', () => {
    let wpAPI;

    beforeAll(() => {
        // Evaluate the code in the global scope so wpAPI is defined
        const code = fs.readFileSync(path.resolve(__dirname, '../../../public/js/api.js'), 'utf8');
        // Evaluate the code to create the wpAPI object
        // Since it's 'const wpAPI = { ... }', we can execute it and return it via an IIFE
        wpAPI = eval(`(() => { ${code}; return wpAPI; })()`);
    });

    beforeEach(() => {
        // Clear all mock implementations before each test
        global.fetch = jest.fn();

        // Mock console.error to keep test output clean
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('fetchSettings', () => {
        it('should make a GET request to /wp-settings via request() and return the result', async () => {
            // Setup a successful mock response
            const mockSettings = { title: 'My Site', description: 'Just another site' };

            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockSettings
            });

            // Call the method
            const result = await wpAPI.fetchSettings();

            // Verify fetch was called with the correct URL
            expect(global.fetch).toHaveBeenCalledWith('/api/wp-settings', expect.objectContaining({
                headers: {
                    'Content-Type': 'application/json'
                }
            }));

            // Verify the result is returned correctly
            expect(result).toEqual(mockSettings);
        });

        it('should return null and log error when request fails with 500 status', async () => {
            // Setup a failed mock response
            global.fetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
                json: async () => ({ message: 'Server Error' })
            });

            // Call the method
            const result = await wpAPI.fetchSettings();

            // Verify fetch was called
            expect(global.fetch).toHaveBeenCalledWith('/api/wp-settings', expect.any(Object));

            // Verify the error was caught and console.error was called
            expect(console.error).toHaveBeenCalled();

            // Verify result is null as per the try-catch block
            expect(result).toBeNull();
        });

        it('should handle network errors gracefully by returning null', async () => {
            // Setup a network error
            global.fetch.mockRejectedValueOnce(new Error('Network disconnected'));

            // Call the method
            const result = await wpAPI.fetchSettings();

            // Verify error was logged and null was returned
            expect(console.error).toHaveBeenCalledWith(expect.any(Error));
            expect(result).toBeNull();
        });

        it('should correctly format proxy error messages on failure', async () => {
            const errorMessage = "Custom error message";
            global.fetch.mockResolvedValueOnce({
                ok: false,
                status: 400,
                json: async () => ({ error: errorMessage })
            });

            const result = await wpAPI.fetchSettings();

            // request() method prefixes errors and throws, fetchSettings catches and logs
            expect(console.error).toHaveBeenCalledWith(expect.objectContaining({
                message: errorMessage
            }));
            expect(result).toBeNull();
        });
    });
});
