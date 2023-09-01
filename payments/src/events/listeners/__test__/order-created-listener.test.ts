import { OrderCreatedEvent, OrderStatus } from '@af-tickets/common';
import { OrderCreatedListener } from '../order-created-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Order } from '../../../models/order';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';

const setup = async () => {
    const listener = new OrderCreatedListener(natsWrapper.client);

    // Create a fake data event
    const data: OrderCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        status: OrderStatus.Created,
        userId: new mongoose.Types.ObjectId().toHexString(),
        expiresAt: 'dfgjhgu',
        ticket: {
            id: 'gfhlkfgjh',
            price: 10,
        },
    };

    // Create a fake Message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    };

    return { listener, data, msg };
};

it('Replicates the order info', async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    const order = await Order.findById(data.id);

    expect(order!.price).toEqual(data.ticket.price);
});

it('Acks the message', async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});
