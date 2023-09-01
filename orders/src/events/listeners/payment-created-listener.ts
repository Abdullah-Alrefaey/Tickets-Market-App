import { Message } from 'node-nats-streaming';
import {
    Subjects,
    Listener,
    PaymentCreatedEvent,
    OrderStatus,
} from '@af-tickets/common';
import { Order } from '../../models/order';
import { queueGroupName } from './queue-group-name';

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
    readonly subject = Subjects.PaymentCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
        const { id, orderId, stripeId } = data;

        const order = await Order.findById(orderId);

        if (!order) {
            throw new Error('Order not found!!');
        }

        order.set({ status: OrderStatus.Completed });
        await order.save();

        // We Could add order:updated event here
        // And tell every other service about it to increament version number
        // but we won't update the order anymore after being completed

        msg.ack();
    }
}
