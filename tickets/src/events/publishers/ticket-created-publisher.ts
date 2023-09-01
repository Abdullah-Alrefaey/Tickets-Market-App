import { Publisher, Subjects, TicketCreatedEvent } from '@af-tickets/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    readonly subject = Subjects.TicketCreated;
}
