/**
 * @jest-environment jsdom
 */

const wpAPI = require('../public/js/api.js');

describe('wpAPI.updateMediaSEO', () => {
    let originalRequest;
    let originalAlert;

    beforeEach(() => {
        // Mock global alert
        originalAlert = global.alert;
        global.alert = jest.fn();

        // Spy on wpAPI.request and mock its implementation
        originalRequest = wpAPI.request;
        wpAPI.request = jest.fn();
    });

    afterEach(() => {
        // Restore mocks
        global.alert = originalAlert;
        wpAPI.request = originalRequest;
        jest.clearAllMocks();
    });

    test('should successfully update media SEO and return the response', async () => {
        const mockId = 123;
        const mockTitle = 'New Title';
        const mockAltText = 'New Alt Text';
        const mockResponse = { id: mockId, title: { raw: mockTitle }, alt_text: mockAltText };

        // Mock successful request
        wpAPI.request.mockResolvedValueOnce(mockResponse);

        const result = await wpAPI.updateMediaSEO(mockId, mockTitle, mockAltText);

        // Verify request was called with correct arguments
        expect(wpAPI.request).toHaveBeenCalledTimes(1);
        expect(wpAPI.request).toHaveBeenCalledWith(`/wp/media/${mockId}`, {
            method: "POST",
            body: JSON.stringify({ title: mockTitle, alt_text: mockAltText })
        });

        // Verify result
        expect(result).toEqual(mockResponse);
        expect(global.alert).not.toHaveBeenCalled();
    });

    test('should handle request failure, show alert, and return null', async () => {
        const mockId = 456;
        const mockTitle = 'Failed Title';
        const mockAltText = 'Failed Alt Text';
        const errorMessage = 'Network error';

        // Mock failed request
        wpAPI.request.mockRejectedValueOnce(new Error(errorMessage));

        const result = await wpAPI.updateMediaSEO(mockId, mockTitle, mockAltText);

        // Verify request was called with correct arguments
        expect(wpAPI.request).toHaveBeenCalledTimes(1);
        expect(wpAPI.request).toHaveBeenCalledWith(`/wp/media/${mockId}`, {
            method: "POST",
            body: JSON.stringify({ title: mockTitle, alt_text: mockAltText })
        });

        // Verify result
        expect(result).toBeNull();

        // Verify alert was called
        expect(global.alert).toHaveBeenCalledTimes(1);
        expect(global.alert).toHaveBeenCalledWith("Erro na Otimização SEO: " + errorMessage);
    });
});
