const request = require('supertest');
const app = require('../../src/app');

describe('API Endpoints', () => {
  describe('GET /', () => {
    it('should return welcome message', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Welcome');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('status', 'active');
    });
  });

  describe('GET /api/info', () => {
    it('should return application info', async () => {
      const response = await request(app)
        .get('/api/info')
        .expect(200);

      expect(response.body).toHaveProperty('application');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('technologies');
      expect(Array.isArray(response.body.technologies)).toBe(true);
    });
  });

  describe('GET /api/status', () => {
    it('should return system status', async () => {
      const response = await request(app)
        .get('/api/status')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'operational');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('memory');
      expect(response.body).toHaveProperty('nodeVersion');
    });
  });

  describe('GET /api/data', () => {
    it('should return sample data', async () => {
      const response = await request(app)
        .get('/api/data')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /nonexistent', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/nonexistent')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Not Found');
    });
  });
});
