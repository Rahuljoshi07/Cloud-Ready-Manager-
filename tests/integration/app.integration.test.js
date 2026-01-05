const request = require('supertest');
const app = require('../../src/app');

describe('Integration Tests', () => {
  describe('Application Flow', () => {
    it('should handle complete workflow', async () => {
      // 1. Check health
      const healthResponse = await request(app)
        .get('/api/health')
        .expect(200);
      expect(healthResponse.body.status).toBe('healthy');

      // 2. Get application info
      const infoResponse = await request(app)
        .get('/api/info')
        .expect(200);
      expect(infoResponse.body).toHaveProperty('application');

      // 3. Check system status
      const statusResponse = await request(app)
        .get('/api/status')
        .expect(200);
      expect(statusResponse.body.status).toBe('operational');
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 errors gracefully', async () => {
      const response = await request(app)
        .get('/invalid/endpoint')
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('CORS and Security', () => {
    it('should include security headers', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.headers).toHaveProperty('x-content-type-options');
    });
  });
});
