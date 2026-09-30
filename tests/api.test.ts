import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/index.js';

describe('Part 1: API Integration Tests', () => {
  it('creates a user successfully', async () => {
    const response = await request(app)
      .post('/users')
      .set('X-User-Id', '1')
      .send({
        name: 'Test User',
        email: `user-${Date.now()}@test.com`,
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe('Test User');
  });

  it('rejects ticket creation without X-User-Id', async () => {
    const response = await request(app).post('/tickets').send({
      title: 'Unauthorized Ticket',
      description: 'This request should fail',
    });

    expect(response.status).toBe(401);
  });

  it('returns 404 for a non-existent user', async () => {
    const response = await request(app).get('/users/999999');

    expect(response.status).toBe(404);
  });

  it('returns 404 for a non-existent ticket', async () => {
    const response = await request(app).get('/tickets/999999');

    expect(response.status).toBe(404);
  });

  it('creates a ticket successfully', async () => {
    const userResponse = await request(app)
      .post('/users')
      .set('X-User-Id', '1')
      .send({
        name: 'Ticket Creator',
        email: `creator-${Date.now()}@test.com`,
      });

    expect(userResponse.status).toBe(201);

    const userId = userResponse.body.id;

    const response = await request(app)
      .post('/tickets')
      .set('X-User-Id', String(userId))
      .send({
        title: 'Integration Test Ticket',
        description: 'Created by the API integration test',
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.title).toBe('Integration Test Ticket');
  });

  it('supports pagination on GET /tickets', async () => {
    const response = await request(app).get('/tickets?limit=1&offset=0');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeLessThanOrEqual(1);
  });
});
