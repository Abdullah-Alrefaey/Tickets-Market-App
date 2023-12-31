import { Listener, Subjects } from '@af-tickets/common';
import { OrderCreatedEvent } from '@af-tickets/common';
import { queueGroupName } from './queue-group-name';
import { Message } from 'node-nats-streaming';
import { expirationQueue } from '../../queues/expiration-queue';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
        const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
        console.log(
            'Waiting this many milliseconds to process this job: ',
            delay
        );

        await expirationQueue.add(
            {
                orderId: data.id,
            },
            {
                delay,
            }
        );

        // Ack the message
        msg.ack();
    }
}
