const request = require('supertest');
const app = require('../server');

// Mock external services to make tests deterministic
jest.mock('axios');
const axios = require('axios');

jest.mock('@google/generative-ai', () => {
    return {
        GoogleGenerativeAI: jest.fn().mockImplementation(() => {
            return {
                getGenerativeModel: jest.fn().mockReturnValue({
                    generateContent: jest.fn().mockResolvedValue({
                        response: {
                            text: jest.fn().mockReturnValue('Mocked AI response text')
                        }
                    })
                })
            };
        })
    };
});

describe('Express Backend Endpoints', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('GET /api/wp/:type should fetch data from WordPress', async () => {
        const mockData = [{ id: 1, title: { rendered: 'Test Post' } }];
        axios.mockResolvedValueOnce({ data: mockData });

        const response = await request(app).get('/api/wp/posts');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockData);
        expect(axios).toHaveBeenCalledTimes(1);
        expect(axios).toHaveBeenCalledWith(expect.objectContaining({
            method: 'GET',
            url: expect.stringContaining('/wp-json/wp/v2/posts')
        }));
    });

    test('POST /api/wp/:type should post data to WordPress', async () => {
        const mockData = { id: 1, title: { rendered: 'New Post' } };
        axios.mockResolvedValueOnce({ data: mockData });

        const response = await request(app)
            .post('/api/wp/posts')
            .send({ title: 'New Post' });

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockData);
        expect(axios).toHaveBeenCalledTimes(1);
        expect(axios).toHaveBeenCalledWith(expect.objectContaining({
            method: 'POST',
            url: expect.stringContaining('/wp-json/wp/v2/posts')
        }));
    });

    test('GET /api-content/:type/:id should fetch content with anti-WAF strategy', async () => {
        // Meta call
        axios.mockResolvedValueOnce({
            data: { id: 1, title: { rendered: 'Anti-WAF Post' } }
        });
        // Content call
        axios.mockResolvedValueOnce({
            data: { content: { rendered: '<p>Content</p>', raw: 'Content' } }
        });

        const response = await request(app).get('/api-content/posts/1');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('content');
        expect(response.body.content.rendered).toBe('<p>Content</p>');
        expect(axios).toHaveBeenCalledTimes(2);
    });

    test('POST /api/ai/generate should return AI text', async () => {
        const response = await request(app)
            .post('/api/ai/generate')
            .send({ prompt: 'Test prompt' });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ text: 'Mocked AI response text' });
    });
});
