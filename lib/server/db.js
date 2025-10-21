import mongoose from 'mongoose';

const { MONGO_URI } = process.env;

if (!MONGO_URI) {
  console.warn('[database] MONGO_URI is not defined. Database operations will fail until it is configured.');
}

let cachedConnection = null;

export async function connectToDatabase() {
  if (!MONGO_URI) {
    throw new Error('Missing MONGO_URI environment variable');
  }

  if (cachedConnection) {
    return cachedConnection;
  }

  try {
    cachedConnection = await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    return cachedConnection;
  } catch (error) {
    cachedConnection = null;
    throw error;
  }
}
