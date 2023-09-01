import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { natsWrapper } from '../../nats-wrapper';
import { Ticket } from '../../models/ticket';

it('Returns a 404 if the provided id does not exist', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();

    const response = await request(app)
        .put(`/api/tickets/${id}`)
        .set('Cookie', global.signin())
        .send({
            title: 'dfgjnert',
            price: 20,
        })
        .expect(404);
});

it('Returns a 401 if the user is not authenticated', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();

    const response = await request(app)
        .put(`/api/tickets/${id}`)
        .send({
            title: 'dfgjnert',
            price: 20,
        })
        .expect(401);
});

it('Returns a 401 if the user does not own the ticket', async () => {
    const response = await request(app)
        .post(`/api/tickets/`)
        .set('Cookie', global.signin())
        .send({
            title: 'dfgjnert',
            price: 20,
        });

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', global.signin())
        .send({
            title: 'sgkdgkljgioejrg',
            price: 100,
        })
        .expect(401);
});

it('Returns a 400 if the user provides an invalid title or price', async () => {
    const cookie = global.signin();

    const response = await request(app)
        .post(`/api/tickets`)
        .set('Cookie', cookie)
        .send({
            title: 'dfgjnert',
            price: 20,
        });

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: '',
            price: 100,
        })
        .expect(400);

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'dgdfgdsgert3dfs',
            price: -10,
        })
        .expect(400);
});

it('Updates the ticket provided valid inputs', async () => {
    const cookie = global.signin();

    const response = await request(app)
        .post(`/api/tickets`)
        .set('Cookie', cookie)
        .send({
            title: 'dfgjnert',
            price: 20,
        });

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'My Event Ticket',
            price: 1000,
        })
        .expect(200);

    const ticketResponse = await request(app)
        .get(`/api/tickets/${response.body.id}`)
        .send({});

    expect(ticketResponse.body.title).toEqual('My Event Ticket');
    expect(ticketResponse.body.price).toEqual(1000);
});

it('published an event', async () => {
    const cookie = global.signin();

    const response = await request(app)
        .post(`/api/tickets`)
        .set('Cookie', cookie)
        .send({
            title: 'dfgjnert',
            price: 20,
        });

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'My Event Ticket',
            price: 1000,
        })
        .expect(200);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it('Rejects updates if the ticket is reserved', async () => {
    const cookie = global.signin();

    const response = await request(app)
        .post(`/api/tickets`)
        .set('Cookie', cookie)
        .send({
            title: 'dfgjnert',
            price: 20,
        });

    const ticket = await Ticket.findById(response.body.id);
    ticket!.set({ orderId: new mongoose.Types.ObjectId().toHexString() });
    await ticket!.save();

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'My Event Ticket',
            price: 1000,
        })
        .expect(400);
});
