import { Publisher, OrderCreatedEvent, Subjects } from '@af-tickets/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
}
