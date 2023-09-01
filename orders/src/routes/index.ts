import express, { Request, Response } from 'express';
import { requireAuth } from '@af-tickets/common';
import { Order } from '../models/order';

const router = express.Router();

router.get('/api/orders', requireAuth, async (req: Request, res: Response) => {
    // const tickets = await Ticket.find({});
    const orders = await Order.find({
        userId: req.currentUser!.id,
    }).populate('ticket');

    res.send(orders);
});

export { router as indexOrderRouter };
