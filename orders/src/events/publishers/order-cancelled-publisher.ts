import { Publisher, OrderCancelledEvent, Subjects } from '@af-tickets/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled;
}
