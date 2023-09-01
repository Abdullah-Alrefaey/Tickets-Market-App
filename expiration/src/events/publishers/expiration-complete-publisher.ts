import {
    Subjects,
    Publisher,
    ExpirationCompleteEvent,
} from '@af-tickets/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
    readonly subject = Subjects.ExpirationComplete;
}
