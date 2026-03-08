import request from 'supertest';
import { app } from '../../src/app.js';

describe('Swagger/OpenAPI docs', () => {
  test('GET /swagger.json returns valid OpenAPI document shape', async () => {
    const response = await request(app).get('/swagger.json');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('openapi', '3.0.3');
    expect(response.body).toHaveProperty('info.title');
    expect(response.body).toHaveProperty('components.schemas');
    expect(response.body).toHaveProperty('paths./api/v1/movies');
    expect(response.body).toHaveProperty('paths./api/v1/download/resolve');
  });

  test('GET /docs serves swagger UI html', async () => {
    const response = await request(app).get('/docs/');
    expect(response.status).toBe(200);
    expect(response.text).toContain('swagger-ui');
  });
});
