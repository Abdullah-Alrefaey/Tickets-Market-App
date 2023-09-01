import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';

const buildTicket = async () => {
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20,
    });
    await ticket.save();

    return ticket;
};

it('Fetchs the order', async () => {
    // Create a ticket
    const ticket = await buildTicket();
    const userOne = global.signin();

    // Make a request to build an order with this ticket
    const { body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie', userOne)
        .send({ ticketId: ticket.id })
        .expect(201);

    // Make a request to fetch the order
    const { body: fetchedOrder } = await request(app)
        .get(`/api/orders/${order.id}`)
        .set('Cookie', userOne)
        .send()
        .expect(200);

    expect(fetchedOrder.id).toEqual(order.id);
});

it('Returns an error if one user tries to fetch another user`s order', async () => {
    // Create a ticket
    const ticket = await buildTicket();
    const userOne = global.signin();

    // Make a request to build an order with this ticket
    const { body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie', userOne)
        .send({ ticketId: ticket.id })
        .expect(201);

    // Make a request to fetch the order
    await request(app)
        .get(`/api/orders/${order.id}`)
        .set('Cookie', global.signin())
        .send()
        .expect(401);
});
