import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || '';
const MAX_RETRIES = 3;
const RETRY_DELAY = 5000;

export const connectDB = async (): Promise<void> => {
    let retries = 0;

    while (retries < MAX_RETRIES) {
        try {
            await mongoose.connect(MONGODB_URI);
            console.log('✅ MongoDB connected successfully');
            return;
        } catch (error) {
            retries++;
            console.error(`❌ MongoDB connection attempt ${retries}/${MAX_RETRIES} failed:`, error);
            if (retries < MAX_RETRIES) {
                console.log(`⏳ Retrying in ${RETRY_DELAY / 1000}s...`);
                await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
            }
        }
    }

    console.error('❌ All MongoDB connection attempts failed. Exiting...');
    process.exit(1);
};
