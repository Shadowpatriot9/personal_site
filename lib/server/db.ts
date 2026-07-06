import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Reuse the connection across hot reloads / serverless invocations.
const globalForMongoose = globalThis as unknown as { mongooseCache?: MongooseCache };
const cached: MongooseCache = globalForMongoose.mongooseCache ?? { conn: null, promise: null };
globalForMongoose.mongooseCache = cached;

export const isDatabaseConfigured = () => Boolean(MONGO_URI);

export async function connectToDatabase() {
  if (!MONGO_URI) {
    throw new Error('MONGO_URI environment variable is not defined');
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI, {
      bufferCommands: false,
      maxPoolSize: 5,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
