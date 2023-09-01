import mongoose from 'mongoose';
import { app } from './app';

const start = async () => {
    // Check Env variables
    if (!process.env.JWT_KEY) {
        throw new Error('JWT_KEY must be defined!!');
    }

    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI must be defined!!');
    }

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to db successfully!');
    } catch (err) {
        console.log(err);
    }

    app.listen(3000, () => {
        console.log('Server is Listening on port 3000 !!');
    });
};

start().then((r) => console.log('Server started successfully!'));