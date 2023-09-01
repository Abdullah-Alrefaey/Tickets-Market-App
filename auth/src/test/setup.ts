import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { app } from '../app';
import request from 'supertest';

// Tell TS that there is some property called signin in the global
declare global {
    var signin: () => Promise<string[]>;
}

let mongo: any; 

// A Hook to be run before everything (at the beginning for one time)
beforeAll(async () => {
    process.env.JWT_KEY = 'asdfasdf';

    mongo = await MongoMemoryServer.create();
    const mongoUri = mongo.getUri();

    await mongoose.connect(mongoUri);
});

// A Hook to be run before each test
// Reset data between each test we run
beforeEach(async () => {
    const collections = await mongoose.connection.db.collections();

    for (let collection of collections) {
        await collection.deleteMany({});
    }
});

// Stop MongoMemoryServer
afterAll(async () => {
    await mongo.stop();
    await mongoose.connection.close();
});

// Global signin helper function to use it in other tests that requires authentication and cookies
global.signin =async () => {
    const email = 'test@test.com';
    const password = 'password';

    const response = await request(app)
        .post('/api/users/signup')
        .send({
            email, password
        })
        .expect(201);

    const cookie = response.get("Set-Cookie");

    return cookie;
};