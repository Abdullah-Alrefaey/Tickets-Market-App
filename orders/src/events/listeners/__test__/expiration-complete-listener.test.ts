import { ExpirationCompleteListener } from '../expiration-complete-listener';
import { ExpirationCompleteEvent, OrderStatus } from '@af-tickets/common';
import { natsWrapper } from '../../../nats-wrapper';
import mongoose from 'mongoose';
import { Ticket } from '../../../models/ticket';
import { Order } from '../../../models/order';
import { Message } from 'node-nats-streaming';

const setup = async () => {
    // Create an instance of a listener
    const listener = new ExpirationCompleteListener(natsWrapper.client);

    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20,
    });
    await ticket.save();

    const order = Order.build({
        userId: 'dfjweriu',
        status: OrderStatus.Created,
        expiresAt: new Date(),
        ticket,
    });
    await order.save();

    // Create a fake data event
    const data: ExpirationCompleteEvent['data'] = {
        orderId: order.id,
    };

    // Create a fake Message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    };

    return { listener, ticket, order, data, msg };
};

it('Updates the order status to cancelled', async () => {
    const { listener, order, data, msg } = await setup();

    // Call the onMessage function with the data object + message object
    await listener.onMessage(data, msg);

    const updatedOrder = await Order.findById(order.id);

    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('Emits an OrderCancelled event', async () => {
    const { listener, order, data, msg } = await setup();

    await listener.onMessage(data, msg);

    // Write assertions to make sure ack function is called
    expect(natsWrapper.client.publish).toHaveBeenCalled();

    const eventData = JSON.parse(
        (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
    );
    expect(eventData.id).toEqual(order.id);
});

it('Acks the message', async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});
