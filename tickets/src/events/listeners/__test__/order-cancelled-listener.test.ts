import { OrderCancelledEvent, OrderStatus } from '@af-tickets/common';
import { OrderCancelledListener } from '../order-cancelled-listener';
import { natsWrapper } from '../../../nats-wrapper';
import mongoose from 'mongoose';
import { Ticket } from '../../../models/ticket';
import { Message } from 'node-nats-streaming';

const setup = async () => {
    // Create an instance of a listener
    const listener = new OrderCancelledListener(natsWrapper.client);

    const orderId = new mongoose.Types.ObjectId().toHexString();
    // Create and save a ticket
    const ticket = await Ticket.build({
        title: 'concert',
        price: 20,
        userId: new mongoose.Types.ObjectId().toHexString(),
    });
    ticket.set({ orderId });
    await ticket.save();

    // Create a fake data event
    const data: OrderCancelledEvent['data'] = {
        id: orderId,
        version: 0,
        ticket: {
            id: ticket.id,
        },
    };

    // Create a fake Message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    };

    return { listener, data, msg, ticket, orderId };
};

it('Updates the ticket, publishes an event, and acks the message', async () => {
    const { listener, data, msg, ticket, orderId } = await setup();

    // Call the onMessage function with the data object + message object
    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.orderId).not.toBeDefined();
    expect(msg.ack).toHaveBeenCalled();
    expect(natsWrapper.client.publish).toHaveBeenCalled();
});
