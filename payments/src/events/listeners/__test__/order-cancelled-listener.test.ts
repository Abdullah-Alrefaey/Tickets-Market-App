import { OrderCancelledEvent, OrderStatus } from '@af-tickets/common';
import { OrderCancelledListener } from '../order-cancelled-listener';
import { natsWrapper } from '../../../nats-wrapper';
import mongoose from 'mongoose';
import { Order } from '../../../models/order';
import { Message } from 'node-nats-streaming';

const setup = async () => {
    // Create an instance of a listener
    const listener = new OrderCancelledListener(natsWrapper.client);

    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId: new mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        version: 0,
        price: 10,
    });
    await order.save();

    // Create a fake data event
    const data: OrderCancelledEvent['data'] = {
        id: order.id,
        version: 1,
        ticket: {
            id: 'dgdhgfkdjg',
        },
    };

    // Create a fake Message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    };

    return { listener, order, data, msg };
};

it('Updates the status of the order', async () => {
    const { listener, order, data, msg } = await setup();

    await listener.onMessage(data, msg);

    const updatedOrder = await Order.findById(order.id);

    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('Acks the message', async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});
