import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/index.js';

describe('Part 2: Time Logs Tests', () => {
  it('should correctly total multiple time logs for a ticket', async () => {
    // Create a user
    const userResponse = await request(app)
      .post('/users')
      .set('X-User-Id', '1')
      .send({
        name: 'Time Log Tester',
        email: `timelog-${Date.now()}@test.com`,
      });

    expect(userResponse.status).toBe(201);

    const userId = userResponse.body.id;

    // Create a ticket
    const ticketResponse = await request(app)
      .post('/tickets')
      .set('X-User-Id', String(userId))
      .send({
        title: 'Time Log Test Ticket',
        description: 'Ticket used for testing time logs',
      });

    expect(ticketResponse.status).toBe(201);

    const ticketId = ticketResponse.body.id;

    // Log 3 hours
    const firstLog = await request(app)
      .post(`/tickets/${ticketId}/time`)
      .set('X-User-Id', String(userId))
      .send({ hours: 3 });

    expect(firstLog.status).toBe(201);

    // Log 5 more hours
    const secondLog = await request(app)
      .post(`/tickets/${ticketId}/time`)
      .set('X-User-Id', String(userId))
      .send({ hours: 5 });

    expect(secondLog.status).toBe(201);

    // Get total
    const totalResponse = await request(app).get(`/tickets/${ticketId}/time`);

    expect(totalResponse.status).toBe(200);
    expect(totalResponse.body.ticket_id).toBe(ticketId);
    expect(totalResponse.body.total_hours).toBe(8);
  });
});
