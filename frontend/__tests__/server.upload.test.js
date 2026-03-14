const request = require('supertest');
const axios = require('axios');
const app = require('../server'); // Import the Express app

// Mock axios so we don't actually hit the WP API
jest.mock('axios');

describe('POST /api/wp-upload-media', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return 500 if no file is uploaded', async () => {
        const response = await request(app)
            .post('/api/wp-upload-media')
            // Don't attach any file here
            .field('title', 'Test title');

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toBe('Nenhum arquivo enviado');
    });

    it('should handle proxy upload failure and return 500', async () => {
        // Mock axios to reject
        axios.post.mockRejectedValueOnce(new Error('Proxy error'));

        const response = await request(app)
            .post('/api/wp-upload-media')
            .field('title', 'Test title')
            .attach('file', Buffer.from('dummy content'), 'test.txt');

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toBe('Proxy error');
        expect(axios.post).toHaveBeenCalledTimes(1);
    });

    it('should successfully upload file if proxy succeeds', async () => {
        // Mock axios to resolve successfully
        axios.post.mockResolvedValueOnce({ data: { id: 123, source_url: 'http://example.com/test.txt' } });

        const response = await request(app)
            .post('/api/wp-upload-media')
            .field('title', 'Test title')
            .attach('file', Buffer.from('dummy content'), 'test.txt');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('id', 123);
        expect(response.body).toHaveProperty('source_url', 'http://example.com/test.txt');
        expect(axios.post).toHaveBeenCalledTimes(1);
    });
});
