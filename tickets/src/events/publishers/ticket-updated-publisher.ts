import { Publisher, Subjects, TicketUpdatedEvent } from '@af-tickets/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
    readonly subject = Subjects.TicketUpdated;
}
