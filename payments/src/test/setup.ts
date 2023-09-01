import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

// Tell TS that there is some property called signin in the global
declare global {
    var signin: (id?: string) => string[];
}

jest.mock('../nats-wrapper');

process.env.STRIPE_KEY =
    'sk_test_51Nl6WXASEtP5B0vGHDFVFBndGSJKmz5L0rpeLEdfHp4cXbqvTxbxf6ey9ygQjL9JmtdUkwE8vk0GUvthxGAqYrKL00L2tnNSag';

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
    jest.clearAllMocks();
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

// session=eyJqd3QiOiJleUpoYkdjaU9pSklVekkxTmlJc0luUjVjQ0k2SWtwWFZDSjkuZXlKcFpDSTZJalkwWkROallqZGpZbUZpWmpWbU5HUmtNRFprTXpFNFppSXNJbVZ0WVdsc0lqb2laR2RrWjJ4cWFIUmxha0IwWlhOMExtTnZiU0lzSW1saGRDSTZNVFk1TVRZd01UYzRPSDAuWlE5cld4VkVwZWJJT1hHTHpaNEsyY1g4ZDlKd1ZpcTRqNVVtMVJlclVRVSJ9
// Global signin helper function to use it in other tests that requires authentication and cookies
global.signin = (id?: string) => {
    // Build a JWT payload. { id, email
    const payload = {
        id: id || new mongoose.Types.ObjectId().toHexString(),
        email: 'test@test.com',
    };

    // Create the JWT
    const token = jwt.sign(payload, process.env.JWT_KEY!);

    // Build Session Object. { jwt: MY_JWT }
    const session = { jwt: token };

    // Turn that session into JSON
    const sessionJSON = JSON.stringify(session);

    // Take JSON and encode it as base64
    const base64 = Buffer.from(sessionJSON).toString('base64');

    // Return a string thats the cookie with the encoded data
    return [`session=${base64}`];
};
