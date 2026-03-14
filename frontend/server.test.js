const request = require('supertest');
const express = require('express');

// Mock @google/generative-ai
jest.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => {
      return {
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: jest.fn().mockRejectedValue(new Error('Mocked API error'))
        })
      };
    })
  };
});

// Import the app after mocking
const app = require('./server');

describe('POST /api/chat', () => {
  it('should handle errors gracefully during image processing and return 500', async () => {
    // We send a valid request with an image, but the mocked AI will throw an error
    const res = await request(app)
      .post('/api/chat')
      .set('Authorization', 'Basic ' + Buffer.from(process.env.DASHBOARD_USER + ':' + process.env.DASHBOARD_PASSWORD).toString('base64'))
      .field('message', 'Test message')
      .attach('screenshot', Buffer.from('fake image content'), 'test.png');

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toBe('Mocked API error');
  });
});
