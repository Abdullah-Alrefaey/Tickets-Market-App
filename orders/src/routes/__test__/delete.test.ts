import request from 'supertest';
import mongoose, { mongo } from 'mongoose';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { Order, OrderStatus } from '../../models/order';
import { natsWrapper } from '../../nats-wrapper';

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

    // Make a request to cancel the order
    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set('Cookie', userOne)
        .send()
        .expect(204);

    // Expectation to make sure the order is cancelled
    const updatedOrder = await Order.findById(order.id);
    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('Emits an order:cancelled event', async () => {
    // Create a ticket
    const ticket = await buildTicket();
    const userOne = global.signin();

    // Make a request to build an order with this ticket
    const { body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie', userOne)
        .send({ ticketId: ticket.id })
        .expect(201);

    // Make a request to cancel the order
    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set('Cookie', userOne)
        .send()
        .expect(204);

    // Expectation to make sure the order is cancelled
    const updatedOrder = await Order.findById(order.id);
    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});
