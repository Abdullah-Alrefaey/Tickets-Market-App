import { OrderCreatedEvent, OrderStatus } from '@af-tickets/common';
import { OrderCreatedListener } from '../order-created-listener';
import { natsWrapper } from '../../../nats-wrapper';
import mongoose from 'mongoose';
import { Ticket } from '../../../models/ticket';
import { Message } from 'node-nats-streaming';

const setup = async () => {
    // Create an instance of a listener
    const listener = new OrderCreatedListener(natsWrapper.client);

    // Create and save a ticket
    const ticket = await Ticket.build({
        title: 'concert',
        price: 20,
        userId: new mongoose.Types.ObjectId().toHexString(),
    });
    await ticket.save();

    // Create a fake data event
    const data: OrderCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        status: OrderStatus.Created,
        userId: new mongoose.Types.ObjectId().toHexString(),
        expiresAt: 'dfgjhgu',
        ticket: {
            id: ticket.id,
            price: ticket.price,
        },
    };

    // Create a fake Message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    };

    return { listener, data, msg, ticket };
};

it('Sets the orderId of the ticket', async () => {
    const { listener, data, msg, ticket } = await setup();

    // Call the onMessage function with the data object + message object
    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.orderId).toEqual(data.id);
});

it('Acks the message', async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    // Write assertions to make sure ack function is called
    expect(msg.ack).toHaveBeenCalled();
});

it('Publishes a ticket updated event', async () => {
    const { listener, data, msg, ticket } = await setup();

    await listener.onMessage(data, msg);

    expect(natsWrapper.client.publish).toHaveBeenCalled();

    const ticketUpdatedData = JSON.parse(
        (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
    );

    expect(data.id).toEqual(ticketUpdatedData.orderId);
});
