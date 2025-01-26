import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI;

let cachedDb = null;

// Reuse MongoDB connection in serverless functions
async function connectToDatabase() {
    if (cachedDb) {
        return cachedDb;
    }
    const client = await mongoose.connect(MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    cachedDb = client;
    return client;
}

const DataSchema = new mongoose.Schema({
    value: { type: String, required: true },
});
const DataModel = mongoose.models.Data || mongoose.model('Data', DataSchema);

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { value } = req.body;

        try {
            const db = await connectToDatabase();
            const newData = new DataModel({ value });
            await newData.save();
            res.status(201).json({ message: 'Data saved successfully' });
        } catch (error) {
            console.error('Error saving data:', error);
            res.status(500).json({ error: 'Failed to save data' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}
