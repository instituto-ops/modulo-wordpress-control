const request = require('supertest');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Mock @google/generative-ai to simulate success and failure
jest.mock('@google/generative-ai', () => {
  const mModel = {
    generateContent: jest.fn()
  };
  const mGoogleGenerativeAI = jest.fn(() => ({
    getGenerativeModel: jest.fn(() => mModel)
  }));
  return { GoogleGenerativeAI: mGoogleGenerativeAI };
});

const app = require('../server.js');

describe('AI Proxy Endpoints - POST /api/ai/generate', () => {
  let genAI;
  let model;

  beforeEach(() => {
    // Reset the mocks before each test
    jest.clearAllMocks();
    genAI = new GoogleGenerativeAI();
    model = genAI.getGenerativeModel();
  });

  it('should return 500 when generateContent throws an error', async () => {
    // Mock the error path
    model.generateContent.mockRejectedValue(new Error('Test API error'));

    const response = await request(app)
      .post('/api/ai/generate')
      .send({ prompt: 'test prompt' });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Test API error' });
  });

  it('should return 200 and generated text when generateContent is successful', async () => {
    // Mock the happy path
    model.generateContent.mockResolvedValue({
      response: {
        text: () => 'Mocked generated text'
      }
    });

    const response = await request(app)
      .post('/api/ai/generate')
      .send({ prompt: 'test prompt', config: { temperature: 0.5 } });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ text: 'Mocked generated text' });

    // Verify it passes the right params
    expect(model.generateContent).toHaveBeenCalledWith({
        contents: [{ role: 'user', parts: [{ text: 'test prompt' }] }],
        generationConfig: { temperature: 0.5 }
    });
  });
});
