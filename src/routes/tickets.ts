import { Router } from 'express';
import {
  getAllTickets,
  getTicketById,
  createTicket,
  updateTicketStatus,
} from '../dal/tickets.js';
import authMiddleware from '../middleware/auth.js';
const router = Router();

import { insertTimeLog, getTotalHoursForTicket } from '../dal/timeLogs.js';

// GET /tickets
router.get('/', async (req, res) => {
  const limit = req.query.limit ? Number(req.query.limit) : undefined;

  const offset = req.query.offset ? Number(req.query.offset) : undefined;

  const status = req.query.status ? String(req.query.status) : undefined;

  const tickets = await getAllTickets({
    limit,
    offset,
    status,
  });

  res.status(200).json(tickets);
});

// GET /tickets/:id
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const ticket = await getTicketById(id);

  if (!ticket) {
    res.status(404).json({ error: 'Ticket not found' });
    return;
  }

  res.status(200).json(ticket);
});

// POST /tickets
router.post('/', authMiddleware, async (req, res) => {
  const { title, description } = req.body;
  const creator_id = res.locals.userId;

  const ticket = await createTicket({
    title,
    description,
    creator_id,
  });

  res.status(201).json(ticket);
});

// PATCH /tickets/:id/status
router.patch('/:id/status', authMiddleware, async (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body;

  const ticket = await updateTicketStatus(id, status);

  if (!ticket) {
    res.status(404).json({ error: 'Ticket not found' });
    return;
  }

  res.status(200).json(ticket);
});
// POST /tickets/:id/time
router.post('/:id/time', authMiddleware, async (req, res) => {
  const ticketId = Number(req.params.id);
  const userId = res.locals.userId;
  const { hours } = req.body;

  const timeLog = await insertTimeLog(ticketId, userId, hours);

  res.status(201).json(timeLog);
});

// GET /tickets/:id/time
router.get('/:id/time', async (req, res) => {
  const ticketId = Number(req.params.id);

  const totalHours = await getTotalHoursForTicket(ticketId);

  res.status(200).json({
    ticket_id: ticketId,
    total_hours: totalHours,
  });
});
export default router;
