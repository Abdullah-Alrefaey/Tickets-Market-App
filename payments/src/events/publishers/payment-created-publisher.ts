import { Publisher, PaymentCreatedEvent, Subjects } from '@af-tickets/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    readonly subject = Subjects.PaymentCreated;
}
