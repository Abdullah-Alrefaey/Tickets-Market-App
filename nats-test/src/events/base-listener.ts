import { Message, Stan } from 'node-nats-streaming';
import { Subjects } from './subjects';

interface Event {
    subject: Subjects;
    data: any;
}

export abstract class Listener<T extends Event> {
    // Name of tha channel this listener is going to listen to
    abstract subject: T['subject'];

    // Name of queue group this listener will join
    abstract queueGroupName: string;

    // Function to run when a message is recieved
    abstract onMessage(data: T['data'], msg: Message): void;

    // Pre-initialized NATS client
    private client: Stan;

    // Number of seconds this listener has to ack a message
    protected ackWait = 5 * 1000;

    constructor(client: Stan) {
        this.client = client;
    }

    // Default subscription options
    subscriptionOptions() {
        return this.client
            .subscriptionOptions()
            .setDeliverAllAvailable()
            .setManualAckMode(true)
            .setAckWait(this.ackWait)
            .setDurableName(this.queueGroupName);
    }

    // Code to setup the subscription
    listen() {
        const subscription = this.client.subscribe(
            this.subject,
            this.queueGroupName,
            this.subscriptionOptions()
        );

        subscription.on('message', (msg: Message) => {
            console.log(
                `Message recieved: ${this.subject} / ${this.queueGroupName}`
            );

            const parsedData = this.parseMessage(msg);

            this.onMessage(parsedData, msg);
        });
    }

    // Helper function to parse the incoming message
    parseMessage(msg: Message) {
        const data = msg.getData();

        return typeof data === 'string'
            ? JSON.parse(data)
            : JSON.parse(data.toString('utf8'));
    }
}
